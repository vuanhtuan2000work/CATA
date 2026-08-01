// Shared helper: resolve locale + POST an event to the Cursor Pet local server.
const fs = require("node:fs");
const http = require("node:http");
const os = require("node:os");
const path = require("node:path");

const PORT = process.env.CURSOR_PET_PORT || 7331;

const STRINGS = {
  en: {
    agentDone: "Agent finished — come take a look!",
    todoDone: "Done",
    todoMore: (n) => ` (+${n} more)`,
    pushOk: "Pushed to remote. Nice!",
    pushFail: "Push failed... check the terminal!",
    commitOk: (s) => `Committed: ${s}`,
    commitFail: "Commit failed... check the terminal!",
    commitFallback: "new changes",
  },
  vi: {
    agentDone: "Agent đã làm xong việc — vào xem thử nhé!",
    todoDone: "Đã xong việc",
    todoMore: (n) => ` (+${n} việc nữa)`,
    pushOk: "Đã push lên remote. Tuyệt!",
    pushFail: "Push thất bại... kiểm tra terminal nhé!",
    commitOk: (s) => `Đã commit: ${s}`,
    commitFail: "Commit thất bại... kiểm tra terminal nhé!",
    commitFallback: "thay đổi mới",
  },
  zh: {
    agentDone: "Agent 完成了 — 过来看看吧！",
    todoDone: "已完成",
    todoMore: (n) => `（还有 ${n} 项）`,
    pushOk: "已推送到远程，漂亮！",
    pushFail: "推送失败...检查终端！",
    commitOk: (s) => `已提交：${s}`,
    commitFail: "提交失败...检查终端！",
    commitFallback: "新更改",
  },
  ja: {
    agentDone: "エージェントが完了しました — 確認してみて！",
    todoDone: "完了",
    todoMore: (n) => `（ほか ${n} 件）`,
    pushOk: "リモートに push しました！",
    pushFail: "push に失敗...ターミナルを確認！",
    commitOk: (s) => `コミット: ${s}`,
    commitFail: "コミット失敗...ターミナルを確認！",
    commitFallback: "新しい変更",
  },
  ko: {
    agentDone: "에이전트가 끝났어 — 확인해볼래!",
    todoDone: "완료",
    todoMore: (n) => ` (+${n}개 더)`,
    pushOk: "원격에 push 했어. 멋져!",
    pushFail: "push 실패... 터미널을 확인해!",
    commitOk: (s) => `커밋: ${s}`,
    commitFail: "커밋 실패... 터미널을 확인해!",
    commitFallback: "새 변경",
  },
};

function normalizeLocale(raw) {
  if (!raw) return "en";
  const lower = String(raw).toLowerCase();
  if (lower.startsWith("vi")) return "vi";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  return "en";
}

function readCursorLocale() {
  const file = path.join(
    process.env.APPDATA || "",
    "Cursor",
    "User",
    "locale.json"
  );
  try {
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return typeof raw.locale === "string" ? raw.locale : null;
  } catch {
    return null;
  }
}

function readPetLocale() {
  const file = path.join(
    process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
    "cursor-pet",
    "settings.json"
  );
  try {
    if (!fs.existsSync(file)) return null;
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    if (raw.locale && raw.locale !== "auto") return raw.locale;
  } catch {
    // ignore
  }
  return null;
}

function resolveLocale() {
  const forced = readPetLocale();
  if (forced) return normalizeLocale(forced);
  const cursor = readCursorLocale();
  if (cursor) return normalizeLocale(cursor);
  return normalizeLocale(process.env.LANG || process.env.LC_ALL || "en");
}

function strings() {
  const locale = resolveLocale();
  return STRINGS[locale] || STRINGS.en;
}

function notify(event, done) {
  const body = JSON.stringify(event);
  const req = http.request(
    {
      host: "127.0.0.1",
      port: PORT,
      path: "/event",
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
      timeout: 1500,
    },
    (res) => {
      res.resume();
      res.on("end", done);
    }
  );
  req.on("error", done);
  req.on("timeout", () => {
    req.destroy();
    done();
  });
  req.end(body);
}

function readStdin(cb) {
  const chunks = [];
  process.stdin.on("data", (c) => chunks.push(c));
  process.stdin.on("end", () => {
    let input = {};
    try {
      input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      // ignore
    }
    cb(input);
  });
}

module.exports = { notify, readStdin, strings, resolveLocale };
