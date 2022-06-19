import { createRouter } from ".";
import { prisma } from "../prisma";

export const postRouter = createRouter()
    .query("all", {
        async resolve() {
            return
        }
    });