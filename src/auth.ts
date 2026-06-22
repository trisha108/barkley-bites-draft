import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { UserModel } from "@/models/User";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const providers: (ReturnType<typeof Credentials> | ReturnType<typeof Google>)[] = [
  Credentials({
    name: "Email & password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      await connectDB();
      const user = await UserModel.findOne({ email: parsed.data.email.toLowerCase() });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
      if (!valid) return null;

      return {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        image: user.image ?? undefined,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }

      if (account?.provider === "google" && profile && "email" in profile && profile.email) {
        await connectDB();
        let dbUser = await UserModel.findOne({ email: profile.email.toLowerCase() });
        if (!dbUser) {
          dbUser = await UserModel.create({
            email: profile.email.toLowerCase(),
            name: profile.name ?? "Barkley friend",
            image: "picture" in profile && typeof profile.picture === "string" ? profile.picture : undefined,
          });
        }
        token.id = dbUser._id.toString();
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
