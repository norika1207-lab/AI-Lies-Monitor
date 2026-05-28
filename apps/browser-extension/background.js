const endpoint = "http://127.0.0.1:47831/api/events";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "zj:event") return false;
  fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      surface: "browser",
      sessionId: sender.tab?.url || "browser",
      role: message.role,
      content: message.content,
      meta: { url: sender.tab?.url, title: sender.tab?.title }
    })
  }).then(r => r.json()).then(sendResponse).catch(err => sendResponse({ ok: false, error: err.message }));
  return true;
});
