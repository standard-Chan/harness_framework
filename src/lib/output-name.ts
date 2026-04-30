import { access } from "node:fs/promises";
import path from "node:path";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function createDefaultOutputName(now = new Date()): string {
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());

  return `merged-${year}${month}${day}-${hour}${minute}${second}.pdf`;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function resolveOutputPath(requestedPath: string): Promise<string> {
  if (!(await exists(requestedPath))) {
    return requestedPath;
  }

  const parsed = path.parse(requestedPath);
  let index = 1;

  while (true) {
    const candidate = path.join(parsed.dir, `${parsed.name}-${index}${parsed.ext || ".pdf"}`);
    if (!(await exists(candidate))) {
      return candidate;
    }
    index += 1;
  }
}
