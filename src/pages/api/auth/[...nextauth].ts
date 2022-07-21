import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { prisma } from "src/server/prisma";

export default NextAuth({
    providers: [
        Email({
            from: process.env.MAIL_EMAIL!,
            server: {
                host: "smtp.gmail.com",
                port: 465,
                secure: true,
                auth: {
                    user: 'rbatra486',
                    pass: process.env.MAIL_PASSWORD
                }
            }
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        })
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'database'
    },
    pages: {
        signIn: '/signin'
    }
});