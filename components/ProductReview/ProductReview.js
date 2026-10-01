'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import './ProductReview.css';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { HiOutlineArrowLeft } from 'react-icons/hi';

const reviewData = {
  average: 4.3,
  counts: {
    5: 435,
    4: 125,
    3: 49,
    2: 21,
    1: 52,
  },
  totalReviews: 121,
  customerImages: ['/images/mug1.jpg', '/images/mug2.jpg', '/images/mug3.jpg', '/images/mug4.png'],
  reviews: [
    {
      name: 'Emma Davis',
      rating: 4,
      title: 'Good Quality Mugs',
      comment:
        'Ecommerce customer reviews can be a huge benefit to brands and retailers from increased conversions to greater loyalty, reviews are essential for growth.',
      date: 'August 23, 2019',
      style: 'Cashmere woods',
      helpful: 35,
    },
    {
      name: 'Emma Davis',
      rating: 4,
      title: 'Good Quality Mugs',
      comment:
        'Ecommerce customer reviews can be a huge benefit to brands and retailers from increased conversions to greater loyalty, reviews are essential for growth.',
      date: 'August 23, 2019',
      style: 'Cashmere woods',
      helpful: 35,
    },
  ],
};

const tags = [
  'easy to clean',
  'ever used',
  'stainless steel',
  'much easier',
  'high quality',
  'easy handle',
  'washable',
  'glass',
  'well made',
];

const RatingStars = ({ value, small }) => {
  const stars = [];
  const fullStars = Math.floor(value);
  const hasHalf = value - fullStars >= 0.5;

  for (let i = 1; i <= 5; i += 1) {
    if (i <= fullStars) {
      stars.push(<FaStar key={i} />);
    } else if (i === fullStars + 1 && hasHalf) {
      stars.push(<FaStarHalfAlt key={i} />);
    } else {
      stars.push(<FaRegStar key={i} />);
    }
  }

  return <div className={`ratingStars${small ? ' small' : ''}`}>{stars}</div>;
};

const ProductReview = ({ productId }) => {
  const { average, totalReviews, counts, customerImages, reviews } = reviewData;
  const totalRatings = Object.values(counts).reduce((sum, value) => sum + value, 0);

  const ratingWidth = (count) => `${Math.round((count / totalRatings) * 100)}%`;

  return (
    <div className="productReviewPage">
      <div className="pageWrapper">
        <div className="pageTitleRow">
          <Link href={`/product/${productId}`} className="pageTitle Poppins-bold">
            <HiOutlineArrowLeft />
            Ratings & Reviews
          </Link>
        </div>

        <div className="reviewGrid">
          <aside className="reviewSummaryCard">
            <div className="averageSection">
              <div className="averageScore">{average.toFixed(1)}</div>
              <div className="averageMeta">
                <RatingStars value={average} />
                <p>({totalReviews} Reviews)</p>
              </div>
            </div>

            <div className="ratingBreakdown">
              {Object.entries(counts)
                .sort((a, b) => b[0] - a[0])
                .map(([rating, count]) => (
                  <div key={rating} className="ratingRow">
                    <span>{rating}</span>
                    <div className="progressBar">
                      <div
                        className={`progressFill fill${rating}`}
                        style={{ width: ratingWidth(count) }}
                      />
                    </div>
                    <span>{count}</span>
                  </div>
                ))}
            </div>

            <div className="ratingNote">How are ratings calculated?</div>

            <div className="featureHeading Poppins-regular">By feature</div>
            <div className="featureSection">
              <div className="featureRow">
                <span>Quality of material</span>
                <div className="featureStats">
                  <RatingStars value={4.5} small />
                  <strong>4.5</strong>
                </div>
              </div>
              <div className="featureRow">
                <span>Easy to use</span>
                <div className="featureStats">
                  <RatingStars value={3.4} small />
                  <strong>3.4</strong>
                </div>
              </div>
              <div className="featureRow">
                <span>Durability</span>
                <div className="featureStats">
                  <RatingStars value={3.5} small />
                  <strong>3.5</strong>
                </div>
              </div>
            </div>

            <div className="seeMore">See more</div>

            <div className="mentionSection">
              <h3>Read reviews that mention</h3>
              <div className="chips">
                {tags.map((tag) => (
                  <span key={tag} className="chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          <main className="reviewContentCard">
            <div className="customerImagesSection">
              <div className="customerImagesHeader">
                <h2>Customer images</h2>
                <Link href={`/product/${productId}/reviews`} className="smallLink">
                  See all customer images
                </Link>
              </div>
              <div className="customerImagesGrid">
                {customerImages.map((src, index) => (
                  <div key={index} className="customerImageWrapper">
                    <Image src={src} alt={`customer ${index + 1}`} width={150} height={159} className="customerImage" />
                  </div>
                ))}
              </div>
            </div>

            <div className="reviewSectionHeading">
              <h3>Our Customer reviews</h3>
            </div>

            <div className="reviewCards">
              {reviews.map((review, index) => (
                <article key={index} className="reviewCard">
                  <div className="reviewCardTop">
                    <div className="reviewAuthor">
                      <div className="avatar">
                        {review.name
                          .split(' ')
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <div>
                        <h3 className="Poppins-regular">{review.name}</h3>
                        <RatingStars value={review.rating} />
                      </div>
                    </div>
                    <div className="reviewTitle">{review.title}</div>
                  </div>

                  <p className="reviewMetaText">Reviewed in the United States on {review.date}</p>
                  <p className="reviewMetaText">
                    Style: {review.style} | <span className="verified">Verified Purchase</span>
                  </p>

                  <p className="reviewText">{review.comment}</p>

                  <div className="reviewFooter">
                    <span>{review.helpful} people found this helpful</span> 
                    <div className="reviewActions">
                      <button>Helpful</button>
                      <button className="b-none">Report Abuse</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="reviewPagination">
              <button className="paginationBtn">&lt;</button>
              <span>3 of 7</span>
              <button className="paginationBtn">&gt;</button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProductReview;
