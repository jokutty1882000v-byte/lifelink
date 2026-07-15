/** Centralized endpoint paths — appended to `environment.apiBaseUrl`. */
export const API = {
  auth: {
    login:    '/auth/login',
    register: '/auth/register',
    refresh:  '/auth/refresh',
    logout:   '/auth/logout',
    me:       '/auth/me',
  },
  donors: {
    root:    '/donors',
    search:  '/donors/search',
    byId:    (id: string) => `/donors/${id}`,
    contact: (id: string) => `/donors/${id}/contact`,
  },
  hospitals: {
    root:   '/hospitals',
    nearby: '/hospitals/nearby',
    byId:   (id: string) => `/hospitals/${id}`,
  },
  bloodBanks: {
    root:   '/blood-banks',
    nearby: '/blood-banks/nearby',
    byId:   (id: string) => `/blood-banks/${id}`,
  },
  requests: {
    root:      '/requests',
    mine:      '/requests/mine',
    byId:      (id: string) => `/requests/${id}`,
    match:     (id: string) => `/requests/${id}/match`,
    fulfill:   (id: string) => `/requests/${id}/fulfill`,
  },
  notifications: {
    root:      '/notifications',
    markRead:  (id: string) => `/notifications/${id}/read`,
    markAll:   '/notifications/read-all',
  },
  ai: {
    chat:      '/ai/chat',
    predict:   '/ai/predict-availability',
    rank:      '/ai/rank-donors',
  },
} as const;
