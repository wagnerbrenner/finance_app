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
  { title: "Contas", href: "/app/contas", icon: Wallet, enabled: true },
  { title: "Transações", href: "/app/transacoes", icon: ArrowLeftRight, enabled: true },
  { title: "Cartões", href: "/app/cartoes", icon: CreditCard, enabled: true },
  { title: "Dívidas", href: "/app/dividas", icon: Landmark, enabled: true },
  { title: "Metas", href: "/app/metas", icon: Target, enabled: true },
  { title: "Investimentos", href: "/app/investimentos", icon: TrendingUp, enabled: true },
  { title: "Uber", href: "/app/uber", icon: Car, enabled: true },
  { title: "Relatórios", href: "/app/relatorios", icon: FileBarChart, enabled: true },
];
