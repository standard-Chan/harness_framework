import { readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { mergePdfBuffers } from "@/lib/merge";
import { createDefaultOutputName, resolveOutputPath } from "@/lib/output-name";
import { validatePdfInputs, validationMessage } from "@/lib/validation";
import type { PdfInputMetadata, PdfMergeInput } from "@/types";

type CliIo = {
  stdout: Pick<NodeJS.WriteStream, "write">;
  stderr: Pick<NodeJS.WriteStream, "write">;
  cwd: string;
  now?: Date;
};

type ParsedArgs = {
  inputs: string[];
  output?: string;
};

function parseArgs(argv: string[]): ParsedArgs {
  const inputs: string[] = [];
  let output: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "-o" || arg === "--output") {
      output = argv[index + 1];
      index += 1;
      continue;
    }
    inputs.push(arg);
  }

  return { inputs, output };
}

async function readInput(filePath: string): Promise<PdfMergeInput> {
  const info = await stat(filePath);
  const data = await readFile(filePath);

  return {
    name: path.basename(filePath),
    size: info.size,
    data: new Uint8Array(data),
  };
}

export async function runCli(argv: string[], io: CliIo): Promise<number> {
  const parsed = parseArgs(argv);
  const inputs: PdfMergeInput[] = [];

  for (const inputPath of parsed.inputs) {
    try {
      inputs.push(await readInput(inputPath));
    } catch (error) {
      const reason = error instanceof Error ? error.message : "파일을 읽을 수 없습니다.";
      io.stderr.write(`${inputPath}: 입력 파일을 읽을 수 없습니다. ${reason}\n`);
      return 1;
    }
  }

  const metadata: PdfInputMetadata[] = inputs.map(({ name, size, type }) => ({
    name,
    size,
    type,
  }));
  const validation = validatePdfInputs(metadata);
  if (!validation.ok) {
    io.stderr.write(`${validationMessage(validation)}\n`);
    return 1;
  }

  try {
    const outputName = parsed.output ?? createDefaultOutputName(io.now);
    const requestedPath = path.resolve(io.cwd, outputName);
    const outputPath = await resolveOutputPath(requestedPath);
    const merged = await mergePdfBuffers(inputs);

    await writeFile(outputPath, merged);
    io.stdout.write(`${outputPath}\n`);
    return 0;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "알 수 없는 병합 오류";
    io.stderr.write(`PDF 병합에 실패했습니다. ${reason}\n`);
    return 1;
  }
}

const isMain = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isMain) {
  runCli(process.argv.slice(2), {
    stdout: process.stdout,
    stderr: process.stderr,
    cwd: process.cwd(),
  }).then((code) => {
    process.exitCode = code;
  });
}
