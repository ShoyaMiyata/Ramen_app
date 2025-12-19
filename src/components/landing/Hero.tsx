'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Smartphone } from 'lucide-react';
import { TAGLINE, HERO_DESCRIPTION } from '@/lib/landing-constants';
import Link from 'next/link';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

// ヒーロー画像の配列
const HERO_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?w=1920&h=1080&fit=crop&q=80',
    alt: '箸で持ち上げる本格ラーメン',
  },
  {
    url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=1920&h=1080&fit=crop&q=80',
    alt: '伝統的な醤油ラーメン',
  },
  {
    url: 'https://images.unsplash.com/photo-1623341214825-9f4f963727da?w=1920&h=1080&fit=crop&q=80',
    alt: '特製醤油ラーメン',
  },
  {
    url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&h=1080&fit=crop&q=80',
    alt: '濃厚とんこつラーメン',
  },
  {
    url: 'https://images.unsplash.com/photo-1632709810780-b5a4343cebec?w=1920&h=1080&fit=crop&q=80',
    alt: '味噌ラーメン',
  },
  {
    url: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=1920&h=1080&fit=crop&q=80',
    alt: '塩ラーメン',
  },
];

const Hero: React.FC = () => {
  const stats = useQuery(api.stats.getLandingStats);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 5秒ごとに画像を切り替え
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <section className="relative w-full h-screen min-h-[500px] sm:min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {HERO_IMAGES.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={image.alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              index === currentImageIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-ramen-900/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
        <div className="animate-fade-in-up space-y-4 sm:space-y-6">
          <span className="inline-block px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-xs sm:text-sm font-semibold tracking-wider uppercase mb-2 sm:mb-4">
            No Ramen, No Life.
          </span>

          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-lg px-2">
            {TAGLINE}
          </h1>

          <p className="mt-3 sm:mt-4 max-w-2xl mx-auto text-base sm:text-xl md:text-2xl text-gray-200 leading-relaxed font-light px-4">
            {HERO_DESCRIPTION}
          </p>

          <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-ramen-600 hover:bg-ramen-500 text-white text-base sm:text-lg font-bold rounded-xl transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 sm:w-5 sm:h-5" />
              アプリを開く
            </Link>
            <a
              href="#features"
              className="w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/50 text-base sm:text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              詳細を見る
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8 text-xs sm:text-sm text-gray-300 px-4">
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="font-bold text-xl sm:text-2xl text-white">
                {stats ? formatNumber(stats.userCount) : '...'}
              </span>
              <span className="text-xs sm:text-sm mt-1">ユーザー</span>
            </div>
            <div className="bg-white/20 w-px h-8 sm:h-10 self-center"></div>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="font-bold text-xl sm:text-2xl text-white">
                {stats ? formatNumber(stats.noodleCount) : '...'}杯
              </span>
              <span className="text-xs sm:text-sm mt-1">記録突破</span>
            </div>
            <div className="bg-white/20 w-px h-8 sm:h-10 self-center"></div>
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="font-bold text-xl sm:text-2xl text-white">
                {stats?.rankLevels || 12}階位
              </span>
              <span className="text-xs sm:text-sm mt-1">ランクシステム</span>
            </div>
          </div>
        </div>
      </div>

      {/* Image Indicators */}
      <div className="absolute bottom-24 sm:bottom-32 left-1/2 transform -translate-x-1/2 z-20 flex gap-1.5 sm:gap-2">
        {HERO_IMAGES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white w-6 sm:w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`画像 ${index + 1} に切り替え`}
          />
        ))}
      </div>

      {/* Decorative Wave at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 sm:h-20 md:h-auto">
          <path d="M0 60L48 55C96 50 192 40 288 45C384 50 480 70 576 75C672 80 768 70 864 60C960 50 1056 40 1152 45C1248 50 1344 70 1392 80L1440 90V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0V60Z" fill="#fff7ed"/>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
