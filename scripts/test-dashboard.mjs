import { config } from "dotenv";
config({ path: ".env.local", override: true });

const userId = "c584251d-ce80-4ada-b391-7c2531003375";

async function main() {
  const { getDashboard } = await import("../src/server/services/dashboard.service.ts");
  const { getDueNotifications } = await import("../src/server/services/notifications.service.ts");

  console.log("running getDashboard...");
  const d = await getDashboard(userId);
  console.log("dashboard ok", {
    projected: d.kpis.projectedYearEndBalance,
    cashFlow: d.cashFlow.length,
    insights: d.insights.length,
  });

  console.log("running getDueNotifications...");
  const n = await getDueNotifications(userId);
  console.log("notifications ok", n.length);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("FAIL", e);
    process.exit(1);
  });
