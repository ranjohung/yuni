import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      phone: string;
      nickname?: string;
      membershipType: number;
      isMinor: boolean;
    } & DefaultSession['user'];
  }
}