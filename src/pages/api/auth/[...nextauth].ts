import { PrismaAdapter } from "@next-auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { prisma } from "src/server/prisma";
import { NextApiRequest, NextApiResponse } from "next";

export default async function auth(req: NextApiRequest, res: NextApiResponse) {

    if (req.query.nextauth.includes('signup')) {
        const requestEmail = req.body.email;
        console.log("Has signup in request")
        const exists = await prisma.user.findUnique({
            where: {
                email: requestEmail
            }
        });
        console.log("Exists: ", exists)
        if (exists !== null) {
            return res.status(400).json({ url: (process.env.NEXTAUTH_URL ?? 'http://localhost:3000') + `?error=${'Email already in use'}` })
        }
    }

    console.log(req.query.nextauth)

    const indexOfSignUp = req.query.nextauth.indexOf('signup');
    if (typeof req.query.nextauth === 'object' && indexOfSignUp) {
        req.query.nextauth[indexOfSignUp] = 'signin'
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
            signIn: async ({ user }) => {
                if (user.id) {
                    const validEmail = await prisma.user.findUnique({
                        where: {
                            id: user.id
                        }
                    });

                    if (validEmail) {
                        return true;
                    }
                }
                throw new Error('Invalid Email')
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