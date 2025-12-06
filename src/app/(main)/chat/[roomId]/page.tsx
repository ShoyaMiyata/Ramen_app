"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { LoadingPage, Loading } from "@/components/ui/loading";
import { useTheme } from "@/contexts/ThemeContext";
import { ArrowLeft, Send, ChevronUp } from "lucide-react";

export default function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = use(params);
  const router = useRouter();
  const { user, isLoaded } = useCurrentUser();
  const { themeColor } = useTheme();
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesTopRef = useRef<HTMLDivElement>(null);

  const chatRoomId = roomId as Id<"chatRooms">;

  const messagesData = useQuery(api.chat.getMessages, { roomId: chatRoomId, limit: 50 });
  const rooms = useQuery(
    api.chat.getRooms,
    user?._id ? { userId: user._id } : "skip"
  );
  const sendMessage = useMutation(api.chat.sendMessage);
  const markAsRead = useMutation(api.chat.markAsRead);

  // 現在のルームを取得
  const currentRoom = rooms?.find((r) => r._id === chatRoomId);
  const otherUser = currentRoom?.otherUser;

  // メッセージデータを状態にセット
  useEffect(() => {
    if (messagesData?.items) {
      setAllMessages(messagesData.items);
    }
  }, [messagesData]);

  // メッセージを既読にする
  useEffect(() => {
    if (user?._id && chatRoomId && messagesData?.items?.length) {
      markAsRead({ roomId: chatRoomId, userId: user._id });
    }
  }, [user?._id, chatRoomId, messagesData?.items?.length, markAsRead]);

  // 新しいメッセージが来たら自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  if (!isLoaded || messagesData === undefined || rooms === undefined) {
    return <LoadingPage />;
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">ログインしてください</p>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">チャットルームが見つかりません</p>
        <button
          onClick={() => router.back()}
          className="text-sm underline"
          style={{ color: themeColor }}
        >
          戻る
        </button>
      </div>
    );
  }

  const handleSend = async () => {
    if (!messageText.trim() || isSending) return;
    setIsSending(true);
    try {
      await sendMessage({
        roomId: chatRoomId,
        senderId: user._id,
        content: messageText.trim(),
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "今日";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "昨日";
    } else {
      return date.toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      });
    }
  };

  // メッセージを日付でグループ化
  const groupedMessages: { date: string; messages: typeof allMessages }[] = [];
  let currentDate = "";

  allMessages.forEach((message) => {
    const messageDate = formatDate(message.createdAt);
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <Link
          href={`/users/${otherUser?._id}`}
          className="flex items-center gap-3 flex-1"
        >
          {otherUser?.imageUrl ? (
            <img
              src={otherUser.imageUrl}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
              {otherUser?.name?.charAt(0) || "?"}
            </div>
          )}
          <span className="font-medium text-gray-900">
            {otherUser?.name || "ユーザー"}
          </span>
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Load More Button */}
        {messagesData?.hasMore && (
          <div ref={messagesTopRef} className="text-center">
            <button
              onClick={() => {/* TODO: Load older messages */}}
              className="text-xs flex items-center gap-1 mx-auto px-3 py-1 bg-gray-100 rounded-full hover:bg-gray-200"
            >
              <ChevronUp className="w-3 h-3" />
              過去のメッセージを読み込む
            </button>
          </div>
        )}

        {groupedMessages.map((group, groupIndex) => (
          <div key={groupIndex}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                {group.date}
              </span>
            </div>

            {/* Messages in this group */}
            <div className="space-y-2">
              {group.messages.map((message) => {
                const isMe = message.senderId === user._id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[80%] ${
                        isMe ? "flex-row-reverse" : ""
                      }`}
                    >
                      {!isMe && (
                        <img
                          src={message.sender?.imageUrl || ""}
                          alt=""
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      )}
                      <div
                        className={`px-3 py-2 rounded-2xl ${
                          isMe
                            ? "text-white rounded-br-md"
                            : "bg-gray-100 text-gray-900 rounded-bl-md"
                        }`}
                        style={isMe ? { backgroundColor: themeColor } : {}}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {formatTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim() || isSending}
            className="p-3 rounded-full transition-colors disabled:opacity-50"
            style={{ backgroundColor: themeColor, color: "white" }}
          >
            {isSending ? (
              <Loading size="sm" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
