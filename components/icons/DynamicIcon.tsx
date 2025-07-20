import React from 'react';
import { 
  Target, 
  CheckSquare, 
  DollarSign, 
  Droplets, 
  Fuel, 
  QrCode, 
  Quote, 
  Timer, 
  Vote, 
  Calculator,
  Home,
  Settings,
  User,
  Plus,
  Search,
  Filter,
  Calendar,
  TrendingUp,
  Bell,
  Star,
  ChevronRight,
  Check,
  X,
  Edit,
  Trash2,
  Camera,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Heart,
  Coffee,
  Moon,
  Sun,
  LucideIcon,
  ChevronLeft
} from 'lucide-react-native';

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  'check-square': CheckSquare,
  'dollar-sign': DollarSign,
  droplets: Droplets,
  fuel: Fuel,
  'qr-code': QrCode,
  quote: Quote,
  timer: Timer,
  vote: Vote,
  calculator: Calculator,
  home: Home,
  settings: Settings,
  user: User,
  plus: Plus,
  search: Search,
  filter: Filter,
  calendar: Calendar,
  'trending-up': TrendingUp,
  bell: Bell,
  star: Star,
  'chevron-right': ChevronRight,
  'chevron-left': ChevronLeft,
  check: Check,
  x: X,
  edit: Edit,
  'trash-2': Trash2,
  camera: Camera,
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  activity: Activity,
  zap: Zap,
  heart: Heart,
  coffee: Coffee,
  moon: Moon,
  sun: Sun,
};

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DynamicIcon({ name, size = 24, color = 'currentColor', strokeWidth = 2 }: DynamicIconProps) {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    return <Target size={size} color={color} strokeWidth={strokeWidth} />;
  }

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
}