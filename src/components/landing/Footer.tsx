'use client';

import React from 'react';
import { Soup } from 'lucide-react';
import { APP_NAME } from '@/lib/landing-constants';
import Link from 'next/link';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-ramen-600 p-2 rounded-full text-white">
                <Soup size={24} />
              </div>
              <span className="font-bold text-xl text-white">{APP_NAME}</span>
            </div>
            <p className="text-sm text-gray-400">
              食べた数だけ強くなる。<br />
              ラーメン好きのための記録アプリ。
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-bold text-white mb-4">プロダクト</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-ramen-500 transition-colors">機能</a></li>
              <li><a href="#ranks" className="hover:text-ramen-500 transition-colors">ランク制度</a></li>
              <li><a href="#pricing" className="hover:text-ramen-500 transition-colors">料金</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">利用規約</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-ramen-500 transition-colors">利用規約</Link></li>
              <li><Link href="/privacy" className="hover:text-ramen-500 transition-colors">プライバシーポリシー</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-white mb-4">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/help" className="hover:text-ramen-500 transition-colors">ヘルプセンター</Link></li>
              <li><Link href="/contact" className="hover:text-ramen-500 transition-colors">お問い合わせ</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-800 text-center text-sm">
          <p>&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
