import LoginSecurity from '@/components/LoginSecurity/LoginSecurity';

export const metadata = {
  title: 'Login & Security',
  description: 'Manage your login credentials, name, email, phone number, passwords, and two-factor authentication.',
};

export default function LoginSecurityPage() {
  return <LoginSecurity />;
}
