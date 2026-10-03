'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  AddCircleOutlineOutlined,
  LogoutOutlined
} from '@mui/icons-material';
import { useSeller } from '@/contexts/SellerContext';
import { authApi } from '@/api';
import './Dashboard.css';

export default function BusinessDashboardPage() {
  const router = useRouter();
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
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '100px' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #f3f3f3', borderTop: '3px solid #f97316', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (onboardingStatus === 'REJECTED' || onboardingStatus === 'PENDING' || onboardingStatus === 'pending' || onboardingStatus === 'IN_PROGRESS' || onboardingStatus === 'DRAFT') {
    if (typeof window !== 'undefined') {
      window.location.href = '/business/onboarding';
    }
    return <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>Redirecting to Onboarding...</div>;
  }

  if (onboardingStatus === 'UNDER_REVIEW') {
    return (
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
          <button 
            onClick={async () => { await authApi.logout(); router.push('/signup'); }} 
            style={{ 
              marginTop: '32px', 
              padding: '12px 24px', 
              backgroundColor: '#fff', 
              color: '#ef4444', 
              border: '1px solid #fecaca', 
              borderRadius: '8px', 
              fontSize: '15px', 
              fontWeight: '600', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <LogoutOutlined fontSize="small" /> Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h2>Welcome to your Seller Hub, {sellerProfile?.personalInfo?.fullName?.split(' ')[0] || sellerProfile?.firstName || user.firstName || 'Merchant'}!</h2>
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
