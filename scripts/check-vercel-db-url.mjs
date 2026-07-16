import { readFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

execSync("npx --yes vercel@56.2.0 env pull .env.vercel.prod --environment=production --yes", {
  stdio: "inherit",
});

const raw = readFileSync(".env.vercel.prod", "utf8");
const lines = raw.split(/\r?\n/).filter((l) => l && !l.startsWith("#"));
console.log("line count", lines.length);

for (const line of lines) {
  const i = line.indexOf("=");
  if (i < 0) continue;
  const k = line.slice(0, i);
  let v = line.slice(i + 1);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1);
  }
  if (k === "DATABASE_URL") {
    console.log("DATABASE_URL length", v.length);
    console.log("has localhost", /localhost|127\.0\.0\.1/.test(v));
    console.log("starts postgres", v.startsWith("postgres"));
    const host = v.includes("@") ? v.replace(/^.*@/, "").split("/")[0] : "(no @)";
    console.log("host", host);
  }
  if (/SUPABASE|SITE|DATABASE|RESEND|EMAIL|CRON/.test(k)) {
    console.log(k, "present len", v.length);
  }
}

try {
  unlinkSync(".env.vercel.prod");
} catch {
  /* ignore */
}
