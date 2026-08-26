const env = import.meta.env;

export const runtimeConfig = {
  firebase: {
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'host-a-8d0ca',
    appId: env.VITE_FIREBASE_APP_ID || '1:945997311371:web:36824f573c02c0260f938e',
    apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyC5vPR9lPL7H6-I-Hx6qdcq0qdlwYgc2Bc',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'host-a-8d0ca.firebaseapp.com',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '945997311371',
  },
  primaryAdminEmail: (env.VITE_PRIMARY_ADMIN_EMAIL || 'henrynguyenfw@gmail.com').toLowerCase(),
  defaultSpreadsheetId: env.VITE_DEFAULT_SPREADSHEET_ID || '1trCnssQ907GIDO1slhaW0RGcJaSWKXSCkScZP31r5SE',
};
