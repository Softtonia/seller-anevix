'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle, Info, HighlightOff } from '@mui/icons-material';
import { getOrders } from '@/utils/ordersData';
import StayUpdated from '../StayUpdated/StayUpdated';
import './MyOrders.css';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Load orders on mount to ensure localStorage is accessed on the client-side only
  useEffect(() => {
    setOrders(getOrders());
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleOrderAgain = (productName) => {
    showToast(`"${productName}" added to cart!`, 'success');
  };

  return (
    <>
      <div className="ordersWrap">
        <div className="ordersInner">
          <header className="ordersHeader">
            <h1 className="Poppins-semibold">My Orders</h1>
          </header>
          <hr className="headerDivider" />

          <div className="ordersList">
            {orders.map((order) => {
              const isDelivered = order.status === 'delivered';
              const isCancelled = order.status === 'cancelled';

              return (
                <div className="orderCard" key={order.id}>
                  {/* Card Content Top (Details & Buttons) */}
                  <div className="cardTop">
                    <div className="productImgContainer">
                      <Image
                        src={order.image}
                        alt={order.productName}
                        width={120}
                        height={120}
                        className="productImg"
                      />
                    </div>

                    <div className="productDetails">
                      <p className="orderId Poppins-medium">Order #{order.id}</p>
                      <h4 className="productName Poppins-medium">{order.productName}</h4>
                      <p className="productMeta Poppins-regular">
                        <span>Size : {order.size}</span>
                        <span className="metaSeparator">|</span>
                        <span>Qty: {order.qty}</span>
                      </p>
                    </div>

                    <div className="actionButtons desktopActionButtons">
                      <Link
                        href={`/my-orders/${order.id}`}
                        className="detailsBtn Poppins-medium"
                      >
                        Order Details
                      </Link>

                      {!isCancelled && (
                        isDelivered ? (
                          <button
                            className="secondaryBtn Poppins-medium"
                            onClick={() => handleOrderAgain(order.productName)}
                          >
                            Order Again
                          </button>
                        ) : (
                          <Link
                            href={`/my-orders/${order.id}/cancel`}
                            className="secondaryBtn Poppins-medium cancel"
                          >
                            Cancel Order
                          </Link>
                        )
                      )}

                      {isCancelled && (
                        <span className="cancelledBadge Poppins-semibold">
                          <HighlightOff fontSize="small" /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Tracker (Timeline) */}
                  {!isCancelled && (
                    <div className="trackerContainer">
                      <div className="trackerLine">
                        <div
                          className="trackerLineFill"
                          style={{
                            width:
                              order.status === 'confirmed'
                                ? '0%'
                               : order.status === 'preparing'
                                ? '33.33%'
                                : order.status === 'picked-up'
                                ? '66.66%'
                                : '100%',
                          }}
                        />
                      </div>
                      <div className="trackerSteps">
                        {order.statusSteps.map((step) => {
                          let stepClass = 'upcoming';
                          if (step.state === 'completed') {
                            stepClass = 'completed';
                          } else if (step.state === 'current') {
                            stepClass = 'current';
                          }

                          return (
                            <div className={`trackerStep ${stepClass}`} key={step.key}>
                              <div className="stepCircle" />
                              <span className="stepLabel Poppins-regular">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Footer Info */}
                  <div className="orderFooter">
                    <p className="footerText Poppins-regular">
                      {order.paymentMethod}
                      <span className="bulletDot">•</span>
                      {order.timeInfo}
                    </p>
                  </div>

                  {/* Tablet Action Buttons */}
                  <div className="actionButtons tabletActionButtons">
                    <Link
                      href={`/my-orders/${order.id}`}
                      className="detailsBtn Poppins-medium"
                    >
                      Order Details
                    </Link>

                    {!isCancelled && (
                      isDelivered ? (
                        <button
                          className="secondaryBtn Poppins-medium"
                          onClick={() => handleOrderAgain(order.productName)}
                        >
                          Order Again
                        </button>
                      ) : (
                        <Link
                          href={`/my-orders/${order.id}/cancel`}
                          className="secondaryBtn Poppins-medium cancel"
                        >
                          Cancel Order
                        </Link>
                      )
                    )}

                    {isCancelled && (
                      <span className="cancelledBadge Poppins-semibold">
                        <HighlightOff fontSize="small" /> Cancelled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* Toast Alert */}
      {toast.show && (
        <div className={`toastContainer ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle /> : <Info />}
          <span className="toastMessage Poppins-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
