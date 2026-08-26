import {
  GoogleAuthProvider,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './client';

function createSignInProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

function createSheetsProvider(user: User): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
  provider.setCustomParameters({
    prompt: 'consent',
    ...(user.email ? { login_hint: user.email } : {}),
  });
  return provider;
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, createSignInProvider());
  return result.user;
}

export async function connectGoogleSheets(user: User): Promise<string> {
  const result = await reauthenticateWithPopup(user, createSheetsProvider(user));
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error('Google Sheets access token was not returned.');
  return credential.accessToken;
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
