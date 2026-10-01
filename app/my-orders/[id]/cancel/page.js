import OrderCancel from '@/components/OrderCancel/OrderCancel';

export const metadata = {
  title: 'Cancel Order',
  description: 'Provide a reason for order cancellation',
};

export default async function OrderCancelPage({ params }) {
  const { id } = await params;
  return <OrderCancel id={id} />;
}
