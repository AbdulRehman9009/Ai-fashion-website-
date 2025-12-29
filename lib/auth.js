import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { connectDB } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    CredentialsProvider({
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
        return {
          id: String(user._id),
          email: user.email,
          role: user.role,
          status: user.status,
          profileCompletion: user.profileCompletion
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        try {
          await connectDB();
          const email = user.email.toLowerCase().trim();
          let existingUser = await User.findOne({ email });

          if (!existingUser) {
            // Create new user for social login
            // Default role is USER (Customer)
            existingUser = await User.create({
              email: email,
              name: user.name,
              role: "USER",
              status: "ACTIVE",
              isProfileComplete: false,
              image: user.image
              // passwordHash is not needed for social login
            });
          }

          // Append role and id to the user object passed to jwt callback
          user.role = existingUser.role;
          user.id = existingUser._id.toString();
          user.status = existingUser.status;
          user.profileCompletion = existingUser.profileCompletion;

          return true;
        } catch (error) {
          console.error("Error creating user from social login:", error);
          return false;
        }
      }
      return true; // Credentials provider
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.status = user.status;
        token.profileCompletion = user.profileCompletion;
      }

      // Check profile completion status and update token
      // We check on sign-in and when explicitly updated
      if (token.sub && token.role) {
        try {
          await connectDB();
          const { checkProfileCompletion } = await import("./profile-completion");
          const status = await checkProfileCompletion(token.sub, token.role);
          token.isProfileComplete = status.isComplete;
        } catch (error) {
          console.error("Error checking profile status in JWT:", error);
          // Default to false if error, or keep previous/true to avoid blocking if system is down?
          // Unsafe to block if system error, but safer to block if critical.
          // Let's assume it's incomplete if we can't verify.
          if (token.isProfileComplete === undefined) token.isProfileComplete = false;
        }
      }

      // Allow frontend to update the token via update()
      if (trigger === "update" && session?.isProfileComplete !== undefined) {
        token.isProfileComplete = session.isProfileComplete;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.sub,
        email: session.user?.email || "",
        role: token.role,
        status: token.status,
        isProfileComplete: token.isProfileComplete
      };
      return session;
    },
  },
  pages: {
    signIn: "/auth/user/login",
    error: "/auth/user/login",
  },
};

