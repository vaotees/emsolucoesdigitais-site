import {
  Award, BarChart2, BarChart3, Bot, Briefcase, Building, Camera, Check, Cloud, Code2, Cpu, Database, DollarSign,
  FileText, Globe, Heart, Image, Layers, Lightbulb, LineChart, Link, Lock, Mail, Map, Megaphone, Music, Palette,
  PieChart, Play, Rocket, Search, Settings, Share2, Shield, ShoppingCart, Smartphone, Star, Target, TrendingUp,
  Users, Video, Zap, type LucideIcon,
} from 'lucide-react'

// Ícones dos serviços da home. Lista única: o seletor do admin (/admin/features)
// oferece exatamente estes, e a home (FeaturesGrid) renderiza exatamente estes.
export const FEATURE_ICONS: Record<string, LucideIcon> = {
  Palette, Code2, TrendingUp, Target, Share2, BarChart3, Check, Star, Zap, Globe, Shield, Rocket, Cpu, Users,
  BarChart2, Award, Lightbulb, Lock, Layers, Megaphone, Bot, Camera, FileText, ShoppingCart, Heart, Settings,
  Database, Cloud, Smartphone, Mail, Search, PieChart, LineChart, DollarSign, Briefcase, Building, Map, Link,
  Video, Music, Image, Play,
  // nome antigo, mantido para registros já salvos
  ChartBar: BarChart3,
}

export const FEATURE_ICON_NAMES = Object.keys(FEATURE_ICONS).filter((n) => n !== 'ChartBar')

export function featureIcon(name?: string | null): LucideIcon {
  return (name && FEATURE_ICONS[name]) || Check
}
