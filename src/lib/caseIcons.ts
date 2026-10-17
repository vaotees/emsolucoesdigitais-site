import {
  ArrowRight, Award, BarChart2, BarChart3, Building2, CalendarCheck, Camera, CheckCircle2, Cloud, Code2, Cpu,
  Database, FileText, Globe, Image as ImageIcon, Layers, Lightbulb, Lock, MessageSquare, Monitor, Package,
  Paintbrush, RefreshCw, Rocket, Search, Server, Settings, ShieldCheck, Smartphone, Star, Target, TrendingUp,
  Users, Zap, Sparkles, Calculator, Inbox, Ticket, Megaphone, LayoutDashboard, BookOpen, Leaf, Sun, type LucideIcon,
} from 'lucide-react'

// Ícones dos cases (destaques, entregas e módulos do painel). Lista única: o seletor do admin (/admin/projects)
// oferece exatamente estes, e as páginas de case renderizam exatamente estes.
export const CASE_ICONS: Record<string, LucideIcon> = {
  Zap, Search, ShieldCheck, Layers, Server, Cloud, Star, Rocket, Code2, Globe, Users, BarChart2, BarChart3,
  Award, Target, Lightbulb, Lock, Package, Cpu, Building2, ImageIcon, MessageSquare, CheckCircle2, ArrowRight,
  TrendingUp, Database, Settings, Monitor, Smartphone, CalendarCheck, Camera, FileText, Paintbrush, RefreshCw,
  Sparkles, Calculator, Inbox, Ticket, Megaphone, LayoutDashboard, BookOpen, Leaf, Sun,
}

export const CASE_ICON_NAMES = Object.keys(CASE_ICONS)

export function caseIcon(name?: string | null): LucideIcon {
  return (name && CASE_ICONS[name]) || Zap
}
