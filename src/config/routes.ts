export const ROUTES = {
  home: '/',
  inApp: '/in-app',
  studio: '/studio',
  support: '/support',
  embedded: '/embedded',
  dashboard: '/dashboard',
  playground: '/playground',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
