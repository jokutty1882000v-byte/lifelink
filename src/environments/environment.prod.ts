export const environment = {
  production: true,
  appName: 'LifeLink',
  apiBaseUrl: 'https://api.lifelink.example.com/api',
  wsBaseUrl:  'wss://api.lifelink.example.com/ws',
  useMockApi: false,
  aiEndpoint: '/ai/chat',
  defaultLocale: 'en-US',
  map: {
    tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    defaultCenter: [20.5937, 78.9629] as [number, number],
    defaultZoom: 5,
  },
  storageKeys: {
    authToken:    'll.auth.token',
    refreshToken: 'll.auth.refresh',
    theme:        'll.ui.theme',
    profile:      'll.user.profile',
  },
};
