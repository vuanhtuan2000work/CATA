// Installs Cursor Pet user hooks into ~/.cursor/hooks.json and
// copies the hook scripts to ~/.cursor/hooks/cursor-pet/.
// Existing unrelated hooks are preserved.
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const cursorDir = path.join(os.homedir(), ".cursor");
const hooksJsonPath = path.join(cursorDir, "hooks.json");
const targetDir = path.join(cursorDir, "hooks", "cursor-pet");
const sourceDir = path.join(__dirname, "scripts");

fs.mkdirSync(targetDir, { recursive: true });
for (const file of fs.readdirSync(sourceDir)) {
  fs.copyFileSync(path.join(sourceDir, file), path.join(targetDir, file));
}

let config = { version: 1, hooks: {} };
if (fs.existsSync(hooksJsonPath)) {
  try {
    config = JSON.parse(fs.readFileSync(hooksJsonPath, "utf8"));
  } catch (err) {
    console.error(`Could not parse existing ${hooksJsonPath}: ${err}`);
    process.exit(1);
  }
}
config.version = config.version || 1;
config.hooks = config.hooks || {};

// User hooks run from ~/.cursor/, so paths are relative to that directory.
const entries = {
  stop: { command: "node hooks/cursor-pet/pet-stop.js", timeout: 10 },
  postToolUse: {
    command: "node hooks/cursor-pet/pet-todo.js",
    matcher: "TodoWrite",
    timeout: 10,
  },
  afterShellExecution: {
    command: "node hooks/cursor-pet/pet-git.js",
    matcher: "git (commit|push)",
    timeout: 10,
  },
};

for (const [event, entry] of Object.entries(entries)) {
  const list = Array.isArray(config.hooks[event]) ? config.hooks[event] : [];
  const filtered = list.filter(
    (h) => !(h && typeof h.command === "string" && h.command.includes("cursor-pet"))
  );
  filtered.push(entry);
  config.hooks[event] = filtered;
}

fs.writeFileSync(hooksJsonPath, JSON.stringify(config, null, 2), "utf8");
console.log(`Installed Cursor Pet hooks:`);
console.log(`  scripts -> ${targetDir}`);
console.log(`  config  -> ${hooksJsonPath}`);
console.log(`Cursor reloads hooks.json automatically; restart Cursor if hooks don't fire.`);
