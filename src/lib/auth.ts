import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcrypt"
import { prisma } from "./prisma"
import { Role } from "@prisma/client"

type UserWithRole = {
  id: string
  email: string
  name: string
  role: Role
}

declare module "next-auth" {
  interface Session {
    user: UserWithRole
  }
  interface User extends UserWithRole {}
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: Role
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<UserWithRole | null> {
        console.log("Attempting authorization for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Credentials missing");
          return null;
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        console.log("User found in DB:", user ? { id: user.id, email: user.email, role: user.role } : null);

        if (!user) {
          console.log("User not found in DB");
          return null;
        }

        // Log HASHED password dari DB (JANGAN log password input plaintext)
        console.log("Hashed password from DB:", user.password ? '[Exists]' : '[Missing]'); 

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        console.log("Password comparison result:", isPasswordValid);

        if (!isPasswordValid) {
          console.log("Password comparison failed");
          return null;
        }

        console.log("Authorization successful for:", user.email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      }
    },
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
} 