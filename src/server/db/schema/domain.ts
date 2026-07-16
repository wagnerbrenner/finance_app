import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const audit = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
};

export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("checking"),
  institution: text("institution"),
  initialBalance: numeric("initial_balance", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  color: text("color"),
  isActive: boolean("is_active").notNull().default(true),
  ...audit,
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("expense"),
  icon: text("icon"),
  color: text("color"),
  ...audit,
});

export const creditCards = pgTable("credit_cards", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  limitAmount: numeric("limit_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  closingDay: integer("closing_day").notNull().default(1),
  dueDay: integer("due_day").notNull().default(10),
  accountId: uuid("account_id"),
  color: text("color"),
  isActive: boolean("is_active").notNull().default(true),
  ...audit,
});

export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  accountId: uuid("account_id"),
  categoryId: uuid("category_id"),
  creditCardId: uuid("credit_card_id"),
  goalId: uuid("goal_id"),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  date: date("date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("cleared"),
  isTransfer: boolean("is_transfer").notNull().default(false),
  transferAccountId: uuid("transfer_account_id"),
  notes: text("notes"),
  ...audit,
});

export const recurrences = pgTable("recurrences", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  accountId: uuid("account_id"),
  categoryId: uuid("category_id"),
  creditCardId: uuid("credit_card_id"),
  type: text("type").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  description: text("description").notNull().default(""),
  frequency: text("frequency").notNull().default("monthly"),
  dayOfMonth: integer("day_of_month").default(1),
  startDate: date("start_date", { mode: "string" }).notNull(),
  endDate: date("end_date", { mode: "string" }),
  isActive: boolean("is_active").notNull().default(true),
  ...audit,
});

export const installments = pgTable("installments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  creditCardId: uuid("credit_card_id"),
  accountId: uuid("account_id"),
  categoryId: uuid("category_id"),
  description: text("description").notNull(),
  totalAmount: numeric("total_amount", { precision: 14, scale: 2 }).notNull(),
  installmentAmount: numeric("installment_amount", {
    precision: 14,
    scale: 2,
  }).notNull(),
  totalInstallments: integer("total_installments").notNull(),
  paidInstallments: integer("paid_installments").notNull().default(0),
  startDate: date("start_date", { mode: "string" }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  ...audit,
});

export const cardInvoices = pgTable("card_invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  creditCardId: uuid("credit_card_id").notNull(),
  referenceMonth: date("reference_month", { mode: "string" }).notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull().default("0"),
  dueDate: date("due_date", { mode: "string" }).notNull(),
  status: text("status").notNull().default("open"),
  paidAt: date("paid_at", { mode: "string" }),
  ...audit,
});

export const debts = pgTable("debts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  creditor: text("creditor"),
  originalAmount: numeric("original_amount", { precision: 14, scale: 2 }).notNull(),
  balance: numeric("balance", { precision: 14, scale: 2 }).notNull(),
  interestRate: numeric("interest_rate", { precision: 8, scale: 4 })
    .notNull()
    .default("0"),
  totalInstallments: integer("total_installments"),
  currentInstallment: integer("current_installment").default(0),
  installmentAmount: numeric("installment_amount", { precision: 14, scale: 2 }),
  startDate: date("start_date", { mode: "string" }),
  dueDate: date("due_date", { mode: "string" }),
  type: text("type").notNull().default("other"),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
  ...audit,
});

export const goals = pgTable("goals", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("other"),
  targetAmount: numeric("target_amount", { precision: 14, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  monthlyContribution: numeric("monthly_contribution", {
    precision: 14,
    scale: 2,
  })
    .notNull()
    .default("0"),
  deadline: date("deadline", { mode: "string" }),
  notes: text("notes"),
  ...audit,
});

export const investments = pgTable("investments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull().default("other"),
  ticker: text("ticker"),
  quantity: numeric("quantity", { precision: 18, scale: 8 }).notNull().default("0"),
  averagePrice: numeric("average_price", { precision: 14, scale: 4 })
    .notNull()
    .default("0"),
  currentPrice: numeric("current_price", { precision: 14, scale: 4 })
    .notNull()
    .default("0"),
  expectedYield: numeric("expected_yield", { precision: 8, scale: 4 })
    .notNull()
    .default("0"),
  notes: text("notes"),
  ...audit,
});

export const investmentContributions = pgTable("investment_contributions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  investmentId: uuid("investment_id").notNull(),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  quantity: numeric("quantity", { precision: 18, scale: 8 }),
  date: date("date", { mode: "string" }).notNull(),
  notes: text("notes"),
  ...audit,
});

export const uberPeriods = pgTable(
  "uber_periods",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    source: text("source").notNull().default("uber"),
    periodMonth: date("period_month", { mode: "string" }).notNull(),
    grossRevenue: numeric("gross_revenue", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    daysWorked: integer("days_worked").notNull().default(0),
    hoursWorked: numeric("hours_worked", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    kmDriven: numeric("km_driven", { precision: 10, scale: 2 }).notNull().default("0"),
    fuelCost: numeric("fuel_cost", { precision: 14, scale: 2 }).notNull().default("0"),
    fuelPrice: numeric("fuel_price", { precision: 14, scale: 4 }).notNull().default("0"),
    vehicleConsumption: numeric("vehicle_consumption", { precision: 8, scale: 2 })
      .notNull()
      .default("0"),
    tolls: numeric("tolls", { precision: 14, scale: 2 }).notNull().default("0"),
    wash: numeric("wash", { precision: 14, scale: 2 }).notNull().default("0"),
    maintenance: numeric("maintenance", { precision: 14, scale: 2 }).notNull().default("0"),
    oilChange: numeric("oil_change", { precision: 14, scale: 2 }).notNull().default("0"),
    tires: numeric("tires", { precision: 14, scale: 2 }).notNull().default("0"),
    insurance: numeric("insurance", { precision: 14, scale: 2 }).notNull().default("0"),
    ipva: numeric("ipva", { precision: 14, scale: 2 }).notNull().default("0"),
    licensing: numeric("licensing", { precision: 14, scale: 2 }).notNull().default("0"),
    depreciation: numeric("depreciation", { precision: 14, scale: 2 }).notNull().default("0"),
    vehicleRent: numeric("vehicle_rent", { precision: 14, scale: 2 }).notNull().default("0"),
    otherCosts: numeric("other_costs", { precision: 14, scale: 2 }).notNull().default("0"),
    notes: text("notes"),
    ...audit,
  },
  (t) => [
    uniqueIndex("uber_periods_user_source_month_uidx").on(t.userId, t.source, t.periodMonth),
  ],
);

export const recurringBills = pgTable("recurring_bills", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  accountId: uuid("account_id"),
  categoryId: uuid("category_id"),
  dayOfMonth: integer("day_of_month").notNull().default(1),
  estimatedAmount: numeric("estimated_amount", { precision: 14, scale: 2 })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  notes: text("notes"),
  ...audit,
});

export const recurringBillOccurrences = pgTable(
  "recurring_bill_occurrences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    billId: uuid("bill_id").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    expectedAmount: numeric("expected_amount", { precision: 14, scale: 2 })
      .notNull()
      .default("0"),
    actualAmount: numeric("actual_amount", { precision: 14, scale: 2 }),
    status: text("status").notNull().default("scheduled"),
    transactionId: uuid("transaction_id"),
    notifiedAt: timestamp("notified_at", { withTimezone: true, mode: "date" }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true, mode: "date" }),
    ...audit,
  },
  (t) => [uniqueIndex("recurring_bill_occurrences_bill_due_uidx").on(t.billId, t.dueDate)],
);

export const consortia = pgTable("consortia", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  administrator: text("administrator"),
  groupNumber: text("group_number"),
  letterNumber: text("letter_number"),
  creditAmount: numeric("credit_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  installmentAmount: numeric("installment_amount", { precision: 14, scale: 2 }).notNull().default("0"),
  totalInstallments: integer("total_installments").notNull().default(0),
  paidInstallments: integer("paid_installments").notNull().default(0),
  nextDueDate: date("next_due_date", { mode: "string" }),
  contemplated: boolean("contemplated").notNull().default(false),
  contemplatedAt: date("contemplated_at", { mode: "string" }),
  status: text("status").notNull().default("active"),
  notes: text("notes"),
  ...audit,
});

export const financeSettings = pgTable("finance_settings", {
  userId: uuid("user_id").primaryKey(),
  inflationRate: numeric("inflation_rate", { precision: 8, scale: 4 })
    .notNull()
    .default("4.5"),
  investmentYield: numeric("investment_yield", { precision: 8, scale: 4 })
    .notNull()
    .default("12"),
  salaryIncreaseRate: numeric("salary_increase_rate", { precision: 8, scale: 4 })
    .notNull()
    .default("5"),
  hasFreelance: boolean("has_freelance").notNull().default(false),
  hasUber: boolean("has_uber").notNull().default(false),
  incomeOnboardingDone: boolean("income_onboarding_done").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

/** Dedupe de e-mails de vencimento (2d / 1d / hoje). */
export const emailReminderLog = pgTable(
  "email_reminder_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    notificationKey: text("notification_key").notNull(),
    severity: text("severity").notNull(),
    dueDate: date("due_date", { mode: "string" }).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
  },
  (t) => [
    uniqueIndex("email_reminder_log_user_key_sev_due_uidx").on(
      t.userId,
      t.notificationKey,
      t.severity,
      t.dueDate,
    ),
  ],
);
/** Mensagens do SAC (FAQ miss ? ticket). */
export const supportMessages = pgTable("support_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id"),
  email: text("email"),
  name: text("name"),
  message: text("message").notNull(),
  matchedIntent: text("matched_intent"),
  status: text("status").notNull().default("open"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  provider: text("provider").notNull().default("mercadopago"),
  externalId: text("external_id"),
  plan: text("plan").notNull(),
  status: text("status").notNull().default("pending"),
  currentPeriodStart: timestamp("current_period_start", {
    withTimezone: true,
    mode: "date",
  }),
  currentPeriodEnd: timestamp("current_period_end", {
    withTimezone: true,
    mode: "date",
  }),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  canceledAt: timestamp("canceled_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const subscriptionPayments = pgTable("subscription_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").notNull(),
  externalPaymentId: text("external_payment_id"),
  amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  status: text("status").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true, mode: "date" }),
  periodLabel: text("period_label"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const subscriptionEvents = pgTable("subscription_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: text("provider").notNull().default("mercadopago"),
  eventId: text("event_id"),
  topic: text("topic"),
  payload: jsonb("payload").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});
