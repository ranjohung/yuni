import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        console.log('Authorize called with credentials:', credentials);
        
        if (!credentials?.phone || !credentials?.password) {
          console.log('Missing phone or password');
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        });

        console.log('Found user:', user ? user.phone : 'null');

        if (!user) {
          return null;
        }

        const isValid = await verifyPassword(credentials.password, user.password);

        console.log('Password valid:', isValid);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          phone: user.phone,
          nickname: user.nickname,
          membershipType: user.membershipType,
          isMinor: user.isMinor,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.phone = (user as { phone?: string }).phone;
        token.membershipType = (user as { membershipType?: number }).membershipType;
        token.isMinor = (user as { isMinor?: boolean }).isMinor;
        token.nickname = (user as { nickname?: string }).nickname;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        phone: token.phone as string,
        nickname: token.nickname as string | undefined,
        membershipType: token.membershipType as number,
        isMinor: token.isMinor as boolean,
      };
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

export default NextAuth(authOptions);