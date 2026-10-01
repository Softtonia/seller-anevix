'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { sellerApi } from '@/api';
import { useRouter } from 'next/navigation';

const SellerContext = createContext();

export const SellerProvider = ({ children }) => {
  const [sellerProfile, setSellerProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Ensure we have a user in localStorage before trying to fetch
      const stored = localStorage.getItem('user');
      if (!stored) {
        setIsLoading(false);
        return;
      }

      const res = await sellerApi.getOnboardingProfile();
      // Safely access the profile data depending on how your backend structure returns it
      const profileData = res.data?.profile || res.data?.b2cProfile || {};
      setSellerProfile(profileData);
    } catch (err) {
      console.error('Failed to fetch seller profile:', err);
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <SellerContext.Provider value={{ sellerProfile, isLoading, error, fetchProfile }}>
      {children}
    </SellerContext.Provider>
  );
};

export const useSeller = () => {
  const context = useContext(SellerContext);
  if (!context) {
    throw new Error('useSeller must be used within a SellerProvider');
  }
  return context;
};
