import OrderCancelled from '@/components/OrderCancelled/OrderCancelled';

export const metadata = {
  title: 'Order Cancelled',
  description: 'Your order cancellation details and refund status',
};

export default async function OrderCancelledPage({ params }) {
  const { id } = await params;
  return <OrderCancelled id={id} />;
}
