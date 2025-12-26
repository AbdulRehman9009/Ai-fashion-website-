import Credentials from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        await connectDB();
        const email = String(credentials?.email || "").toLowerCase().trim();
        const password = String(credentials?.password || "");
        const user = await User.findOne({ email }).lean();
        if (!user) return null;
        if (user.status !== "ACTIVE") return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return { id: String(user._id), email: user.email, role: user.role, status: user.status };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.sub, email: session.user?.email || "", role: token.role, status: token.status };
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

