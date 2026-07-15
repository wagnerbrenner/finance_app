const PROD_FALLBACK = "https://finance-app-nine-blush.vercel.app";

/** Base URL absoluta do app (confirmação de e-mail, links em e-mails). */
export function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (raw) return raw;
  if (process.env.VERCEL_ENV === "production") return PROD_FALLBACK;
  return "http://localhost:3000";
}
