export type AppLocale = "en" | "vi" | "zh" | "ja" | "ko";

export type MessageKey =
  | "welcome"
  | "reminderSaved"
  | "watchingRepo"
  | "notGitRepo"
  | "reminderTitle"
  | "agentDone"
  | "todoDone"
  | "todoMore"
  | "pushOk"
  | "pushFail"
  | "commitOk"
  | "commitFail"
  | "commitFallback"
  | "greeting1"
  | "greeting2"
  | "greeting3"
  | "greeting4"
  | "trayHide"
  | "trayShow"
  | "trayAddReminder"
  | "trayWatchGit"
  | "trayFollowCursor"
  | "trayMute"
  | "trayLaunchOs"
  | "trayQuit"
  | "trayLanguage"
  | "trayLanguageAuto"
  | "trayChat"
  | "chatPlaceholder"
  | "chatSend"
  | "chatHint"
  | "chatAck"
  | "chatWelcome"
  | "chatReminderSet"
  | "remTitle"
  | "remHeading"
  | "remMsgLabel"
  | "remMsgPlaceholder"
  | "remAtLabel"
  | "remCancel"
  | "remSave";

type Dict = Record<MessageKey, string>;

const en: Dict = {
  welcome:
    "Hi! I'm your Cursor pet. Right-click the tray icon to add reminders — or double-click me to chat.",
  reminderSaved: "Got it! I'll remind you when it's time.",
  watchingRepo: "I'll keep an eye on {repo}!",
  notGitRepo: "{repo} doesn't look like a git repo.",
  reminderTitle: "Reminder",
  agentDone: "Agent finished — come take a look!",
  todoDone: "Done",
  todoMore: " (+{n} more)",
  pushOk: "Pushed to remote. Nice!",
  pushFail: "Push failed... check the terminal!",
  commitOk: "Committed: {subject}",
  commitFail: "Commit failed... check the terminal!",
  commitFallback: "new changes",
  greeting1: "Meow! I'm watching your tasks.",
  greeting2: "Need a reminder? Double-click me or use the tray menu!",
  greeting3: "Back to work — I'll ping you when something finishes.",
  greeting4: "Purr... everything looks fine so far.",
  trayHide: "Hide pet",
  trayShow: "Show pet",
  trayAddReminder: "Add reminder...",
  trayWatchGit: "Watch a git repo...",
  trayFollowCursor: "Follow cursor",
  trayMute: "Mute sounds",
  trayLaunchOs: "Start with {os}",
  trayQuit: "Quit",
  trayLanguage: "Language",
  trayLanguageAuto: "Auto (Cursor / system)",
  trayChat: "Chat inbox...",
  chatPlaceholder: "Type to the pet...",
  chatSend: "Send",
  chatHint: "Try: remind me in 10m to review the PR",
  chatAck: "Noted! ({text})",
  chatWelcome: "Hi! Leave a note or set a reminder here.",
  chatReminderSet: "Okay — I'll remind you in {minutes} min: {message}",
  remTitle: "Add reminder",
  remHeading: "What should the pet remind you about?",
  remMsgLabel: "Message",
  remMsgPlaceholder: "e.g. Review the PR before 5pm",
  remAtLabel: "Time (leave blank = soon)",
  remCancel: "Cancel",
  remSave: "Add reminder",
};

const vi: Dict = {
  welcome:
    "Chào bạn! Mình là pet của Cursor. Chuột phải icon khay hệ thống để thêm lời nhắc — hoặc double-click mình để chat.",
  reminderSaved: "Đã ghi nhớ! Đến giờ mình sẽ nhắc bạn.",
  watchingRepo: "Mình sẽ để mắt tới {repo} nhé!",
  notGitRepo: "{repo} không phải là repo git.",
  reminderTitle: "Nhắc nhở",
  agentDone: "Agent đã làm xong việc — vào xem thử nhé!",
  todoDone: "Đã xong việc",
  todoMore: " (+{n} việc nữa)",
  pushOk: "Đã push lên remote. Tuyệt!",
  pushFail: "Push thất bại... kiểm tra terminal nhé!",
  commitOk: "Đã commit: {subject}",
  commitFail: "Commit thất bại... kiểm tra terminal nhé!",
  commitFallback: "thay đổi mới",
  greeting1: "Meo! Mình đang canh chừng công việc cho bạn đây.",
  greeting2: "Cần mình nhớ giúp gì không? Double-click mình hoặc mở menu tray nhé!",
  greeting3: "Làm việc tiếp thôi! Có gì xong mình sẽ báo liền.",
  greeting4: "Grừ grừ... mọi thứ vẫn ổn cả.",
  trayHide: "Ẩn pet",
  trayShow: "Hiện pet",
  trayAddReminder: "Thêm lời nhắc...",
  trayWatchGit: "Theo dõi repo git...",
  trayFollowCursor: "Đi theo con trỏ chuột",
  trayMute: "Tắt âm thanh",
  trayLaunchOs: "Khởi động cùng {os}",
  trayQuit: "Thoát",
  trayLanguage: "Ngôn ngữ",
  trayLanguageAuto: "Tự động (Cursor / hệ thống)",
  trayChat: "Hộp chat...",
  chatPlaceholder: "Nhắn với pet...",
  chatSend: "Gửi",
  chatHint: "Thử: nhắc 10 phút review PR",
  chatAck: "Đã nhận! ({text})",
  chatWelcome: "Chào! Để lại ghi chú hoặc lời nhắc ở đây nhé.",
  chatReminderSet: "Ok — mình sẽ nhắc sau {minutes} phút: {message}",
  remTitle: "Thêm lời nhắc",
  remHeading: "Bạn muốn pet nhắc điều gì?",
  remMsgLabel: "Nội dung",
  remMsgPlaceholder: "VD: Review PR trước 5 giờ chiều",
  remAtLabel: "Thời gian (bỏ trống = nhắc sớm)",
  remCancel: "Hủy",
  remSave: "Thêm lời nhắc",
};

const zh: Dict = {
  welcome: "嗨！我是你的 Cursor 宠物。右键托盘图标添加提醒，或双击我开始聊天。",
  reminderSaved: "记下了！到时间我会提醒你。",
  watchingRepo: "我会盯着 {repo}！",
  notGitRepo: "{repo} 看起来不是 git 仓库。",
  reminderTitle: "提醒",
  agentDone: "Agent 完成了 — 过来看看吧！",
  todoDone: "已完成",
  todoMore: "（还有 {n} 项）",
  pushOk: "已推送到远程，漂亮！",
  pushFail: "推送失败...检查终端！",
  commitOk: "已提交：{subject}",
  commitFail: "提交失败...检查终端！",
  commitFallback: "新更改",
  greeting1: "喵！我在帮你盯着任务。",
  greeting2: "需要提醒？双击我或用托盘菜单！",
  greeting3: "继续加油 — 有进展我会叫你。",
  greeting4: "呼噜...目前一切顺利。",
  trayHide: "隐藏宠物",
  trayShow: "显示宠物",
  trayAddReminder: "添加提醒...",
  trayWatchGit: "监视 git 仓库...",
  trayFollowCursor: "跟随鼠标",
  trayMute: "静音",
  trayLaunchOs: "随 {os} 启动",
  trayQuit: "退出",
  trayLanguage: "语言",
  trayLanguageAuto: "自动（Cursor / 系统）",
  trayChat: "聊天收件箱...",
  chatPlaceholder: "跟宠物说话...",
  chatSend: "发送",
  chatHint: "试试：remind me in 10m to review the PR",
  chatAck: "收到！（{text}）",
  chatWelcome: "嗨！在这里留言或设置提醒。",
  chatReminderSet: "好 — {minutes} 分钟后提醒你：{message}",
  remTitle: "添加提醒",
  remHeading: "想让宠物提醒你什么？",
  remMsgLabel: "内容",
  remMsgPlaceholder: "例如：下午5点前 review PR",
  remAtLabel: "时间（留空 = 稍后）",
  remCancel: "取消",
  remSave: "添加提醒",
};

const ja: Dict = {
  welcome:
    "こんにちは！Cursor のペットです。トレイからリマインダーを追加するか、ダブルクリックでチャットできます。",
  reminderSaved: "覚えました！時間になったらお知らせします。",
  watchingRepo: "{repo} を見守ります！",
  notGitRepo: "{repo} は git リポジトリではなさそうです。",
  reminderTitle: "リマインダー",
  agentDone: "エージェントが完了しました — 確認してみて！",
  todoDone: "完了",
  todoMore: "（ほか {n} 件）",
  pushOk: "リモートに push しました！",
  pushFail: "push に失敗...ターミナルを確認！",
  commitOk: "コミット: {subject}",
  commitFail: "コミット失敗...ターミナルを確認！",
  commitFallback: "新しい変更",
  greeting1: "にゃん！タスクを見守っています。",
  greeting2: "リマインダーが必要？ダブルクリックかトレイメニューへ！",
  greeting3: "作業を続けて — 終わったら知らせます。",
  greeting4: "ごろごろ...今のところ順調です。",
  trayHide: "ペットを隠す",
  trayShow: "ペットを表示",
  trayAddReminder: "リマインダーを追加...",
  trayWatchGit: "git リポジトリを監視...",
  trayFollowCursor: "カーソルを追う",
  trayMute: "ミュート",
  trayLaunchOs: "{os} と一緒に起動",
  trayQuit: "終了",
  trayLanguage: "言語",
  trayLanguageAuto: "自動（Cursor / システム）",
  trayChat: "チャット受信箱...",
  chatPlaceholder: "ペットに話しかける...",
  chatSend: "送信",
  chatHint: "例: remind me in 10m to review the PR",
  chatAck: "了解！（{text}）",
  chatWelcome: "こんにちは！メモやリマインダーをどうぞ。",
  chatReminderSet: "OK — {minutes} 分後にリマインド: {message}",
  remTitle: "リマインダーを追加",
  remHeading: "何をリマインドしますか？",
  remMsgLabel: "内容",
  remMsgPlaceholder: "例: 17時までに PR をレビュー",
  remAtLabel: "時間（空欄 = まもなく）",
  remCancel: "キャンセル",
  remSave: "追加",
};

const ko: Dict = {
  welcome:
    "안녕! 나는 Cursor 펫이야. 트레이에서 알림을 추가하거나 더블클릭해서 채팅해 봐.",
  reminderSaved: "기억할게! 시간이 되면 알려줄게.",
  watchingRepo: "{repo}를 지켜볼게!",
  notGitRepo: "{repo}는 git 저장소가 아닌 것 같아.",
  reminderTitle: "알림",
  agentDone: "에이전트가 끝났어 — 확인해볼래!",
  todoDone: "완료",
  todoMore: " (+{n}개 더)",
  pushOk: "원격에 push 했어. 멋져!",
  pushFail: "push 실패... 터미널을 확인해!",
  commitOk: "커밋: {subject}",
  commitFail: "커밋 실패... 터미널을 확인해!",
  commitFallback: "새 변경",
  greeting1: "야옹! 작업을 지켜보고 있어.",
  greeting2: "알림이 필요해? 더블클릭하거나 트레이 메뉴를 써!",
  greeting3: "계속 작업해 — 끝나면 알려줄게.",
  greeting4: "그르르... 아직은 괜찮아 보여.",
  trayHide: "펫 숨기기",
  trayShow: "펫 보이기",
  trayAddReminder: "알림 추가...",
  trayWatchGit: "git 저장소 감시...",
  trayFollowCursor: "커서 따라가기",
  trayMute: "음소거",
  trayLaunchOs: "{os}와 함께 시작",
  trayQuit: "종료",
  trayLanguage: "언어",
  trayLanguageAuto: "자동 (Cursor / 시스템)",
  trayChat: "채팅 받은편지함...",
  chatPlaceholder: "펫에게 말하기...",
  chatSend: "보내기",
  chatHint: "예: remind me in 10m to review the PR",
  chatAck: "알겠어! ({text})",
  chatWelcome: "안녕! 여기에 메모나 알림을 남겨 봐.",
  chatReminderSet: "좋아 — {minutes}분 뒤에 알려줄게: {message}",
  remTitle: "알림 추가",
  remHeading: "무엇을 알려줄까?",
  remMsgLabel: "내용",
  remMsgPlaceholder: "예: 오후 5시 전에 PR 리뷰",
  remAtLabel: "시간 (비우면 = 곧)",
  remCancel: "취소",
  remSave: "추가",
};

const TABLES: Record<AppLocale, Dict> = { en, vi, zh, ja, ko };

export function normalizeLocale(raw: string | undefined | null): AppLocale {
  if (!raw) return "en";
  const lower = raw.toLowerCase().replace("_", "-");
  if (lower.startsWith("vi")) return "vi";
  if (lower.startsWith("zh")) return "zh";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("ko")) return "ko";
  if (lower.startsWith("en")) return "en";
  return "en";
}

export function t(
  locale: AppLocale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let text = TABLES[locale][key] ?? TABLES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export function greetingKeys(): MessageKey[] {
  return ["greeting1", "greeting2", "greeting3", "greeting4"];
}
