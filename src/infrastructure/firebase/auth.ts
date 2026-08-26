import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth } from './client';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets.readonly');
provider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGoogle(): Promise<{ user: User; accessToken: string }> {
  const result = await signInWithPopup(auth, provider);
  const credential = GoogleAuthProvider.credentialFromResult(result);
  if (!credential?.accessToken) throw new Error('Google Sheets access token was not returned.');
  return { user: result.user, accessToken: credential.accessToken };
}

export async function signOutUser(): Promise<void> {
  await signOut(auth);
}
