import { config } from "dotenv";
import { writeFileSync, unlinkSync } from "fs";
import { execSync } from "child_process";

config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("No DATABASE_URL in .env.local");
  process.exit(1);
}

console.log("local DATABASE_URL host:", url.replace(/^.*@/, "").split("/")[0]);

// Remove existing production DATABASE_URL if present, then add fresh
try {
  execSync("npx --yes vercel@56.2.0 env rm DATABASE_URL production -y", { stdio: "inherit" });
} catch {
  console.log("rm production skipped/failed (may not exist)");
}
try {
  execSync("npx --yes vercel@56.2.0 env rm DATABASE_URL preview -y", { stdio: "inherit" });
} catch {
  console.log("rm preview skipped");
}
try {
  execSync("npx --yes vercel@56.2.0 env rm DATABASE_URL development -y", { stdio: "inherit" });
} catch {
  console.log("rm development skipped");
}

writeFileSync(".tmp-db-url.txt", url);
try {
  // vercel env add reads value from stdin
  execSync("npx --yes vercel@56.2.0 env add DATABASE_URL production", {
    input: url,
    stdio: ["pipe", "inherit", "inherit"],
  });
  execSync("npx --yes vercel@56.2.0 env add DATABASE_URL preview", {
    input: url,
    stdio: ["pipe", "inherit", "inherit"],
  });
  execSync("npx --yes vercel@56.2.0 env add DATABASE_URL development", {
    input: url,
    stdio: ["pipe", "inherit", "inherit"],
  });
  console.log("DATABASE_URL set for production, preview, development");
} finally {
  try {
    unlinkSync(".tmp-db-url.txt");
  } catch {
    /* ignore */
  }
}
