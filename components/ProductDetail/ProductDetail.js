// components/ProductDetail/ProductDetail.js

"use client";

import React, { useState } from "react";
import Link from "next/link";
import "./ProductDetail.css";

import {
  FaStar,
  FaRegStar,
  FaChevronLeft,
  FaChevronRight,
  FaShippingFast,
  FaUndoAlt,
  FaMedal,
} from "react-icons/fa";

const ProductDetail = ({ productId }) => {

  // PRODUCT IMAGES
  const images = [
    "/images/mug-1.png",
    "/images/mug2.png",
    "/images/mug3.png",
    "/images/mug4.png",
    "/images/mug3.png",
  ];

  // COLOR OPTIONS DATA

const colors = [
  {
    name: "Pink",
    image: "/images/mug-1.png",
  },
  {
    name: "Purple",
    image: "/images/mug2.png",
  },
  {
    name: "Brown",
    image: "/images/mug3.png",
  },
  {
    name: "White",
    image: "/images/mug4.png",
  },
];


  // ACTIVE IMAGE
  const [selectedImage, setSelectedImage] = useState(0);

  // ACTIVE COLOR
  const [selectedColor, setSelectedColor] = useState(0);

  // NEXT IMAGE
  const nextImage = () => {
    setSelectedImage((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  // PREVIOUS IMAGE
  const prevImage = () => {
    setSelectedImage((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="productDetailPage">

      <div className="productWrapper">

        {/* ================= LEFT SECTION ================= */}

        <div className="leftSection">

          {/* MAIN IMAGE */}

          <div className="mainImageContainer">

            {/* PREVIOUS BUTTON */}

            <button
              className="navBtn leftBtn"
              onClick={prevImage}
            >
              <FaChevronLeft />
            </button>

            {/* MAIN IMAGE */}

            <img
              src={images[selectedImage]}
              alt="product"
              className="mainImage"
            />

            {/* NEXT BUTTON */}

            <button
              className="navBtn rightBtn"
              onClick={nextImage}
            >
              <FaChevronRight />
            </button>

          </div>

          {/* THUMBNAILS */}

          <div className="thumbnailWrapper">

            {/* LEFT THUMB BUTTON */}

            <button
              className="thumbNavBtn"
              onClick={prevImage}
            >
              <FaChevronLeft />
            </button>

            {/* THUMBNAIL LIST */}

            <div className="thumbnailContainer">

              {images.map((img, index) => (

                <div
                  key={index}
                  className={`thumbWrapper ${
                    selectedImage === index
                      ? "activeThumb"
                      : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >

                  <img
                    src={img}
                    alt="thumb"
                    className="thumbnailImage"
                  />

                </div>

              ))}

            </div>

            {/* RIGHT THUMB BUTTON */}

            <button
              className="thumbNavBtn"
              onClick={nextImage}
            >
              <FaChevronRight />
            </button>

          </div>

          {/* RATINGS */}

          <div className="ratingsBox">

            <h3>RATINGS</h3>

            <div className="ratingTop">

              <div className="bigRating">
                <span>4.3</span>
                <FaStar />
              </div>

              <div className="ratingBars">

                <div className="barRow">
                  <span>5</span>

                  <FaStar className="smallStar" />

                  <div className="bar">
                    <div className="fill fill5"></div>
                  </div>

                  <p>435</p>
                </div>

                <div className="barRow">
                  <span>4</span>

                  <FaStar className="smallStar" />

                  <div className="bar">
                    <div className="fill fill4"></div>
                  </div>

                  <p>125</p>
                </div>

                <div className="barRow">
                  <span>3</span>

                  <FaStar className="smallStar" />

                  <div className="bar">
                    <div className="fill fill3"></div>
                  </div>

                  <p>49</p>
                </div>

              </div>
            </div>
          </div>

          {/* CUSTOMER PHOTOS */}

          <div className="customerPhotos">

            <h3>Customer Photos (24)</h3>

            <div className="photoGrid">

              <img src="/images/mug1.jpg" alt="" />

              <img src="/images/mug2.jpg" alt="" />

              <img src="/images/mug3.jpg" alt="" />

              <div className="morePhotos">
                +21
              </div>

            </div>
          </div>

          {/* REVIEW SECTION */}

          <div className="reviewSection">

            <h3>Customer Reviews (121)</h3>

            <div className="reviewCard">

              <div className="reviewRating">
                <FaStar />
                <span>4.3</span>
              </div>

              <p className="Poppins-regular">
                The product quality was excellent and exactly as expected,
                but what truly stood out was the beautiful and premium packaging.
              </p>

              <div className="reviewImages">

                <img src="/images/mug1.jpg" alt="" />

                <img src="/images/mug2.jpg" alt="" />

                <img src="/images/mug3.jpg" alt="" />

              </div>

              <h5 className = "Poppins-regular">
                Rohit Chouhan | 7 Dec 2025
              </h5>

            </div>

            <Link href={`/product/${productId}/reviews`} className="viewReviews Poppins-regular">
              View all 120 reviews
            </Link>

          </div>
        </div>

        {/* ================= RIGHT SECTION ================= */}

        <div className="rightSection">

          <h1 className="Poppins-bold">
            Spooky Creative Starry Sky Ceramic Mug – Cute
            3D Cat Design – Available in Blue – 420ml
          </h1>

          {/* TOP RATING */}

          <div className="topRating">

            <div className="stars">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaRegStar />
            </div>

            <span className="Poppins-regular"><strong> 4.3</strong> | 55 Ratings</span>

          </div>

          <p className="boughtText Poppins-regular">
            100+ bought in past month
          </p>

          {/* PRICE */}

          <div className="priceBox">

            <span className="price Poppins-regular">
              Rs. 756
            </span>

            <span className="oldPrice">
              Rs.1900/-
            </span>

            <span className="discount">
              (50% Off)
            </span>

          </div>

          <p className="taxText Poppins-regular">
            inclusive of all taxes
          </p>

          {/* COLOR OPTIONS */}


<div className="optionBox">

  {/* TITLE CHANGE */}

  <h4 className="Poppins-regular">
    Colour: {colors[selectedColor].name}
  </h4>

  <div className="colorOptions">

    {colors.map((color, index) => (

      <div
        key={index}
        className={`colorCard ${
          selectedColor === index
            ? "active"
            : ""
        }`}
        onClick={() => {
          setSelectedColor(index);

          // MAIN IMAGE CHANGE ALSO
          setSelectedImage(index);
        }}
      >

        <img
          src={color.image}
          alt={color.name}
        />

        <span>
          {color.name}
        </span>

      </div>

    ))}

  </div>
</div>

          {/* SIZE OPTIONS */}

          <div className="optionBox optionBox-size">

            <h4 className="Poppins-regular">Size: 420ml</h4>

            <div className="sizeOptions">

              <button>
                300ml
              </button>

              <button className="activeSize">
                420ml
              </button>

              <button>
                500ml
              </button>

            </div>
          </div>

          {/* BUTTONS */}

          <div className="buttonRow">

            <button className="cartBtn">
              Add to cart
            </button>

            <button className="buyBtn">
              Buy Now
            </button>

          </div>

          {/* FEATURES */}

          <div className="featureRow">

            <div className="featureCard">
              <FaShippingFast />
              <span className="Poppins-regular">Pay on Delivery</span>
            </div>

            <div className="featureCard">
              <FaUndoAlt />
              <span className="Poppins-regular">10 Days Return</span>
            </div>

            <div className="featureCard">
              <FaMedal />
              <span className="Poppins-regular">Top Brand</span>
            </div>

          </div>

          {/* PRODUCT DETAILS */}

<div className="productDetails">

  <div className="detailItem">
    <span className="Poppins-regular">Brand</span>
    <p className="Poppins-regular">Spooky</p>
  </div>

  <div className="detailItem">
    <span className="Poppins-regular">Material</span>
    <p className="Poppins-regular">Ceramic</p>
  </div>

  <div className="detailItem">
    <span className="Poppins-regular">Colour</span>
    <p className="Poppins-regular">Blue - 420ml</p>
  </div>

  <div className="detailItem">
    <span className="Poppins-regular">Capacity</span>
    <p className="Poppins-regular">420 Milliliters</p>
  </div>

  <div className="detailItem">
    <span className="Poppins-regular">Style</span>
    <p className="Poppins-regular">Cartoon - Cat</p>
  </div>

</div>

{/* ABOUT SECTION */}

<div className="aboutSection">

  <h4 className="Poppins-regular">About this item</h4>

  <ul>

    <li>
      <b>Unique 3D Cat Design:</b>
      Add some charm to your daily routine
      with this adorable, three-dimensional
      cat-shaped mug.
    </li>

    <li>
      <b>High-Quality Ceramic Material:</b>
      Made from durable ceramics, this mug
      ensures long-lasting use while keeping
      your drinks warm.
    </li>

    <li>
      Perfect for coffee, tea, milk, hot
      chocolate and gifting purposes.
    </li>

  </ul>

</div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetail;