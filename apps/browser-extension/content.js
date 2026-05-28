const seen = new WeakSet();
const textSeen = new Set();

const selectors = [
  "[data-message-author-role]",
  "[data-testid='conversation-turn']",
  ".group\\/conversation-turn",
  "article",
  "main [role='article']"
];

scan();
new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });

function scan() {
  for (const selector of selectors) {
    document.querySelectorAll(selector).forEach(node => inspectNode(node));
  }
}

function inspectNode(node) {
  if (seen.has(node)) return;
  const text = normalizeText(node.innerText || node.textContent || "");
  if (text.length < 8) return;
  const role = inferRole(node);
  if (!role) return;
  const key = `${role}:${text.slice(0, 500)}`;
  if (textSeen.has(key)) return;
  seen.add(node);
  textSeen.add(key);
  chrome.runtime.sendMessage({ type: "zj:event", role, content: text });
}

function inferRole(node) {
  const explicit = node.getAttribute("data-message-author-role");
  if (explicit === "user" || explicit === "assistant") return explicit;
  const aria = `${node.getAttribute("aria-label") || ""} ${node.className || ""}`.toLowerCase();
  if (/user|human|you/.test(aria)) return "user";
  if (/assistant|chatgpt|claude|gemini|model/.test(aria)) return "assistant";

  const text = normalizeText(node.innerText || "");
  if (/^(你|You)\n/.test(text)) return "user";
  if (/^(ChatGPT|Claude|Gemini|Assistant)\n/.test(text)) return "assistant";
  return null;
}

function normalizeText(text) {
  return String(text).replace(/\s+/g, " ").trim();
}
