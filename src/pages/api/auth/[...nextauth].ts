import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
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
                    service: 'gmail',
                    // pass: process.env.MAIL_PASSWORD!
                    type: 'OAUTH2',
                    // user: process.env.MAIL_EMAIL!,
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
                }
            },
            secret: 'Teststring',
        })
    ],
    adapter: PrismaAdapter(prisma),
    session: {
        strategy: 'database'
    }
});