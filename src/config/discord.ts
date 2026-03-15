export const DISCORD_CONFIG = {
  clientId: process.env.REACT_APP_DISCORD_CLIENT_ID || '1335133474226438176',
  redirectUri: `${window.location.origin}/auth/callback`,
  scope: 'identify email guilds',
  authUrl: 'https://discord.com/api/oauth2/authorize'
};

export const getDiscordAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: DISCORD_CONFIG.clientId,
    redirect_uri: DISCORD_CONFIG.redirectUri,
    response_type: 'code',
    scope: DISCORD_CONFIG.scope
  });
  return `${DISCORD_CONFIG.authUrl}?${params.toString()}`;
};
