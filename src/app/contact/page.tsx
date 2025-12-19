'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const submitContact = useMutation(api.contacts.submit);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await submitContact({
        name: formData.name,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
      });

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('Failed to submit contact:', err);
      setError(err instanceof Error ? err.message : 'お問い合わせの送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ramen-600 to-ramen-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/landing"
            className="inline-flex items-center text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ランディングページに戻る
          </Link>
          <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
          <p className="text-ramen-100 text-lg">
            ご質問やご意見、不具合の報告などお気軽にお寄せください
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* 成功メッセージ */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-green-800 font-semibold">お問い合わせを受け付けました</p>
                <p className="text-sm text-green-700 mt-1">
                  ご入力いただいたメールアドレスに確認メールをお送りしました。<br />
                  通常、1〜3営業日以内にご返信いたします。
                </p>
              </div>
            </div>
          )}

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
                お名前 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="山田 太郎"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="example@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
                お問い合わせの種類 <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">選択してください</option>
                <option value="bug">不具合・エラーの報告</option>
                <option value="feature">機能の要望</option>
                <option value="account">アカウントについて</option>
                <option value="subscription">サブスクリプションについて</option>
                <option value="other">その他</option>
              </select>
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-semibold text-gray-900 mb-2">
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="お問い合わせの件名を入力してください"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold text-gray-900 mb-2">
                お問い合わせ内容 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={8}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="できるだけ詳しくお書きください"
                />
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                ※ お問い合わせ内容によっては、回答までに数日お時間をいただく場合がございます。<br />
                ※ 営業目的のお問い合わせはご遠慮ください。
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-ramen-600 hover:bg-ramen-700 text-white font-bold py-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
              <Link
                href="/landing"
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-lg transition-colors text-center"
              >
                キャンセル
              </Link>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">回答時間について</h3>
            <p className="text-sm text-gray-600">
              通常、1〜3営業日以内にご返信いたします。混雑状況により遅れる場合がございます。
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-2">よくある質問</h3>
            <p className="text-sm text-gray-600">
              <Link href="/help" className="text-ramen-600 hover:text-ramen-700 underline">
                ヘルプセンター
              </Link>
              で多くの質問に対する回答をご用意しています。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
