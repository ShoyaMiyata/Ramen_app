'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { LoadingPage } from '@/components/ui/loading';
import { ArrowLeft, Filter, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Id } from '../../../../convex/_generated/dataModel';

type StatusType = 'new' | 'in_progress' | 'resolved';
type CategoryType = 'bug' | 'feature' | 'account' | 'subscription' | 'other';

const STATUS_LABELS: Record<StatusType, string> = {
  new: '未対応',
  in_progress: '対応中',
  resolved: '解決済み',
};

const STATUS_COLORS: Record<StatusType, string> = {
  new: 'bg-red-100 text-red-800 border-red-200',
  in_progress: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  resolved: 'bg-green-100 text-green-800 border-green-200',
};

const CATEGORY_LABELS: Record<CategoryType, string> = {
  bug: '不具合・エラーの報告',
  feature: '機能の要望',
  account: 'アカウントについて',
  subscription: 'サブスクリプションについて',
  other: 'その他',
};

export default function AdminContactsPage() {
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const [statusFilter, setStatusFilter] = useState<StatusType | ''>('');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const contacts = useQuery(api.contacts.list, statusFilter ? { status: statusFilter } : {});
  const updateStatus = useMutation(api.contacts.updateStatus);

  // 管理者チェック
  if (isLoaded && !user?.isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス権限がありません</h1>
          <p className="text-gray-600 mb-6">このページは管理者のみアクセスできます。</p>
          <button
            onClick={() => router.back()}
            className="bg-ramen-600 hover:bg-ramen-700 text-white px-6 py-2 rounded-lg"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded || !contacts) {
    return <LoadingPage />;
  }

  const handleStatusChange = async (contactId: Id<'contacts'>, newStatus: StatusType) => {
    try {
      await updateStatus({ contactId, status: newStatus });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const openContactDetail = (contact: any) => {
    setSelectedContact(contact);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'new':
        return <Mail className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    if (statusFilter && contact.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold">お問い合わせ管理</h1>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="font-semibold text-gray-900">フィルター</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === ''
                  ? 'bg-ramen-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              すべて ({contacts.length})
            </button>
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status as StatusType)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-ramen-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({contacts.filter((c) => c.status === status).length})
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>お問い合わせはありません</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      ステータス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      カテゴリ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      件名
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      名前
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      メールアドレス
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      受信日時
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredContacts.map((contact) => (
                    <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                            STATUS_COLORS[contact.status as StatusType] || STATUS_COLORS.new
                          }`}
                        >
                          {getStatusIcon(contact.status)}
                          {STATUS_LABELS[contact.status as StatusType] || '未対応'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {CATEGORY_LABELS[contact.category as CategoryType]}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900 max-w-xs truncate">
                        {contact.subject}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">{contact.name}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">{contact.email}</td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {new Date(contact.createdAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => openContactDetail(contact)}
                          className="text-ramen-600 hover:text-ramen-700 text-sm font-medium"
                        >
                          詳細
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    お問い合わせ詳細
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${
                      STATUS_COLORS[selectedContact.status as StatusType] || STATUS_COLORS.new
                    }`}
                  >
                    {getStatusIcon(selectedContact.status)}
                    {STATUS_LABELS[selectedContact.status as StatusType] || '未対応'}
                  </span>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    カテゴリ
                  </label>
                  <p className="text-gray-900">
                    {CATEGORY_LABELS[selectedContact.category as CategoryType]}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    件名
                  </label>
                  <p className="text-gray-900">{selectedContact.subject}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    お問い合わせ内容
                  </label>
                  <p className="text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {selectedContact.message}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      お名前
                    </label>
                    <p className="text-gray-900">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      メールアドレス
                    </label>
                    <p className="text-gray-900">{selectedContact.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    受信日時
                  </label>
                  <p className="text-gray-900">
                    {new Date(selectedContact.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>

                {/* Status Update */}
                <div className="pt-4 border-t">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    ステータスを変更
                  </label>
                  <div className="flex gap-2">
                    {Object.entries(STATUS_LABELS).map(([status, label]) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedContact._id, status as StatusType)}
                        disabled={selectedContact.status === status}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                          selectedContact.status === status
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-ramen-600 hover:bg-ramen-700 text-white'
                        }`}
                      >
                        {label}に変更
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium"
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
