import React from 'react';
import ProductReview from '@/components/ProductReview/ProductReview';
import { getProductById } from '@/utils/productData';

export async function generateMetadata({ params }) {
  const { id } = params;
  const product = getProductById(id);
  const title = `Customer Reviews - ${product.name}`;

  return {
    title,
    description: `Read what other customers are saying about ${product.name}. Honest reviews, ratings, and feedback on Anevix.`,
    keywords: `reviews, customer feedback, ratings, ${product.keywords}`,
    alternates: {
      canonical: `/product/${id}/reviews`,
    },
    openGraph: {
      title: `${title} | Anevix`,
      description: `Read what other customers are saying about ${product.name}. Honest reviews, ratings, and feedback on Anevix.`,
      url: `https://anevix.com/product/${id}/reviews`,
      type: "website",
      images: [
        {
          url: product.image,
          alt: title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | Anevix`,
      description: `Read what other customers are saying about ${product.name}. Honest reviews, ratings, and feedback on Anevix.`,
      images: [product.image],
    }
  };
}

export default function ProductReviewPage({ params }) {
  return <ProductReview productId={params.id} />;
}
