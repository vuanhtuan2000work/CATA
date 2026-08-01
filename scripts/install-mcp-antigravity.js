// Adds the cata MCP server to ~/.gemini/config/mcp_config.json (Google Antigravity MCP config).
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const mcpConfigPath = path.join(os.homedir(), ".gemini", "config", "mcp_config.json");
const cliPath = path.join(__dirname, "..", "packages", "mcp", "dist", "cli.js");

if (!fs.existsSync(cliPath)) {
  console.error(`MCP server not built yet. Run: npm run build -w @cata/mcp`);
  process.exit(1);
}

let config = { mcpServers: {} };
if (fs.existsSync(mcpConfigPath)) {
  try {
    config = JSON.parse(fs.readFileSync(mcpConfigPath, "utf8"));
  } catch (err) {
    console.error(`Could not parse existing ${mcpConfigPath}: ${err}`);
    process.exit(1);
  }
}
config.mcpServers = config.mcpServers || {};
config.mcpServers["cata"] = {
  command: "node",
  args: [cliPath],
};

fs.mkdirSync(path.dirname(mcpConfigPath), { recursive: true });
fs.writeFileSync(mcpConfigPath, JSON.stringify(config, null, 2), "utf8");
console.log(`Registered cata MCP server in Antigravity (${mcpConfigPath})`);
