'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';

export default function VerifiedPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/');
    }, 3000);

    return () => clearTimeout(timeout);
  }, [router]);

  useEffect(() => {
    confetti({
      particleCount: 300,
      spread: 127,
      origin: { y: .8 },
      angle: 90
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">🎉 Email Verified!</h1>
      <p className="text-xl text-gray-600 mt-2">Redirecting you to Scribbly…</p>
    </div>
  );
}
