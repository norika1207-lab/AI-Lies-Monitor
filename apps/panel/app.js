const api = location.origin;
const alertsEl = document.querySelector("#alerts");
const promisesEl = document.querySelector("#promises");
const checkNow = document.querySelector("#checkNow");

checkNow.addEventListener("click", async () => {
  await fetch(`${api}/api/check-now`, { method: "POST" });
  await refresh();
});

setInterval(refresh, 3000);
refresh();

async function refresh() {
  const state = await fetch(`${api}/api/state`).then(r => r.json());
  renderAlerts(state.alerts || []);
  renderPromises(state.sessions || {});
}

function renderAlerts(alerts) {
  const latest = alerts.slice().reverse().slice(0, 80);
  alertsEl.innerHTML = latest.length ? latest.map(alertCard).join("") : empty("No alerts yet.");
}

function renderPromises(sessions) {
  const promises = Object.values(sessions)
    .flatMap(s => s.promises.map(p => ({ ...p, sessionId: s.sessionId })))
    .filter(p => p.status !== "fulfilled")
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 80);
  promisesEl.innerHTML = promises.length ? promises.map(promiseCard).join("") : empty("No open promises.");
}

function alertCard(a) {
  return `
    <article class="item">
      <div class="meta">
        <span class="pill ${escapeHtml(a.severity)}">${escapeHtml(a.severity)}</span>
        <span>${escapeHtml(a.type)}</span>
        <span>${new Date(a.createdAt).toLocaleTimeString()}</span>
      </div>
      <div class="quote">${escapeHtml(a.message)}</div>
      <div class="quote">AI: ${escapeHtml(a.statement || "")}</div>
      <div class="reply">${escapeHtml(a.suggestedReply || "")}</div>
    </article>
  `;
}

function promiseCard(p) {
  const reqs = (p.evidenceRequired || []).map(r => r.path || r.type).join(" / ") || "generic evidence";
  return `
    <article class="item">
      <div class="meta">
        <span class="pill mid">${escapeHtml(p.status)}</span>
        <span>${escapeHtml(p.surface)}</span>
        <span>${new Date(p.createdAt).toLocaleTimeString()}</span>
      </div>
      <div class="quote">${escapeHtml(p.statement)}</div>
      <div class="reply">Required evidence: ${escapeHtml(reqs)}</div>
    </article>
  `;
}

function empty(text) {
  return `<div class="item"><div class="quote">${escapeHtml(text)}</div></div>`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  })[ch]);
}
