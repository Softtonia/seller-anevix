import React from 'react';
import Home from '@/components/Home/Home';

export const metadata = {
  title: "Home",
  description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
  keywords: "shopping, ecommerce, weekly best deals, furniture discount, clocks, toys, lighting accessories, Anevix, premium online store",
  alternates: {
    canonical: "/home",
  },
  openGraph: {
    title: "Home | Anevix",
    description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
    url: "https://anevix.com/home",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Home | Anevix",
    description: "Shop the latest in Furniture, Clocks, Toys, Lighting, Accessories, and more. Find weekly best deals with exclusive discounts and special offers on Anevix.",
  }
};

export default function Page() {
  return <Home />;
}