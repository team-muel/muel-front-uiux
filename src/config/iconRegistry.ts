import {
  AppWindow,
  Bot,
  Briefcase,
  Cpu,
  Layers,
  Orbit,
  Radio,
  ShieldCheck,
  Wrench,
  Link2,
  Newspaper,
  ChartNoAxesCombined,
  Wallet,
} from 'lucide-react';

export const APP_ICONS = {
  appWindow: AppWindow,
  bot: Bot,
  briefcase: Briefcase,
  cpu: Cpu,
  layers: Layers,
  orbit: Orbit,
  radio: Radio,
  shieldCheck: ShieldCheck,
  wrench: Wrench,
  link2: Link2,
  newspaper: Newspaper,
  chartNoAxesCombined: ChartNoAxesCombined,
  wallet: Wallet,
} as const;

export type AppIconKey = keyof typeof APP_ICONS;
