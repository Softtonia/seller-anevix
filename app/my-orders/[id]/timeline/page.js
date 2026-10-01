import OrderTimeline from '@/components/OrderTimeline/OrderTimeline';

export const metadata = {
  title: 'Order Timeline',
  description: 'View real-time status and delivery timeline updates for your order',
};

export default async function OrderTimelinePage({ params }) {
  const { id } = await params;
  return <OrderTimeline id={id} />;
}
