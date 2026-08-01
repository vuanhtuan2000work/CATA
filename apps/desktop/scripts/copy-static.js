const fs = require("node:fs");
const path = require("node:path");

const src = path.join(__dirname, "..", "src", "renderer");
const dest = path.join(__dirname, "..", "dist", "renderer");

fs.mkdirSync(dest, { recursive: true });
for (const file of fs.readdirSync(src)) {
  if (file.endsWith(".html")) {
    fs.copyFileSync(path.join(src, file), path.join(dest, file));
  }
}
console.log("Copied static renderer files.");
