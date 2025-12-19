import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Gamification from '@/components/landing/Gamification';
import Pricing from '@/components/landing/Pricing';
import CallToAction from '@/components/landing/CallToAction';
import Footer from '@/components/landing/Footer';

export const metadata = {
  title: 'Nooodle - その一杯を、伝説にせよ。',
  description: '食べた数だけ強くなる。ラーメン好きのための究極の記録・共有アプリ。あなたの「麺生」を可視化し、目指せ『麺極』！',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <Gamification />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
