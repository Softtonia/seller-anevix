'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUpOutlined,
  Inventory2Outlined,
  ShoppingCartOutlined,
  AttachMoneyOutlined,
  PeopleAltOutlined,
  CheckCircle,
  StorefrontOutlined,
  ArrowForwardOutlined,
  HourglassEmptyOutlined,
  AssignmentOutlined,
  AccessTimeFilled,
  PersonOutlineOutlined,
  AddCircleOutlineOutlined
} from '@mui/icons-material';
import { useSeller } from '@/contexts/SellerContext';
import './Dashboard.css';

export default function BusinessDashboardPage() {
  const [user, setUser] = useState({ firstName: 'Seller', lastName: '' });
  const { sellerProfile, isLoading: contextLoading } = useSeller();

  useEffect(() => {
    const init = async () => {
      try {
        const stored = localStorage.getItem('user');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    };
    init();
  }, []);

  const onboardingStatus = sellerProfile?.onboardingStatus || sellerProfile?.status;

  const stats = [
    {
      title: 'Total Revenue',
      value: '₹0.00',
      trend: '+0% this month',
      type: 'revenue',
      icon: <AttachMoneyOutlined />,
    },
    {
      title: 'Total Orders',
      value: '0',
      trend: '0 pending shipments',
      type: 'orders',
      icon: <ShoppingCartOutlined />,
    },
    {
      title: 'Live Products',
      value: '0',
      trend: 'Ready to add products',
      type: 'products',
      icon: <Inventory2Outlined />,
    },
    {
      title: 'Customer Reach',
      value: '0',
      trend: 'New store',
      type: 'customers',
      icon: <PeopleAltOutlined />,
    },
  ];

  if (contextLoading) {
    return <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Loading...</div>;
  }

  if (onboardingStatus === 'UNDER_REVIEW' || onboardingStatus === 'pending') {
    return (
      <>
        <style>{`
          .business-sidebar { display: none !important; }
          .business-topbar { display: none !important; }
          .business-main-wrapper { margin-left: 0 !important; width: 100vw !important; max-width: 100% !important; }
          .business-content { padding: 0 !important; max-width: 100% !important; }
          body, html { margin: 0; padding: 0; background: #fbfbfc; }
        `}</style>
        <div className="under-review-screen-v2">
        <div className="ur-left">
          <div className="ur-illustration">
            <div className="ur-blob"></div>
            <div className="ur-clipboard-box">
              <div className="ur-clip"></div>
              <PersonOutlineOutlined className="ur-avatar-icon" />
              <div className="ur-line"></div>
              <div className="ur-line"></div>
              <div className="ur-line short"></div>
            </div>
            <div className="ur-clock-box">
              <AccessTimeFilled className="ur-clock-icon" />
            </div>
            <div className="ur-star star-1">✦</div>
            <div className="ur-star star-2">✦</div>
            <div className="ur-star star-3">✦</div>
          </div>
          <h1 className="ur-title">Your account is under review</h1>
          <p className="ur-text">
            Thank you for completing your registration! Our team is currently reviewing your details. 
            This process usually takes 24-48 hours. We will notify you via email once your account is activated.
          </p>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome to your Seller Hub, {user.firstName || 'Merchant'}!</h2>
          <p>
            Your seller registration is complete. Start uploading your catalog to start receiving orders across India.
          </p>
        </div>
        <div className="welcome-actions">
          <Link href="/business/catalog-upload" className="welcome-btn primary">
            <AddCircleOutlineOutlined fontSize="small" /> Add First Product
          </Link>
          <Link href="/" className="welcome-btn secondary">
            <StorefrontOutlined fontSize="small" /> Visit Store
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="stat-card">
            <div className={`stat-icon-wrapper ${stat.type}`}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <div className="stat-title">{stat.title}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-trend">{stat.trend}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Orders & Onboarding Steps */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Recent Orders</h3>
            <Link href="/business/orders" className="card-link">
              View All <ArrowForwardOutlined fontSize="small" style={{ verticalAlign: 'middle' }} />
            </Link>
          </div>
          <div className="empty-state-box">
            <ShoppingCartOutlined className="empty-state-icon" />
            <div className="empty-state-title">No orders yet</div>
            <p className="empty-state-desc">
              When customers purchase your listed items, orders will appear here for processing and fulfillment.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
