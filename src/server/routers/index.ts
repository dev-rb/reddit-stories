import * as trpc from "@trpc/server";
import { Context } from "../context";
import { adminRouter } from "./admin";
import { postRouter } from "./post";
import { storiesRouter } from "./story";
import { userRouter } from "./user";

export function createRouter() {
    return trpc.router<Context>();
}

export const appRouter = createRouter()
    .merge("post.", postRouter)
    .merge("story.", storiesRouter)
    .merge("admin.", adminRouter)
    .merge("user.", userRouter)

export type AppRouter = typeof appRouter;