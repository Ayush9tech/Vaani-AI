import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { getDb } from "@/db";

export const authConfig: NextAuthConfig = {
  debug: true,
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "Vaani AI <noreply@vaani.ai>",
      sendVerificationRequest: async ({ identifier, url, provider }) => {
        const { host } = new URL(url);
        const transport = (await import("nodemailer")).createTransport(provider.server);
        const result = await transport.sendMail({
          to: identifier,
          from: provider.from,
          subject: `Sign in to Vaani AI`,
          text: `Sign in to Vaani AI\n${url}\n\n`,
          html: `
<div style="font-family: sans-serif; background-color: #eff8f5; padding: 40px; text-align: center;">
  <div style="background-color: white; border-radius: 24px; padding: 40px; max-width: 500px; margin: 0 auto; box-shadow: 0 4px 20px rgba(20,95,86,0.08);">
    <h1 style="color: #145f56; margin-bottom: 8px;">VAANI AI</h1>
    <p style="color: #172e35; font-size: 18px; margin-bottom: 30px;">Every voice. Every opportunity.</p>
    <p style="color: #52666b; margin-bottom: 30px;">Click the button below to sign in to your practice space.</p>
    <a href="${url}" style="background-color: #145f56; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Sign in</a>
    <p style="color: #52666b; margin-top: 30px; font-size: 14px;">If you didn't request this email, you can safely ignore it.</p>
  </div>
</div>
          `,
        });
        const failed = result.rejected.concat(result.pending || []).filter(Boolean);
        if (failed.length) {
          throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`);
        }
      },
    }),
  ],
  pages: {
    signIn: "/#login",
    verifyRequest: "/#verify-email",
    error: "/#error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

let authInstance: ReturnType<typeof NextAuth> | null = null;
export function getAuth() {
  if (!authInstance) {
    authInstance = NextAuth({
      ...authConfig,
      adapter: DrizzleAdapter(getDb()),
    });
  }
  return authInstance;
}

export async function getSession(...args: any[]) {
  // @ts-ignore
  return getAuth().auth(...args);
}
