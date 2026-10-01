import React from 'react';
import ProductDetail from '@/components/ProductDetail/ProductDetail';
import { getProductById } from '@/utils/productData';

export async function generateMetadata({ params }) {
  const { id } = params;
  const product = getProductById(id);

  return {
    title: product.name,
    description: product.description,
    keywords: product.keywords,
    alternates: {
      canonical: `/product/${id}`,
    },
    openGraph: {
      title: `${product.name} | Anevix`,
      description: product.description,
      url: `https://anevix.com/product/${id}`,
      type: "website",
      images: [
        {
          url: product.image,
          alt: product.name,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Anevix`,
      description: product.description,
      images: [product.image],
    }
  };
}

export default function ProductPage({ params }) {
  return <ProductDetail productId={params.id} />;
}
