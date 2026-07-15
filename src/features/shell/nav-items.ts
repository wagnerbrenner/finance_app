import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  CreditCard,
  Landmark,
  Target,
  TrendingUp,
  Banknote,
  RefreshCw,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

/** Itens principais (bottom nav mobile + sidebar). */
export const PRIMARY_NAV: NavItem[] = [
  { title: "Painel", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { title: "Contas", href: "/app/contas", icon: Wallet, enabled: true },
  { title: "Renda", href: "/app/renda", icon: Banknote, enabled: true },
];

/** Demais módulos (sidebar + “Mais” no mobile). */
export const SECONDARY_NAV: NavItem[] = [
  { title: "Transações", href: "/app/transacoes", icon: ArrowLeftRight, enabled: true },
  { title: "Recorrentes", href: "/app/recorrentes", icon: RefreshCw, enabled: true },
  { title: "Cartões", href: "/app/cartoes", icon: CreditCard, enabled: true },
  { title: "Dívidas", href: "/app/dividas", icon: Landmark, enabled: true },
  { title: "Metas", href: "/app/metas", icon: Target, enabled: true },
  { title: "Investimentos", href: "/app/investimentos", icon: TrendingUp, enabled: true },
];

/** Lista completa da sidebar (Importar oculto). */
export const NAV_ITEMS: NavItem[] = [...PRIMARY_NAV, ...SECONDARY_NAV];
