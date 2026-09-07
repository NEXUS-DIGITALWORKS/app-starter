import type { LucideIcon } from 'lucide-react';
import {
  Database,
  FolderArchive,
  Layers3,
  Monitor,
  Palette,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  frontend: Monitor,
  'mobile-desktop': Layers3,
  backend: Server,
  database: Database,
  orm: Wrench,
  auth: ShieldCheck,
  storage: FolderArchive,
  ai: Sparkles,
  hosting: Rocket,
  'dev-approach': Wrench,
  'ui-design': Palette,
};

export const DEFAULT_CATEGORY_ICON: LucideIcon = Layers3;
