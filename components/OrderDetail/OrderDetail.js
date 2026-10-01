'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowBackIosNew, Info } from '@mui/icons-material';
import { mockOrders } from '@/utils/ordersData';
import StayUpdated from '../StayUpdated/StayUpdated';
import './OrderDetail.css';

export default function OrderDetail({ id }) {
  // Find order in our shared mock database
  const order = mockOrders.find((o) => o.id === id);

  if (!order) {
    return (
      <div className="orderDetailWrap errorState">
        <div className="orderDetailInner">
          <header className="orderDetailHeader">
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

  const isCancelled = order.status === 'cancelled';

  // Capitalize first letter of status for display
  const displayStatus = order.status.charAt(0).toUpperCase() + order.status.slice(1);

  return (
    <>
      <div className="orderDetailWrap">
        <div className="orderDetailInner">
          {/* Header Link */}
          <header className="orderDetailHeader">
            <Link href="/my-orders" className="backBtnLink Poppins-medium">
              <ArrowBackIosNew fontSize="small" /> Back to My Orders
            </Link>
            <h1 className="Poppins-semibold">Order Details</h1>
          </header>

          {/* Product Summary Block (Matches mockup style) */}
          <div className="productSummaryCard">
            <div className="summaryImgContainer">
              <Image
                src={order.image}
                alt={order.productName}
                width={120}
                height={120}
                className="summaryImg"
              />
            </div>
            <div className="summaryDetails">
              <p className="summaryOrderId Poppins-medium">Order #{order.id}</p>
              <h4 className="summaryProductName Poppins-medium">{order.productName}</h4>
              <p className="summaryMeta Poppins-regular">
                <span>Size : {order.size}</span>
                <span className="summaryMetaSeparator">|</span>
                <span>Qty: {order.qty}</span>
              </p>
            </div>
          </div>

          {/* Status Box */}
          <div className={`statusInfoBox ${order.status}`}>
            <div className="statusHeader">
              <h4 className="statusTitle Poppins-semibold">
                {isCancelled ? 'Cancelled' : `${displayStatus} , ${order.deliveryDate}`}
              </h4>
              <p className="statusMessage Poppins-regular">
                {isCancelled ? 'This order was cancelled.' : order.deliveryMessage}
              </p>
            </div>

            {/* Link to Timeline Page */}
            {!isCancelled && order.updates && order.updates.length > 0 && (
              <Link
                href={`/my-orders/${order.id}/timeline`}
                className="toggleUpdatesBtn Poppins-medium"
              >
                See all updates
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />
    </>
  );
}
