import { useRouter } from 'next/router';
import { useEffect } from 'react';
import '../styles/globals.css';
import React from 'react';

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user && router.pathname !== '/login') {
      router.replace('/login');
    }
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;