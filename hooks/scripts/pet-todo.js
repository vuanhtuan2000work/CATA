const { notify, readStdin, strings } = require("./pet-notify");

readStdin((input) => {
  const toolInput = input.tool_input || input.toolInput || {};
  const todos = Array.isArray(toolInput.todos) ? toolInput.todos : [];
  const completed = todos
    .filter((t) => t && t.status === "completed" && typeof t.content === "string")
    .map((t) => t.content);

  if (completed.length === 0) {
    process.exit(0);
  }
  const s = strings();
  const shown = completed.slice(0, 3).join(" | ");
  const extra = completed.length > 3 ? s.todoMore(completed.length - 3) : "";
  notify(
    {
      type: "todo",
      title: s.todoDone,
      message: `${shown}${extra}`,
      priority: "normal",
    },
    () => process.exit(0)
  );
});
