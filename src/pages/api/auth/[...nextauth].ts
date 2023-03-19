import { PrismaAdapter } from '@next-auth/prisma-adapter';
import NextAuth, { Theme } from 'next-auth';
import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/email';
import { prisma } from 'src/server/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { createTransport } from 'nodemailer';

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const query = req.query.nextauth;

  if (query && query.includes('signup')) {
    const requestEmail = req.body.email;
    console.log('Has signup in request');
    const exists = await prisma.user.findUnique({
      where: {
        email: requestEmail,
      },
    });
    console.log('Exists: ', exists);
    if (exists !== null) {
      return res
        .status(400)
        .json({ url: (process.env.NEXTAUTH_URL ?? 'http://localhost:3000') + `?error=${'Email already in use'}` });
    }
  }

  const indexOfSignUp = query && query.indexOf('signup');
  if (query && typeof query === 'object' && indexOfSignUp) {
    query[indexOfSignUp] = 'signin';
  }

  return await NextAuth(req, res, {
    providers: [
      Email({
        from: process.env.MAIL_EMAIL!,
        server: {
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: 'rbatra486',
            pass: process.env.MAIL_PASSWORD,
          },
        },
        async sendVerificationRequest({ identifier: email, url, provider: { server, from }, theme }) {
          const { host } = new URL(url);

          const transport = createTransport(server);
          const result = await transport.sendMail({
            to: email,
            from: 'Tavern Tales <no-reply@taverntales.app>',
            subject: `Sign in to ${host}`,
            text: text({ url, host }),
            html: html({ url, host, theme }),
          });
          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`);
          }
        },
      }),
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    adapter: PrismaAdapter(prisma),
    callbacks: {
      session: async ({ session, user }) => {
        return { ...session, user: user };
      },
    },
    session: {
      strategy: 'database',
    },
    pages: {
      signIn: '/signin',
    },
  });
}

/**
 * Email HTML body
 * Insert invisible space into domains from being turned into a hyperlink by email
 * clients like Outlook and Apple mail, as this is confusing because it seems
 * like they are supposed to click on it to sign in.
 *
 * @note We don't add the email address to avoid needing to escape it, if you do, remember to sanitize it!
 */
function html(params: { url: string; host: string; theme: Theme }) {
  const { url, host, theme } = params;

  const escapedHost = host.replace(/\./g, '&#8203;.');

  const brandColor = theme.brandColor || '#346df1';
  const color = {
    background: '#f9f9f9',
    text: '#444',
    mainBackground: '#fff',
    buttonBackground: brandColor,
    buttonBorder: brandColor,
    buttonText: theme.buttonText || '#fff',
  };

  return `
  <body style="background: ${color.background};">
    <table width="100%" border="0" cellspacing="20" cellpadding="0"
      style="background: ${color.mainBackground}; max-width: 600px; height: '800px'; margin: auto; border-radius: 10px;">
      <tr>
        <td align="center"
          style="padding: 10px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonBackground};">
          Sign in to <strong>${escapedHost}</strong>
          <br/>
            <p style="padding: 10px 0px; font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};"> Use the button below to sign in to your account! </p>
        </td>
        
      </tr>
      <tr>
        <td align="center" style="padding: 20px 0;">
          <table border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td align="center" style="border-radius: 5px;" bgcolor="${color.buttonBackground}"><a href="${url}"
                  target="_blank"
                  style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${color.buttonText}; text-decoration: none; border-radius: 5px; padding: 10px 20px; border: 1px solid ${color.buttonBorder}; display: inline-block; font-weight: bold;">
                  Sign in</a>
            </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center"
          style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${color.text};">
          If you did not request this email you can safely ignore it.
        </td>
      </tr>
    </table>
  </body>
  `;
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, host }: { url: string; host: string }) {
  return `Sign in to ${host}\n${url}\n\n`;
}
