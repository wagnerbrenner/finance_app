import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Target,
  TrendingUp,
  Car,
  FileBarChart,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { title: "Contas", href: "/app/contas", icon: Wallet, enabled: false },
  { title: "Transações", href: "/app/transacoes", icon: ArrowLeftRight, enabled: false },
  { title: "Cartões", href: "/app/cartoes", icon: CreditCard, enabled: false },
  { title: "Dívidas", href: "/app/dividas", icon: Landmark, enabled: false },
  { title: "Metas", href: "/app/metas", icon: Target, enabled: false },
  { title: "Investimentos", href: "/app/investimentos", icon: TrendingUp, enabled: false },
  { title: "Uber", href: "/app/uber", icon: Car, enabled: false },
  { title: "Relatórios", href: "/app/relatorios", icon: FileBarChart, enabled: false },
];
