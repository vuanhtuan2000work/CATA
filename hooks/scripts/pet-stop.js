const { notify, readStdin, strings } = require("./pet-notify");

readStdin((input) => {
  const status = input.status || input.stop_reason || "";
  if (/abort|cancel/i.test(String(status))) {
    process.exit(0);
  }
  const s = strings();
  notify(
    {
      type: "agent-done",
      title: "Cursor",
      message: s.agentDone,
      priority: "high",
    },
    () => process.exit(0)
  );
});
