import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: 'Phone', type: 'tel' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { phone: credentials.phone },
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id.toString(),
          phone: user.phone,
          nickname: user.nickname,
          membershipType: user.membershipType,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; phone: string; nickname?: string; membershipType: number }
        token.id = u.id
        token.phone = u.phone
        token.nickname = u.nickname
        token.membershipType = u.membershipType
      }
      return token
    },
    async session({ session, token }) {
      session.user = {
        id: token.id as string,
        phone: token.phone as string,
        nickname: token.nickname as string | undefined,
        membershipType: token.membershipType as number,
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
  },
}
