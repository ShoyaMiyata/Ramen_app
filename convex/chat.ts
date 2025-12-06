import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// チャットルームを取得または作成
export const getOrCreateRoom = mutation({
  args: {
    userId1: v.id("users"),
    userId2: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 自分自身とのチャットは不可
    if (args.userId1 === args.userId2) {
      throw new Error("自分自身とはチャットできません");
    }

    // 既存のルームを検索
    const allRooms = await ctx.db.query("chatRooms").collect();
    const existingRoom = allRooms.find(
      (room) =>
        room.participants.includes(args.userId1) &&
        room.participants.includes(args.userId2)
    );

    if (existingRoom) {
      return existingRoom._id;
    }

    // 新しいルームを作成
    const roomId = await ctx.db.insert("chatRooms", {
      participants: [args.userId1, args.userId2],
      createdAt: Date.now(),
    });

    return roomId;
  },
});

// ユーザーのチャットルーム一覧を取得
export const getRooms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allRooms = await ctx.db
      .query("chatRooms")
      .order("desc")
      .collect();

    // 自分が参加しているルームのみフィルタ
    const myRooms = allRooms.filter((room) =>
      room.participants.includes(args.userId)
    );

    // 最終メッセージ日時でソート
    myRooms.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));

    // 相手ユーザーIDを収集してバッチ取得（N+1対策）
    const otherUserIds = myRooms
      .map((room) => room.participants.find((p) => p !== args.userId))
      .filter((id): id is NonNullable<typeof id> => id !== undefined);
    const uniqueUserIds = [...new Set(otherUserIds)];
    const users = await Promise.all(uniqueUserIds.map((id) => ctx.db.get(id)));
    const userMap = new Map(uniqueUserIds.map((id, i) => [id, users[i]]));

    // 全ルームの最新メッセージをバッチ取得
    const lastMessagesPromises = myRooms.map((room) =>
      ctx.db
        .query("chatMessages")
        .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
        .order("desc")
        .first()
    );
    const lastMessages = await Promise.all(lastMessagesPromises);

    // 全ルームの未読メッセージをバッチ取得
    const unreadMessagesPromises = myRooms.map((room) =>
      ctx.db
        .query("chatMessages")
        .withIndex("by_roomId", (q) => q.eq("roomId", room._id))
        .filter((q) =>
          q.and(
            q.neq(q.field("senderId"), args.userId),
            q.eq(q.field("isRead"), false)
          )
        )
        .collect()
    );
    const unreadMessagesPerRoom = await Promise.all(unreadMessagesPromises);

    // 結果をマッピング
    const roomsWithDetails = myRooms.map((room, i) => {
      const otherUserId = room.participants.find((p) => p !== args.userId);
      return {
        ...room,
        otherUser: otherUserId ? userMap.get(otherUserId) ?? null : null,
        lastMessage: lastMessages[i],
        unreadCount: unreadMessagesPerRoom[i].length,
      };
    });

    return roomsWithDetails;
  },
});

// チャットメッセージ一覧を取得（ページネーション対応）
export const getMessages = query({
  args: {
    roomId: v.id("chatRooms"),
    limit: v.optional(v.number()),
    beforeId: v.optional(v.id("chatMessages")), // これより古いメッセージを取得
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    let messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .order("desc") // 新しい順に取得
      .collect();

    // beforeIdが指定されている場合、それより古いメッセージのみ取得
    if (args.beforeId) {
      const beforeIndex = messages.findIndex((m) => m._id === args.beforeId);
      if (beforeIndex !== -1) {
        messages = messages.slice(beforeIndex + 1);
      }
    }

    // limitを適用
    const hasMore = messages.length > limit;
    const items = messages.slice(0, limit);
    const oldestId = hasMore ? items[items.length - 1]._id : null;

    // 表示用に古い順に並べ直す
    items.reverse();

    // 送信者IDを収集してバッチ取得（N+1対策）
    const senderIds = [...new Set(items.map((m) => m.senderId))];
    const senders = await Promise.all(senderIds.map((id) => ctx.db.get(id)));
    const senderMap = new Map(
      senderIds.map((id, i) => [id, senders[i]])
    );

    // メッセージにユーザー情報をマッピング
    const messagesWithUser = items.map((message) => ({
      ...message,
      sender: senderMap.get(message.senderId) ?? null,
    }));

    return {
      items: messagesWithUser,
      hasMore,
      oldestId, // 次回取得時のbeforeIdとして使用
    };
  },
});

// メッセージを送信
export const sendMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // コンテンツの検証
    const content = args.content.trim();
    if (content.length === 0) {
      throw new Error("メッセージを入力してください");
    }
    if (content.length > 1000) {
      throw new Error("メッセージは1000文字以内で入力してください");
    }

    // ルームの存在確認と参加者チェック
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new Error("チャットルームが見つかりません");
    }
    if (!room.participants.includes(args.senderId)) {
      throw new Error("このチャットルームに参加していません");
    }

    const now = Date.now();

    // メッセージを作成
    const messageId = await ctx.db.insert("chatMessages", {
      roomId: args.roomId,
      senderId: args.senderId,
      content,
      isRead: false,
      createdAt: now,
    });

    // ルームの最終メッセージ日時を更新
    await ctx.db.patch(args.roomId, {
      lastMessageAt: now,
    });

    // 相手に通知を送る
    const receiverId = room.participants.find((p) => p !== args.senderId);
    if (receiverId) {
      await ctx.db.insert("notifications", {
        userId: receiverId,
        type: "message",
        fromUserId: args.senderId,
        targetId: args.roomId,
        isRead: false,
        createdAt: now,
      });
    }

    return messageId;
  },
});

// メッセージを既読にする
export const markAsRead = mutation({
  args: {
    roomId: v.id("chatRooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // 自分以外が送信した未読メッセージを取得
    const unreadMessages = await ctx.db
      .query("chatMessages")
      .withIndex("by_roomId", (q) => q.eq("roomId", args.roomId))
      .filter((q) =>
        q.and(
          q.neq(q.field("senderId"), args.userId),
          q.eq(q.field("isRead"), false)
        )
      )
      .collect();

    // 既読にする
    await Promise.all(
      unreadMessages.map((message) =>
        ctx.db.patch(message._id, { isRead: true })
      )
    );

    return unreadMessages.length;
  },
});

// 未読メッセージの総数を取得
export const getTotalUnreadCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // 自分が参加しているルームを取得
    const allRooms = await ctx.db.query("chatRooms").collect();
    const myRooms = allRooms.filter((room) =>
      room.participants.includes(args.userId)
    );

    // 全ルームの未読メッセージを並列で取得（N+1対策）
    const unreadPromises = myRooms.map((room) =>
      ctx.db
        .query("chatMessages")
        .withIndex("by_roomId_isRead", (q) =>
          q.eq("roomId", room._id).eq("isRead", false)
        )
        .filter((q) => q.neq(q.field("senderId"), args.userId))
        .collect()
    );
    const unreadResults = await Promise.all(unreadPromises);

    // 総数を集計
    return unreadResults.reduce((total, messages) => total + messages.length, 0);
  },
});
