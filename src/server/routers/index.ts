import * as trpc from "@trpc/server";
import { Context } from "../context";
import { postRouter } from "./post";
import { storiesRouter } from "./story";

export function createRouter() {
    return trpc.router<Context>();
}

export const appRouter = createRouter()
    .merge("post.", postRouter)
    .merge("story.", storiesRouter)

export type AppRouter = typeof appRouter;