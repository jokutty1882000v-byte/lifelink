/**
 * Development environment.
 * Toggle `useMockApi` off once the FastAPI backend is reachable.
 */
export const environment = {
  production: false,
  appName: 'LifeLink',
  apiBaseUrl: 'http://localhost:8000/api',
  wsBaseUrl:  'ws://localhost:8000/ws',
  useMockApi: true,
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
