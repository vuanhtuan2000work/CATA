const { notify, readStdin, strings } = require("./pet-notify");

readStdin((input) => {
  const command = String(input.command || "");
  const output = String(input.output || input.stdout || "");
  const failed = typeof input.exit_code === "number" && input.exit_code !== 0;
  const s = strings();

  let message;
  if (/git\s+push/.test(command)) {
    message = failed ? s.pushFail : s.pushOk;
  } else if (/git\s+commit/.test(command)) {
    const match = output.match(/\]\s+(.{1,80})/);
    message = failed
      ? s.commitFail
      : s.commitOk(match ? match[1] : s.commitFallback);
  } else {
    process.exit(0);
  }

  notify(
    {
      type: "git",
      title: "Git",
      message,
      priority: failed ? "high" : "normal",
    },
    () => process.exit(0)
  );
});
