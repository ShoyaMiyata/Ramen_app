import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, BookOpen, HelpCircle } from 'lucide-react';

export const metadata = {
  title: 'ヘルプセンター - Nooodle',
  description: 'Nooodleのヘルプとよくある質問',
};

export default function HelpPage() {
  const faqs = [
    {
      category: '基本的な使い方',
      items: [
        {
          question: 'Nooodleとは何ですか？',
          answer: 'Nooodleは、ラーメン好きのための記録・共有アプリです。訪問したラーメン店や食べたメニューを記録し、他のユーザーと共有できます。',
        },
        {
          question: 'アカウントの作成方法は？',
          answer: 'トップページの「無料で始める」ボタンをクリックし、メールアドレスまたはソーシャルアカウント（Google等）で登録できます。',
        },
        {
          question: 'ラーメン記録の投稿方法は？',
          answer: 'ログイン後、「新規投稿」ボタンから店舗名、商品名、ジャンル、評価、コメントなどを入力して投稿できます。',
        },
      ],
    },
    {
      category: '機能について',
      items: [
        {
          question: 'お気に入り機能とは？',
          answer: '他のユーザーの投稿を「お気に入り」に登録することで、気になるお店や行きたいお店をリストで管理できます。',
        },
        {
          question: 'ランク制度について教えてください',
          answer: '訪問店舗数に応じて「麺位十二階」のランクが上がります。初級の「麺見習い」から最高位の「麺極」まで、目指して楽しめます。',
        },
        {
          question: 'バッジはどうやって獲得できますか？',
          answer: '投稿数、訪問店舗数、ジャンル制覇など、特定の条件を達成すると自動的にバッジが付与されます。',
        },
      ],
    },
    {
      category: 'プレミアムプラン',
      items: [
        {
          question: 'プレミアムプランの特典は？',
          answer: '無制限の投稿・お気に入り、画像アップロード、AI分析機能、限定バッジなどが利用できます。',
        },
        {
          question: 'プレミアムプランの料金は？',
          answer: '月額500円（税込）です。いつでもキャンセル可能です。',
        },
        {
          question: 'プレミアムプランの解約方法は？',
          answer: 'マイページの「設定」→「サブスクリプション管理」から、いつでも解約できます。',
        },
      ],
    },
    {
      category: 'トラブルシューティング',
      items: [
        {
          question: 'ログインできません',
          answer: 'パスワードをお忘れの場合は、ログイン画面の「パスワードを忘れた方」から再設定してください。それでも解決しない場合は、お問い合わせフォームからご連絡ください。',
        },
        {
          question: '投稿した記録が表示されません',
          answer: 'ページを再読み込みしてみてください。それでも表示されない場合は、一時的な不具合の可能性がありますので、時間をおいて再度お試しください。',
        },
        {
          question: 'アカウントを削除したい',
          answer: 'マイページの「設定」→「アカウント設定」から削除できます。削除すると投稿データも削除されますのでご注意ください。',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-ramen-600 to-ramen-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/landing"
            className="inline-flex items-center text-white/90 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            ランディングページに戻る
          </Link>
          <h1 className="text-4xl font-bold mb-4">ヘルプセンター</h1>
          <p className="text-ramen-100 text-lg">
            Nooodleの使い方やよくある質問をご案内します
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="質問を検索..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ramen-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {faqs.map((category) => (
            <div key={category.category} className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <BookOpen className="w-6 h-6 mr-2 text-ramen-600" />
                {category.category}
              </h2>
              <div className="space-y-4">
                {category.items.map((item, idx) => (
                  <details
                    key={idx}
                    className="group border-b border-gray-200 last:border-0 pb-4 last:pb-0"
                  >
                    <summary className="flex items-start cursor-pointer list-none">
                      <HelpCircle className="w-5 h-5 mr-3 mt-0.5 text-ramen-600 flex-shrink-0" />
                      <span className="font-semibold text-gray-900 group-hover:text-ramen-600 transition-colors">
                        {item.question}
                      </span>
                    </summary>
                    <p className="mt-3 ml-8 text-gray-700 leading-relaxed">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-ramen-50 border border-ramen-200 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            解決しない問題がありますか？
          </h3>
          <p className="text-gray-700 mb-6">
            お気軽にお問い合わせください。できるだけ早く対応させていただきます。
          </p>
          <Link
            href="/contact"
            className="inline-block bg-ramen-600 hover:bg-ramen-700 text-white font-bold px-8 py-3 rounded-lg transition-colors"
          >
            お問い合わせフォームへ
          </Link>
        </div>
      </div>
    </div>
  );
}
