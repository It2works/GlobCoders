import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <HowItWorks />
      <Footer />
    </div>
  );
};

export default Index;
