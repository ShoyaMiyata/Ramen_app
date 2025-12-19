'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { PLANS } from '@/lib/landing-constants';
import Link from 'next/link';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-ramen-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-ramen-300 font-bold tracking-wide uppercase text-sm mb-2">Pricing</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold mb-6">
            あなたに合ったプランを
          </h3>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            まずは無料でスタート。より深く、より熱くラーメン道を極めたい方にはプレミアムプランがおすすめです。
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-center gap-8 items-center md:items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative w-full max-w-sm rounded-2xl p-8 transition-transform hover:-translate-y-2 ${
                plan.recommended
                  ? 'bg-white text-gray-900 shadow-2xl ring-4 ring-ramen-500'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-ramen-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  人気No.1
                </div>
              )}

              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">{plan.name}</h4>
                <div className="text-4xl font-extrabold mb-6">{plan.price}</div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.recommended ? 'text-ramen-600' : 'text-ramen-400'}`} />
                    <span className="text-sm font-medium opacity-90">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.recommended ? '/settings/subscription' : '/'}
                className={`block w-full py-4 text-center rounded-xl font-bold transition-colors ${
                  plan.recommended
                    ? 'bg-ramen-600 hover:bg-ramen-700 text-white shadow-lg'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {plan.ctaText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
