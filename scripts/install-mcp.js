// Adds the cursor-pet MCP server to ~/.cursor/mcp.json (preserving other servers).
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const mcpJsonPath = path.join(os.homedir(), ".cursor", "mcp.json");
const cliPath = path.join(__dirname, "..", "packages", "mcp", "dist", "cli.js");

if (!fs.existsSync(cliPath)) {
  console.error(`MCP server not built yet. Run: npm run build -w @cursor-pet/mcp`);
  process.exit(1);
}

let config = { mcpServers: {} };
if (fs.existsSync(mcpJsonPath)) {
  try {
    config = JSON.parse(fs.readFileSync(mcpJsonPath, "utf8"));
  } catch (err) {
    console.error(`Could not parse existing ${mcpJsonPath}: ${err}`);
    process.exit(1);
  }
}
config.mcpServers = config.mcpServers || {};
config.mcpServers["cursor-pet"] = {
  command: "node",
  args: [cliPath],
};

fs.mkdirSync(path.dirname(mcpJsonPath), { recursive: true });
fs.writeFileSync(mcpJsonPath, JSON.stringify(config, null, 2), "utf8");
console.log(`Registered cursor-pet MCP server in ${mcpJsonPath}`);
