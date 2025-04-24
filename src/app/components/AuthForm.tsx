'use client';

import { useState } from 'react';
import { auth } from '../../lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendSignInLinkToEmail,
  sendEmailVerification,
} from 'firebase/auth';

import { actionCodeSettings } from '../../lib/firebase';

export default function AuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);

  const handleAuth = async () => {
    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
  
        if (!userCredential.user.emailVerified) {
          alert('Your email is not verified yet. Please check your inbox.');
          // Optionally, sign out the user here if you don't want unverified access:
          // await auth.signOut();
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(userCredential.user, {
          url: "https://goscribbly.com/verified", // Replace with your actual domain/page
          handleCodeInApp: false, // must be false for redirect to work
        });
        alert('Account created! Please check your inbox to verify your email before signing in.');
        setIsLogin(true); // flip to login mode
      }
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleMagicLink = async () => {
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      alert('A sign-in link has been sent to your email.');
    } catch (error) {
      alert('Failed to send link: ' + (error as Error).message);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="max-w-sm mx-auto mt-10 p-4 border rounded">
        <img src="/favicon.ico" alt="" />
        <h2 className="text-lg font-bold mb-2">{isLogin ? 'Login' : 'Sign Up'}</h2>
        <input
          className="w-full mb-2 p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {!isLogin && (
          <input
            className="w-full mb-2 p-2 border rounded"
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        )}
        {isLogin && (
          <>
            <input
              className="w-full mb-2 p-2 border rounded"
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              onClick={handleAuth}
              className="w-full bg-indigo-600 text-white py-2 rounded"
            >
              Login with Password
            </button>
          </>
        )}
        {!isLogin && (
          <button
            onClick={handleAuth}
            className="w-full bg-indigo-600 text-white py-2 rounded"
          >
            Create Account
          </button>
        )}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="need-account-btn text-sm mt-2 hover:underline"
        >
          {isLogin ? 'Need an account? Sign up' : 'Already have an account? Log in'}
        </button>
      </div>
    </div>
  );
}
