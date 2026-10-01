'use client';
import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';

export default function LayoutContent({ children }) {
  const pathname = usePathname();
  const isBusinessRoute = pathname?.startsWith('/business');

  if (isBusinessRoute) {
    return <main>{children}</main>;
  }

  return (
    <div id="root">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
