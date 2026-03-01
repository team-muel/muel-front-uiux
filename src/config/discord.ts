export const DASHBOARD_BOT_PERMISSIONS = '2147485696';
export const DASHBOARD_BOT_SCOPE = 'bot';

export const createDashboardBotInviteUrl = (clientId: string) => {
  const encodedClientId = encodeURIComponent(clientId);
  const encodedScope = encodeURIComponent(DASHBOARD_BOT_SCOPE);
  return `https://discord.com/api/oauth2/authorize?client_id=${encodedClientId}&permissions=${DASHBOARD_BOT_PERMISSIONS}&scope=${encodedScope}`;
};
