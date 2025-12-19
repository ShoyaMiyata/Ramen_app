'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CallToAction: React.FC = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-ramen-600 to-ramen-800 text-white relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
          今すぐ、あなたの麺生を記録しよう
        </h2>
        <p className="text-lg md:text-xl text-ramen-100 mb-10 leading-relaxed">
          毎日の一杯が、あなたの伝説になる。<br />
          Nooodleで、ラーメン愛好家としての旅を始めませんか？
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="px-10 py-4 bg-white text-ramen-600 text-lg font-bold rounded-xl transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 flex items-center gap-2"
          >
            アプリを開く
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/sign-in"
            className="px-10 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-xl transition-all hover:bg-white/10 flex items-center gap-2"
          >
            ログイン
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
