/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as badges from "../badges.js";
import type * as chat from "../chat.js";
import type * as comments from "../comments.js";
import type * as feedbacks from "../feedbacks.js";
import type * as follows from "../follows.js";
import type * as likes from "../likes.js";
import type * as myBests from "../myBests.js";
import type * as noodles from "../noodles.js";
import type * as notifications from "../notifications.js";
import type * as ranking from "../ranking.js";
import type * as seed from "../seed.js";
import type * as shops from "../shops.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  badges: typeof badges;
  chat: typeof chat;
  comments: typeof comments;
  feedbacks: typeof feedbacks;
  follows: typeof follows;
  likes: typeof likes;
  myBests: typeof myBests;
  noodles: typeof noodles;
  notifications: typeof notifications;
  ranking: typeof ranking;
  seed: typeof seed;
  shops: typeof shops;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
