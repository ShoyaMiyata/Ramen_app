'use client';

import React from 'react';
import { FEATURES } from '@/lib/landing-constants';

const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-ramen-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-ramen-600 font-bold tracking-wide uppercase text-sm mb-2">Features</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
            ラーメン愛好家のための<br />充実の機能
          </h3>
          <p className="text-lg text-gray-600">
            ただ記録するだけじゃない。あなたのラーメンライフをより豊かに、より楽しくするためのこだわり機能。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="bg-white rounded-2xl p-8 shadow-xl shadow-ramen-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-ramen-100 flex flex-col items-center text-center group"
              >
                <div className="w-16 h-16 bg-ramen-100 text-ramen-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-ramen-600 group-hover:text-white transition-colors duration-300">
                  <Icon size={32} strokeWidth={2} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
