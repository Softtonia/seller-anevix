import { Suspense } from 'react';
import Login from '@/components/Auth/login/Login';

export const metadata = {
  title: "Sign In",
  description: "Sign in to your Anevix account to manage your profile, view orders, and track your wishlist.",
  keywords: "signin, login, account access, Anevix login",
  alternates: {
    canonical: "/signin",
  },
  openGraph: {
    title: "Sign In | Anevix",
    description: "Sign in to your Anevix account to manage your profile, view orders, and track your wishlist.",
    url: "https://anevix.com/signin",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In | Anevix",
    description: "Sign in to your Anevix account to manage your profile, view orders, and track your wishlist.",
  }
};

export default function SigninPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Login />
    </Suspense>
  );
}
