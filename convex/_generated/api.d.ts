/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as documents from "../documents.js";
import type * as filestorage from "../filestorage.js";
import type * as flashcards from "../flashcards.js";
import type * as ingest from "../ingest.js";
import type * as myAction from "../myAction.js";
import type * as quizzes from "../quizzes.js";
import type * as schedules from "../schedules.js";
import type * as tasks from "../tasks.js";
import type * as user from "../user.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  filestorage: typeof filestorage;
  flashcards: typeof flashcards;
  ingest: typeof ingest;
  myAction: typeof myAction;
  quizzes: typeof quizzes;
  schedules: typeof schedules;
  tasks: typeof tasks;
  user: typeof user;
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
