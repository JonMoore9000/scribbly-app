// src/app/finishSignIn/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';

export default function FinishSignIn() {
  const router = useRouter();

  useEffect(() => {
    const signIn = async () => {
      if (typeof window !== 'undefined' && isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
          email = window.prompt('Please enter your email for confirmation');
        }

        try {
          await signInWithEmailLink(auth, email!, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          router.push('/');
        } catch (err) {
          console.error(err);
          alert('Sign-in failed.');
        }
      }
    };

    signIn();
  }, [router]);

  return <p className="text-center mt-10">Signing you in…</p>;
}
