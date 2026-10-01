'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowBackIosNew, CheckCircle, Info } from '@mui/icons-material';
import { getOrderById } from '@/utils/ordersData';
import StayUpdated from '../StayUpdated/StayUpdated';
import './OrderCancelled.css';

export default function OrderCancelled({ id }) {
  // Find order in our shared mock database
  const order = getOrderById(id);

  if (!order) {
    return (
      <div className="cancelledScreenWrap errorState">
        <div className="cancelledScreenInner">
          <header className="cancelledScreenHeader">
            <Link href="/my-orders" className="backBtnLink">
              <ArrowBackIosNew fontSize="small" /> Back to My Orders
            </Link>
          </header>
          <div className="errorContainer">
            <Info color="error" fontSize="large" />
            <h2 className="Poppins-semibold">Order Not Found</h2>
            <p className="Poppins-regular">We couldn&apos;t find an order with ID #{id}.</p>
            <Link href="/my-orders" className="returnBtn Poppins-medium">
              Go to My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get current date formatted for display (e.g., "April 26" or current date)
  const formatRefundDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  return (
    <>
      <div className="cancelledScreenWrap">
        <div className="cancelledScreenInner">
          {/* Header Link */}
          <header className="cancelledScreenHeader">
            <Link href={`/my-orders/${order.id}`} className="backBtnLink Poppins-medium">
              <ArrowBackIosNew fontSize="small" className="backArrowIcon" /> Order Details
            </Link>
          </header>

          {/* Centered Page Title */}
          <div className="cancelledStatusTitleContainer">
            <h2 className="cancelledPageTitle Poppins-semibold">Order Cancelled</h2>
          </div>

          {/* Cancelled Items Count */}
          <div className="cancelledItemsSection">
            <h4 className="cancelledCountLabel Poppins-semibold">
              {order.qty} Item{order.qty > 1 ? 's' : ''} Cancelled
            </h4>

            {/* Cancelled Item Card */}
            <div className="cancelledCardList">
              <div className="cancelledItemCard">
                <div className="itemImgContainer">
                  <Image
                    src={order.image}
                    alt={order.productName}
                    width={100}
                    height={100}
                    className="itemImg"
                  />
                </div>
                <div className="itemCardDetails">
                  <p className="itemOrderId Poppins-medium">Order #{order.id}</p>
                  <h4 className="itemProductName Poppins-medium">{order.productName}</h4>
                  <p className="itemMeta Poppins-regular">Qty: {order.qty}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notice Info Box */}
          <div className="noticeInfoBox">
            <div className="noticeRow">
              <CheckCircle className="noticeCheckIcon" />
              <div className="noticeTextContent">
                <h5 className="noticeRowTitle Poppins-semibold">REFUND DETAILS</h5>
                <p className="noticeRowDesc Poppins-regular">
                  A total of Rs. {order.total}/- has been processed to your original mode of payment on {formatRefundDate()}. It will reflect within 2-3 business working days.
                </p>
              </div>
            </div>

            <div className="noticeRow">
              <CheckCircle className="noticeCheckIcon" />
              <div className="noticeTextContent">
                <h5 className="noticeRowTitle Poppins-semibold">PLEASE NOTE</h5>
                <p className="noticeRowDesc Poppins-regular">
                  You will receive an Email/SMS confirming the cancellation of order shortly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />
    </>
  );
}
