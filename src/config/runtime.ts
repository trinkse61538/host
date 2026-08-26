const env = import.meta.env;

export const runtimeConfig = {
  firebase: {
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'gen-lang-client-0674849112',
    appId: env.VITE_FIREBASE_APP_ID || '1:701129305498:web:8af96c94988c82c76f9e23',
    apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyAqBRukH-eKCjgtPikHHuay7B0EmVU_TDA',
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'gen-lang-client-0674849112.firebaseapp.com',
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '701129305498',
  },
  firestoreDatabaseId: env.VITE_FIRESTORE_DATABASE_ID || 'airbnb',
  primaryAdminEmail: (env.VITE_PRIMARY_ADMIN_EMAIL || 'khaitri15@gmail.com').toLowerCase(),
  defaultSpreadsheetId: env.VITE_DEFAULT_SPREADSHEET_ID || '1trCnssQ907GIDO1slhaW0RGcJaSWKXSCkScZP31r5SE',
};
