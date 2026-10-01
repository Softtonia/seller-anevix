import BusinessLayout from '@/components/Business/BusinessLayout';

export const metadata = {
  title: 'Seller Dashboard | Anevix Merchant Hub',
  description: 'Manage your products, orders, inventory, and analytics.',
};

export default function BusinessDashboardRootLayout({ children }) {
  return <BusinessLayout>{children}</BusinessLayout>;
}
