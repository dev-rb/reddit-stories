import * as trpc from "@trpc/server";
import { Context } from "../context";
import { postRouter } from "./post";

export function createRouter() {
    return trpc.router<Context>();
}

export const appRouter = createRouter()
    .merge("post.", postRouter)

export type AppRouter = typeof appRouter;