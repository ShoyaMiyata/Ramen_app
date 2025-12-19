'use client';

import React from 'react';
import { ArrowRight, Smartphone } from 'lucide-react';
import { TAGLINE, HERO_DESCRIPTION } from '@/lib/landing-constants';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

const Hero: React.FC = () => {
  const stats = useQuery(api.stats.getLandingStats);

  // 数字のフォーマット関数
  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${Math.floor(num / 10000)}万+`;
    } else if (num >= 1000) {
      return `${Math.floor(num / 1000)}千+`;
    }
    return num.toString();
  };

  return (
    <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&h=1080&fit=crop"
          alt="Delicious Ramen"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-ramen-900/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in-up space-y-6">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-sm font-semibold tracking-wider uppercase mb-4">
            No Ramen, No Life.
          </span>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
            {TAGLINE}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-2xl text-gray-200 leading-relaxed font-light">
            {HERO_DESCRIPTION}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/"
              className="w-full sm:w-auto px-8 py-4 bg-ramen-600 hover:bg-ramen-500 text-white text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              アプリを開く
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/50 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              詳細を見る
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          <div className="mt-12 flex justify-center gap-8 text-sm text-gray-300">
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">
                {stats ? formatNumber(stats.userCount) : '...'}
              </span>
              <span>ユーザー</span>
            </div>
            <div className="bg-white/20 w-px h-10"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">
                {stats ? formatNumber(stats.noodleCount) : '...'}杯
              </span>
              <span>記録突破</span>
            </div>
            <div className="bg-white/20 w-px h-10"></div>
            <div className="flex flex-col items-center">
              <span className="font-bold text-2xl text-white">
                {stats?.rankLevels || 12}階位
              </span>
              <span>ランクシステム</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="#fff7ed"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
