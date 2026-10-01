import { Suspense } from 'react';
import Signup from '@/components/Auth/signup/Signup';

export const metadata = {
  title: "Sign Up",
  description: "Create your Anevix account today to enjoy personalized shopping, order tracking, and exclusive discounts.",
  keywords: "signup, create account, register, Anevix account",
  alternates: {
    canonical: "/signup",
  },
  openGraph: {
    title: "Sign Up | Anevix",
    description: "Create your Anevix account today to enjoy personalized shopping, order tracking, and exclusive discounts.",
    url: "https://anevix.com/signup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | Anevix",
    description: "Create your Anevix account today to enjoy personalized shopping, order tracking, and exclusive discounts.",
  }
};

export default function SignupPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Signup />
    </Suspense>
  );
}
