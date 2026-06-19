import { StealthBehavior } from "./behavior.js";
import { StealthScheduler } from "./scheduler.js";
import { MultiAccount } from "./multiaccount.js";
import { StealthContent } from "./content.js";
import { getRandomUserAgent } from "./agent.js";
import { isStealthEnabled, setStealthEnabled } from "./runtime.js";

const cfg = (obj, key, fallback) => (obj && obj[key] !== undefined ? obj[key] : fallback);

export class Stealth {
  constructor(opts = {}, accountIndex = 0) {
    const runtimeOn = isStealthEnabled();
    this.behavior = new StealthBehavior(opts);
    this.scheduler = new StealthScheduler(opts);
    this.multi = new MultiAccount(accountIndex);
    this.content = new StealthContent(cfg(opts, "variacao", {}));
    if (runtimeOn) {
      this.behavior.enabled = true;
      this.scheduler.enabled = true;
    }
  }

  get enabled() {
    return isStealthEnabled();
  }

  set enabled(v) {
    setStealthEnabled(v);
    this.behavior.enabled = v;
    this.scheduler.enabled = v;
  }

  async beforeSend(phone, client) {
    if (!this.enabled) return { allowed: true };

    if (!this.scheduler.isWithinBusinessHours()) {
      return { allowed: false, reason: "OUT_OF_HOURS", message: "Fora do horário comercial." };
    }
    if (!this.scheduler.checkDailyLimit()) {
      return { allowed: false, reason: "DAILY_LIMIT", message: "Limite diário atingido." };
    }
    if (!this.scheduler.checkContactWindow(phone)) {
      return { allowed: false, reason: "CONTACT_WINDOW", message: "Janela de 24h não expirada." };
    }

    await this.behavior.variableDelay();
    await this.behavior.checkRandomPause();
    await this.behavior.simulateTyping(client, phone);

    return { allowed: true };
  }

  async getPuppeteerConfig(base) {
    if (!this.enabled) return base;
    const sp = cfg(this.behavior.opts, "stealthPlugin", true);
    const ua = cfg(this.behavior.opts, "userAgentRotation", true);
    const res = { ...base };
    if (ua) {
      const args = [...(res.args || [])];
      args.push(`--user-agent=${getRandomUserAgent()}`);
      res.args = args;
    }
    if (sp) {
      try {
        const { default: puppeteerExtra } = await import("puppeteer-extra");
        const { default: StealthPlugin } = await import("puppeteer-extra-plugin-stealth");
        puppeteerExtra.use(StealthPlugin());
        res.puppeteer = puppeteerExtra;
      } catch {
      }
    }
    return res;
  }

  async afterSend(phone) {
    if (!this.enabled) return;
    this.scheduler.incrementDailyCount();
    this.scheduler.updateContactWindow(phone);
  }

  reset() {
    this.behavior.reset();
  }
}
