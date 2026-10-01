import Forgot from '@/components/Auth/forgot/Forgot';

export const metadata = {
  title: "Forgot Password",
  description: "Reset your Anevix password securely. Enter your registered email or phone number to recover access.",
  keywords: "forgot password, reset password, recover account, Anevix password recovery",
  alternates: {
    canonical: "/forgot-password",
  },
  openGraph: {
    title: "Forgot Password | Anevix",
    description: "Reset your Anevix password securely. Enter your registered email or phone number to recover access.",
    url: "https://anevix.com/forgot-password",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Forgot Password | Anevix",
    description: "Reset your Anevix password securely. Enter your registered email or phone number to recover access.",
  }
};

export default function ForgotPage() {
  return <Forgot />;
}
