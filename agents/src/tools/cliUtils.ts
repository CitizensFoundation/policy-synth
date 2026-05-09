import path from "node:path";
import { fileURLToPath } from "node:url";

export const isCliEntrypoint = (
  moduleUrl: string,
  argv: string[] = process.argv
) => {
  const entrypoint = argv[1];
  return entrypoint
    ? path.resolve(entrypoint) === fileURLToPath(moduleUrl)
    : false;
};
