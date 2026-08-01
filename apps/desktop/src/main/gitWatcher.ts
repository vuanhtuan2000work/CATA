import * as fs from "node:fs";
import * as path from "node:path";
import { PetEvent } from "../shared/types";

/**
 * Watches .git/logs/HEAD of each configured repo and emits an event when a
 * new entry appears (commit, merge, pull, rebase).
 */
const watched = new Set<string>();

export function startGitWatcher(
  repos: string[],
  onEvent: (event: PetEvent) => void
): void {
  for (const repo of repos) {
    watchRepo(repo, onEvent);
  }
}

/** Returns true if the path is a git repo and is now being watched. */
export function watchRepo(repo: string, onEvent: (event: PetEvent) => void): boolean {
  const headLog = path.join(repo, ".git", "logs", "HEAD");
  if (watched.has(headLog)) return true;
  if (!fs.existsSync(headLog)) return false;
  watched.add(headLog);

  let lastLine = readLastLine(headLog);
  fs.watchFile(headLog, { interval: 2000 }, () => {
    const line = readLastLine(headLog);
    if (!line || line === lastLine) return;
    lastLine = line;
    // reflog line format: <old> <new> <author> <ts> <tz>\t<action>: <subject>
    const tabIdx = line.indexOf("\t");
    const action = tabIdx >= 0 ? line.slice(tabIdx + 1) : "activity";
    if (!/commit|merge|pull|rebase/i.test(action)) return;
    onEvent({
      type: "git",
      title: path.basename(repo),
      message: action.slice(0, 200),
      priority: "normal",
    });
  });
  return true;
}

function readLastLine(file: string): string {
  try {
    const content = fs.readFileSync(file, "utf8").trimEnd();
    const idx = content.lastIndexOf("\n");
    return idx >= 0 ? content.slice(idx + 1) : content;
  } catch {
    return "";
  }
}
