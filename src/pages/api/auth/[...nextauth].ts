import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { prisma } from "src/server/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {

    if (req.query.nextauth.includes('signup')) {
        const requestEmail = req.body.email;

        const exists = await prisma.user.findUnique({
            where: {
                email: requestEmail
            }
        });

        if (exists) {
            throw new Error('Email already in use')
            return;
        }
    }

    return await NextAuth(req, res, {
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
        secret: process.env.NEXTAUTH_SECRET,
        adapter: PrismaAdapter(prisma),
        callbacks: {
            session: async ({ session, user }) => {
                return { ...session, user: user };
            },
            signIn: async ({ account, email, profile, user }) => {
                const exists = await prisma.user.findUnique({
                    where: {
                        id: user.id
                    }
                })
                if (user.id) {

                    if (exists) {
                        return true;
                    } else {
                        throw new Error('Invalid Email')
                    }
                }

                if (exists) {
                    throw new Error('Email already in use')
                }

                return true;
            }
        },
        session: {
            strategy: 'database'
        },
        pages: {
            signIn: '/signin'
        }
    });
}