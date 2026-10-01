import OrderDetail from '@/components/OrderDetail/OrderDetail';

export const metadata = {
  title: 'Order Details',
  description: 'View specific order history logs and tracking details',
};

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  return <OrderDetail id={id} />;
}
