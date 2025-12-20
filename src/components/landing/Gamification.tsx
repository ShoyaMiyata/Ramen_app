'use client';

import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';
import { FEATURED_RANKS, BADGES } from '@/lib/landing-constants';

const Gamification: React.FC = () => {
  return (
    <section id="ranks" className="py-24 bg-white overflow-hidden relative">
      {/* Decorative background pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
         <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <pattern id="pattern-circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="2" className="text-ramen-900" fill="currentColor" />
            </pattern>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-circles)" />
         </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 items-center">

          {/* Rank System */}
          <div className="w-full lg:w-1/2">
            <h2 className="text-ramen-600 font-bold tracking-wide uppercase text-sm mb-2">Rank System</h2>
            <h3 className="text-4xl font-extrabold text-gray-900 mb-6">
              記録が増えると、ランクアップ
            </h3>
            <p className="text-lg text-gray-600 mb-10">
              訪問したお店の数に応じてランクが上がります。ランクが上がると、アプリ内のテーマカラーが変わります。
            </p>

            <div className="space-y-4">
              {FEATURED_RANKS.map((rank, idx) => (
                <div
                  key={rank.name}
                  className={`flex items-center p-4 rounded-xl border-l-4 shadow-sm transition-all hover:shadow-md bg-white ${
                    idx === FEATURED_RANKS.length - 1 ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${rank.color}`}>
                    {rank.level}
                  </div>
                  <div className="ml-5 flex-1">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-gray-900">{rank.name}</h4>
                      {idx === FEATURED_RANKS.length - 1 && <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">最高ランク</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{rank.description}</p>
                    <p className="text-xs text-gray-400 mt-1">{rank.requiredShops}店舗〜</p>
                  </div>
                </div>
              ))}
              <div className="text-center pt-4">
                <button className="text-ramen-600 font-semibold flex items-center justify-center mx-auto hover:underline gap-1">
                  全12階位を見る <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Badges System */}
          <div className="w-full lg:w-1/2 bg-gray-50 p-8 rounded-3xl border border-gray-100 shadow-inner">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">バッジを集めよう</h3>
              <p className="text-gray-500">
                記録を続けていると、自動的にバッジが獲得できます。プロフィールに表示して、あなたのラーメン好きをアピール。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {BADGES.map((badge) => (
                <div key={badge.id} className="bg-white p-4 rounded-2xl shadow-sm flex flex-col items-center text-center border border-gray-100">
                  <div className="text-4xl mb-3">{badge.iconName}</div>
                  <h5 className="font-bold text-gray-800 text-sm">{badge.name}</h5>
                  <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                </div>
              ))}
              {/* Mystery Badge */}
              <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                <div className="text-gray-400 mb-2">
                  <Lock size={32} />
                </div>
                <h5 className="font-bold text-gray-500 text-sm">???</h5>
                <p className="text-xs text-gray-400 mt-1">シークレットバッジ</p>
              </div>
               <div className="bg-gray-100 p-4 rounded-2xl border border-gray-200 border-dashed flex flex-col items-center justify-center text-center opacity-70">
                <div className="text-gray-400 mb-2">
                  <Lock size={32} />
                </div>
                <h5 className="font-bold text-gray-500 text-sm">???</h5>
                <p className="text-xs text-gray-400 mt-1">シークレットバッジ</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Gamification;
