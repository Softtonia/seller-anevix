import MyPayments from '@/components/MyPayments/MyPayments';

export const metadata = {
  title: 'My Payments',
  description: 'Manage your payment methods and view past transaction payouts.',
};

export default function MyPaymentsPage() {
  return <MyPayments />;
}
