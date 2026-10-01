// utils/ProductCard/ProductCard.jsx

'use client';

import React from 'react';
import Link from 'next/link';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  return (
    <Link href={`/product/${product.id}`} className="productCard">

      {/* IMAGE */}

      <div className="productImageWrapper">

        <img
          src={product.image}
          alt={product.name}
          className="productImage"
        />

        {product.badge && (
          <span className={`productBadge ${product.badgeType}`}>
            {product.badge}
          </span>
        )}

      </div>

      {/* CONTENT */}

      <div className="productContent">

        {/* BRAND + RATING */}

        <div className="productTop">

          <span className="productBrand">
            {product.brand}
          </span>

          <span className="productRating Poppins-regular">
            <span>★</span>{product.rating}
          </span>

        </div>

        {/* TITLE */}

        <h3 className="productTitle Poppins-bold">
          {product.name}
        </h3>

        {/* PRICE */}

        <div className="productPriceRow">

          <span className="oldPrice Poppins-regular">
            {product.oldPrice}
          </span>

          <span className="newPrice Poppins-regular">
            {product.newPrice}
          </span>

        </div>

        {/* BOTTOM */}

        {
        //     <div className="productBottom">

        //   <span className="reviewCount">
        //     {product.reviewCount} reviews
        //   </span>

        //   {product.discountTag && (
        //     <span className="discountTag">
        //       {product.discountTag}
        //     </span>
        //   )}

        // </div>
        }

      </div>

    </Link>
  );
};

export default ProductCard;
