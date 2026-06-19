import fs from "node:fs";
import path from "node:path";

const FILE = path.resolve("./data/stealth-config.json");

function _read() {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf-8"));
  } catch {
    return { enabled: false };
  }
}

function _write(data) {
  const dir = path.dirname(FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

export function isStealthEnabled() {
  return _read().enabled === true;
}

export function setStealthEnabled(v) {
  const data = _read();
  data.enabled = v === true;
  _write(data);
  return data.enabled;
}

export function getStealthConfig() {
  return _read();
}
