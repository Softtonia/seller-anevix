'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowBackIosNew, Check, Info } from '@mui/icons-material';
import { mockOrders } from '@/utils/ordersData';
import StayUpdated from '../StayUpdated/StayUpdated';
import './OrderTimeline.css';

export default function OrderTimeline({ id }) {
  const [toast, setToast] = useState({ show: false, message: '' });

  // Find order in our shared mock database
  const order = mockOrders.find((o) => o.id === id);

  const triggerSupport = () => {
    setToast({ show: true, message: 'Support request sent! We will contact you shortly.' });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  if (!order) {
    return (
      <div className="timelineWrap errorState">
        <div className="timelineInner">
          <header className="timelineHeader">
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

  return (
    <>
      <div className="timelineWrap">
        <div className="timelineInner">
          {/* Header Link */}
          <header className="timelineHeader">
            <Link href={`/my-orders/${order.id}`} className="backBtnLink Poppins-medium">
              <ArrowBackIosNew fontSize="small" /> Back to Order Details
            </Link>
            <h1 className="Poppins-semibold">Order Timeline</h1>
          </header>

          {/* Timeline Milestones list */}
          <div className="verticalTimeline">
            {order.updates.map((update, index) => {
              const isLast = index === order.updates.length - 1;
              const isCompleted = update.completed;

              return (
                <div className={`timelineStep ${isCompleted ? 'active' : 'inactive'}`} key={index}>
                  <div className="timelineLeft">
                    <div className="statusCheckCircle">
                      {isCompleted ? <Check className="checkIcon" /> : <div className="dotMarker" />}
                    </div>
                    {!isLast && <div className="verticalConnectorLine" />}
                  </div>

                  <div className="timelineRight">
                    <h4 className="updateStepTitle Poppins-semibold">{update.title}</h4>
                    <p className="updateStepDesc Poppins-regular">{update.message}</p>
                    <p className="updateStepTime Poppins-regular">
                      {update.date} <span className="timeSpan">{update.time}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Help Section Card */}
          <div className="helpCardContainer">
            <h4 className="helpCardTitle Poppins-semibold">Need Help with Your Order ?</h4>
            <p className="helpCardDesc Poppins-regular">
              Our support team is here to help you with any questions
            </p>
            <div className="helpCardActions">
              <button className="supportBtn Poppins-medium" onClick={triggerSupport}>
                Contact Support
              </button>
              <Link href={`/my-orders/${order.id}`} className="viewDetailsBtnLink Poppins-medium">
                View Order Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stay Updated Banner */}
      <StayUpdated />

      {/* Toast Alert */}
      {toast.show && (
        <div className="toastContainer success">
          <Check />
          <span className="toastMessage Poppins-medium">{toast.message}</span>
        </div>
      )}
    </>
  );
}
