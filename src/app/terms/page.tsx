import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '利用規約 - Nooodle',
  description: 'Nooodleの利用規約',
};

export default function TermsPage() {
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

        <h1 className="text-3xl font-bold text-gray-900 mb-8">利用規約</h1>

        <div className="prose prose-gray max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第1条（適用）</h2>
            <p className="text-gray-700 leading-relaxed">
              本規約は、本サービスの提供条件及び本サービスの利用に関する当社とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当社との間の本サービスの利用に関わる一切の関係に適用されます。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第2条（定義）</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              本規約において使用する以下の用語は、各々以下に定める意味を有するものとします。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>「サービス」とは、当社が提供する「Nooodle」という名称のラーメン記録・共有サービスを意味します。</li>
              <li>「ユーザー」とは、本サービスを利用する全ての方を意味します。</li>
              <li>「登録情報」とは、ユーザーが本サービスの利用に際して登録した情報を意味します。</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第3条（登録）</h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスの利用を希望する方は、本規約を遵守することに同意し、当社の定める方法によって利用登録を申請し、当社がこれを承認することによって、利用登録が完了するものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第4条（禁止事項）</h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              ユーザーは、本サービスの利用にあたり、以下の各号のいずれかに該当する行為または該当すると当社が判断する行為をしてはなりません。
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>法令に違反する行為または犯罪行為に関連する行為</li>
              <li>当社、本サービスの他のユーザー、または第三者に対する詐欺または脅迫行為</li>
              <li>公序良俗に反する行為</li>
              <li>当社、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシーの権利、名誉、その他の権利または利益を侵害する行為</li>
              <li>本サービスを通じ、以下に該当し、または該当すると当社が判断する情報を送信する行為</li>
              <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
              <li>当社が提供するソフトウェアその他のシステムに対するリバースエンジニアリングその他の解析行為</li>
              <li>本サービスの運営を妨害するおそれのある行為</li>
              <li>当社のネットワークまたはシステム等への不正アクセス</li>
              <li>第三者に成りすます行為</li>
              <li>本サービスの他のユーザーのIDまたはパスワードを利用する行為</li>
              <li>その他、当社が不適切と判断する行為</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第5条（本サービスの停止等）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができるものとします。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第6条（権利帰属）</h2>
            <p className="text-gray-700 leading-relaxed">
              本サービスに関する知的財産権は全て当社または当社にライセンスを許諾している者に帰属しており、本規約に基づく本サービスの利用許諾は、本サービスに関する当社または当社にライセンスを許諾している者の知的財産権の使用許諾を意味するものではありません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第7条（免責事項）</h2>
            <p className="text-gray-700 leading-relaxed">
              当社は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">第8条（準拠法及び管轄裁判所）</h2>
            <p className="text-gray-700 leading-relaxed">
              本規約の準拠法は日本法とし、本規約に起因し、または関連する一切の紛争については、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
