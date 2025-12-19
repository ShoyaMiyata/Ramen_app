import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'プライバシーポリシー - Nooodle',
  description: 'Nooodleのプライバシーポリシー',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <Link
          href="/landing"
          className="inline-flex items-center text-ramen-600 hover:text-ramen-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ランディングページに戻る
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <p className="text-gray-700 leading-relaxed">
              Nooodle運営チーム（以下「当社」といいます）は、本サービスにおける、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第1条（収集する情報）</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              当社は、ユーザーから以下の情報を取得します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>氏名またはニックネーム</li>
              <li>メールアドレス</li>
              <li>プロフィール画像</li>
              <li>ラーメン店への訪問記録、評価、コメント</li>
              <li>お気に入り情報</li>
              <li>Cookie、IPアドレス、ブラウザの種類、OSの種類などの技術情報</li>
              <li>決済情報（サブスクリプション登録時）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第2条（利用目的）</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              当社は、取得した情報を以下の目的で利用します。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>本サービスの提供、運営、維持、保護及び改善のため</li>
              <li>本サービスに関するご案内、お問い合わせ等への対応のため</li>
              <li>本サービスに関する当社の規約、ポリシー等に違反する行為に対する対応のため</li>
              <li>本サービスに関する規約等の変更などを通知するため</li>
              <li>キャンペーン、アンケート等の実施のため</li>
              <li>サービスの改善、新サービスの開発等に役立てるため</li>
              <li>本サービスに関連して、個人を識別できない形式に加工した統計データを作成するため</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第3条（第三者提供）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、法令で認められる場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。ただし、以下の場合はこの限りではありません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 mt-2">
              <li>法令に基づく場合</li>
              <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
              <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第4条（外部サービスの利用）</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              本サービスは以下の外部サービスを利用しています。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li><strong>Clerk</strong> - ユーザー認証・アカウント管理</li>
              <li><strong>Convex</strong> - データベース・バックエンド</li>
              <li><strong>Stripe</strong> - 決済処理</li>
              <li><strong>Cloudflare R2</strong> - 画像ストレージ（予定）</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-2">
              これらのサービスは独自のプライバシーポリシーに基づいて運用されています。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第5条（個人情報の開示）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、開示しない決定をした場合には、その旨を遅滞なく通知します。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第6条（個人情報の訂正及び削除）</h2>
            <p className="text-gray-700 leading-relaxed">
              ユーザーは、当社の保有する自己の個人情報が誤った情報である場合には、当社が定める手続きにより、当社に対して個人情報の訂正、追加または削除（以下「訂正等」といいます）を請求することができます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第7条（個人情報の利用停止等）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、本人から、個人情報が、利用目的の範囲を超えて取り扱われているという理由、または不正の手段により取得されたものであるという理由により、その利用の停止または消去（以下「利用停止等」といいます）を求められた場合には、遅滞なく必要な調査を行います。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第8条（Cookie及びアクセス解析ツール）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、ユーザーによる本サービスの利用状況を把握するため、Cookieやアクセス解析ツールを使用することがあります。これらの情報は、サービス向上を目的として使用され、個人を特定するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第9条（プライバシーポリシーの変更）</h2>
            <p className="text-gray-700 leading-relaxed">
              本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、変更することができるものとします。当社が別途定める場合を除いて、変更後のプライバシーポリシーは、本ウェブサイトに掲載したときから効力を生じるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第10条（お問い合わせ窓口）</h2>
            <p className="text-gray-700 leading-relaxed">
              本ポリシーに関するお問い合わせは、本サービス内のお問い合わせフォームまでお願いいたします。
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200 text-right text-sm text-gray-500">
            最終更新日: 2025年12月19日
          </div>
        </div>
      </div>
    </div>
  );
}
