import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }
        await connectDB();
        const user = await User.findOne({ email: credentials.email });
        if (!user || !user.password) {
          throw new Error('No account found with this email');
        }
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Invalid password');
        }
        return { id: user._id.toString(), name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          await User.create({
            name: user.name,
            email: user.email,
            image: user.image,
          });
        }
      }
      return true;
    },
    async session({ session, token }) {
      // Prefer token.id (set on login) — avoids extra DB call each request
      if (token?.id) {
        session.user.id = token.id;
      } else if (session?.user?.email) {
        // Fallback: look up by email (Google OAuth first login)
        await connectDB();
        const dbUser = await User.findOne({ email: session.user.email }).lean();
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          // Also store in token for next time
          token.id = dbUser._id.toString();
        }
      }
      return session;
    },
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, user object is present
      if (user?.id) {
        token.id = user.id;
      }
      // For Google OAuth first login, look up the DB user
      if (account?.provider === 'google' && !token.id) {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email }).lean();
        if (dbUser) token.id = dbUser._id.toString();
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
