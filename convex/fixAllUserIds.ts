import { mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * 全テーブルのuserIdを一括更新
 */
export const fixAllUserIds = mutation({
  args: {},
  handler: async (ctx) => {
    // 古いuserIdから新しいuserIdへのマッピング
    const USER_ID_MAPPING: Record<string, string> = {
      // yuko
      "js73sce5peh0xc1hth3hxwk5bd7wvrcg": "js7ak19fpw4a4fzzdmdjbsfwt57xpt8d",
      // yoshida
      "js7dzek64mnwn8cmndgfmm7nn17wtg6g": "js751bxqxr17wjwyan8zbtg2ex7xp696",
      // Shoya Miyata (miyasho)
      "js77sahcrddp8csfxnhrbwc7mx7wraaz": "js74p31qa5vxwdhgn34gjq3ezh7xqt0d",
    };

    const results: Record<string, number> = {};

    // 1. noodles
    const noodles = await ctx.db.query("noodles").collect();
    let noodlesUpdated = 0;
    for (const noodle of noodles) {
      const newUserId = USER_ID_MAPPING[noodle.userId];
      if (newUserId) {
        await ctx.db.patch(noodle._id, { userId: newUserId as Id<"users"> });
        noodlesUpdated++;
      }
    }
    results.noodles = noodlesUpdated;

    // 2. likes
    const likes = await ctx.db.query("likes").collect();
    let likesUpdated = 0;
    for (const like of likes) {
      const newUserId = USER_ID_MAPPING[like.userId];
      if (newUserId) {
        await ctx.db.patch(like._id, { userId: newUserId as Id<"users"> });
        likesUpdated++;
      }
    }
    results.likes = likesUpdated;

    // 3. userBadges
    const userBadges = await ctx.db.query("userBadges").collect();
    let badgesUpdated = 0;
    for (const badge of userBadges) {
      const newUserId = USER_ID_MAPPING[badge.userId];
      if (newUserId) {
        await ctx.db.patch(badge._id, { userId: newUserId as Id<"users"> });
        badgesUpdated++;
      }
    }
    results.userBadges = badgesUpdated;

    // 4. myBests
    const myBests = await ctx.db.query("myBests").collect();
    let myBestsUpdated = 0;
    for (const myBest of myBests) {
      const newUserId = USER_ID_MAPPING[myBest.userId];
      if (newUserId) {
        await ctx.db.patch(myBest._id, { userId: newUserId as Id<"users"> });
        myBestsUpdated++;
      }
    }
    results.myBests = myBestsUpdated;

    // 5. follows (followerId + followingId)
    const follows = await ctx.db.query("follows").collect();
    let followsUpdated = 0;
    for (const follow of follows) {
      const newFollowerId = USER_ID_MAPPING[follow.followerId];
      const newFollowingId = USER_ID_MAPPING[follow.followingId];
      if (newFollowerId || newFollowingId) {
        await ctx.db.patch(follow._id, {
          followerId: (newFollowerId || follow.followerId) as Id<"users">,
          followingId: (newFollowingId || follow.followingId) as Id<"users">,
        });
        followsUpdated++;
      }
    }
    results.follows = followsUpdated;

    // 6. followRequests (requesterId + targetId)
    const followRequests = await ctx.db.query("followRequests").collect();
    let followRequestsUpdated = 0;
    for (const request of followRequests) {
      const newRequesterId = USER_ID_MAPPING[request.requesterId];
      const newTargetId = USER_ID_MAPPING[request.targetId];
      if (newRequesterId || newTargetId) {
        await ctx.db.patch(request._id, {
          requesterId: (newRequesterId || request.requesterId) as Id<"users">,
          targetId: (newTargetId || request.targetId) as Id<"users">,
        });
        followRequestsUpdated++;
      }
    }
    results.followRequests = followRequestsUpdated;

    // 7. feedbacks
    const feedbacks = await ctx.db.query("feedbacks").collect();
    let feedbacksUpdated = 0;
    for (const feedback of feedbacks) {
      const newUserId = USER_ID_MAPPING[feedback.userId];
      if (newUserId) {
        await ctx.db.patch(feedback._id, { userId: newUserId as Id<"users"> });
        feedbacksUpdated++;
      }
    }
    results.feedbacks = feedbacksUpdated;

    // 8. feedbackSteams
    const feedbackSteams = await ctx.db.query("feedbackSteams").collect();
    let steamsUpdated = 0;
    for (const steam of feedbackSteams) {
      const newUserId = USER_ID_MAPPING[steam.userId];
      if (newUserId) {
        await ctx.db.patch(steam._id, { userId: newUserId as Id<"users"> });
        steamsUpdated++;
      }
    }
    results.feedbackSteams = steamsUpdated;

    // 9. notifications (userId + fromUserId)
    const notifications = await ctx.db.query("notifications").collect();
    let notificationsUpdated = 0;
    for (const notification of notifications) {
      const newUserId = USER_ID_MAPPING[notification.userId];
      const newFromUserId = notification.fromUserId ? USER_ID_MAPPING[notification.fromUserId] : undefined;
      if (newUserId || newFromUserId) {
        await ctx.db.patch(notification._id, {
          userId: (newUserId || notification.userId) as Id<"users">,
          fromUserId: newFromUserId ? (newFromUserId as Id<"users">) : notification.fromUserId,
        });
        notificationsUpdated++;
      }
    }
    results.notifications = notificationsUpdated;

    // 10. comments
    const comments = await ctx.db.query("comments").collect();
    let commentsUpdated = 0;
    for (const comment of comments) {
      const newUserId = USER_ID_MAPPING[comment.userId];
      if (newUserId) {
        await ctx.db.patch(comment._id, { userId: newUserId as Id<"users"> });
        commentsUpdated++;
      }
    }
    results.comments = commentsUpdated;

    // 11. commentLikes
    const commentLikes = await ctx.db.query("commentLikes").collect();
    let commentLikesUpdated = 0;
    for (const commentLike of commentLikes) {
      const newUserId = USER_ID_MAPPING[commentLike.userId];
      if (newUserId) {
        await ctx.db.patch(commentLike._id, { userId: newUserId as Id<"users"> });
        commentLikesUpdated++;
      }
    }
    results.commentLikes = commentLikesUpdated;

    // 12. chatRooms (participants array)
    const chatRooms = await ctx.db.query("chatRooms").collect();
    let chatRoomsUpdated = 0;
    for (const room of chatRooms) {
      const newParticipants = room.participants.map((userId) => (USER_ID_MAPPING[userId] || userId) as Id<"users">);
      if (JSON.stringify(newParticipants) !== JSON.stringify(room.participants)) {
        await ctx.db.patch(room._id, { participants: newParticipants });
        chatRoomsUpdated++;
      }
    }
    results.chatRooms = chatRoomsUpdated;

    // 13. chatMessages (senderId)
    const chatMessages = await ctx.db.query("chatMessages").collect();
    let chatMessagesUpdated = 0;
    for (const message of chatMessages) {
      const newSenderId = USER_ID_MAPPING[message.senderId];
      if (newSenderId) {
        await ctx.db.patch(message._id, { senderId: newSenderId as Id<"users"> });
        chatMessagesUpdated++;
      }
    }
    results.chatMessages = chatMessagesUpdated;

    // 14. prefectureBadges
    const prefectureBadges = await ctx.db.query("prefectureBadges").collect();
    let prefectureUpdated = 0;
    for (const badge of prefectureBadges) {
      const newUserId = USER_ID_MAPPING[badge.userId];
      if (newUserId) {
        await ctx.db.patch(badge._id, { userId: newUserId as Id<"users"> });
        prefectureUpdated++;
      }
    }
    results.prefectureBadges = prefectureUpdated;

    // 15. stations (registeredBy)
    const stations = await ctx.db.query("stations").collect();
    let stationsUpdated = 0;
    for (const station of stations) {
      if (station.registeredBy) {
        const newUserId = USER_ID_MAPPING[station.registeredBy];
        if (newUserId) {
          await ctx.db.patch(station._id, { registeredBy: newUserId as Id<"users"> });
          stationsUpdated++;
        }
      }
    }
    results.stations = stationsUpdated;

    // 16. contacts (userId - optional)
    const contacts = await ctx.db.query("contacts").collect();
    let contactsUpdated = 0;
    for (const contact of contacts) {
      if (contact.userId) {
        const newUserId = USER_ID_MAPPING[contact.userId];
        if (newUserId) {
          await ctx.db.patch(contact._id, { userId: newUserId as Id<"users"> });
          contactsUpdated++;
        }
      }
    }
    results.contacts = contactsUpdated;

    // 17. groups (creatorId)
    const groups = await ctx.db.query("groups").collect();
    let groupsUpdated = 0;
    for (const group of groups) {
      const newCreatorId = USER_ID_MAPPING[group.creatorId];
      if (newCreatorId) {
        await ctx.db.patch(group._id, { creatorId: newCreatorId as Id<"users"> });
        groupsUpdated++;
      }
    }
    results.groups = groupsUpdated;

    // 18. groupMembers
    const groupMembers = await ctx.db.query("groupMembers").collect();
    let groupMembersUpdated = 0;
    for (const member of groupMembers) {
      const newUserId = USER_ID_MAPPING[member.userId];
      if (newUserId) {
        await ctx.db.patch(member._id, { userId: newUserId as Id<"users"> });
        groupMembersUpdated++;
      }
    }
    results.groupMembers = groupMembersUpdated;

    // 19. appSettings (updatedBy - optional)
    const appSettings = await ctx.db.query("appSettings").collect();
    let appSettingsUpdated = 0;
    for (const setting of appSettings) {
      if (setting.updatedBy) {
        const newUserId = USER_ID_MAPPING[setting.updatedBy];
        if (newUserId) {
          await ctx.db.patch(setting._id, { updatedBy: newUserId as Id<"users"> });
          appSettingsUpdated++;
        }
      }
    }
    results.appSettings = appSettingsUpdated;

    return {
      success: true,
      results,
      totalUpdated: Object.values(results).reduce((sum, count) => sum + count, 0),
    };
  },
});
