import { Suspense } from 'react';
import ResetPassword from '@/components/Auth/forgot/ResetPassword';

export const metadata = {
  title: "Reset Password",
  description: "Create a strong, new password for your Anevix account to ensure your security.",
  keywords: "reset password, new password, update credentials, account security",
  alternates: {
    canonical: "/reset-password",
  },
  openGraph: {
    title: "Reset Password | Anevix",
    description: "Create a strong, new password for your Anevix account to ensure your security.",
    url: "https://anevix.com/reset-password",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reset Password | Anevix",
    description: "Create a strong, new password for your Anevix account to ensure your security.",
  }
};

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <ResetPassword />
    </Suspense>
  );
}
