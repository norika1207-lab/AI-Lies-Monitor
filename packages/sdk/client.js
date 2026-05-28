const defaultEndpoint = process.env.ZJ_ENDPOINT || "http://127.0.0.1:47831/api/events";

export class ZhaoyaoJingClient {
  constructor(options = {}) {
    this.endpoint = options.endpoint || defaultEndpoint;
    this.surface = options.surface || process.env.ZJ_SURFACE || "service";
    this.sessionId = options.sessionId || process.env.ZJ_SESSION_ID || process.cwd();
  }

  user(content, meta = {}) {
    return this.send({ role: "user", content, meta });
  }

  assistant(content, meta = {}) {
    return this.send({ role: "assistant", content, meta });
  }

  tool(content, meta = {}) {
    return this.send({ role: "tool", content, meta });
  }

  file(filePath, meta = {}) {
    return this.send({ role: "file", content: filePath, meta });
  }

  process(content, meta = {}) {
    return this.send({ role: "process", content, meta });
  }

  async send(event) {
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          surface: this.surface,
          sessionId: this.sessionId,
          ...event
        })
      });
      return await res.json();
    } catch (err) {
      if (process.env.ZJ_DEBUG) console.error("[zhaoyao-jing]", err.message);
      return { ok: false, error: err.message };
    }
  }
}

export const zhaoyao = new ZhaoyaoJingClient();
