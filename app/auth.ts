import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcrypt-ts';
import { getUser } from 'app/db';
import { authConfig } from 'app/auth.config';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize({ email, password }: any) {
        try {
          if (!email || !password) {
            return null;
          }

          const user = await getUser(email);
          
          if (user.length === 0) {
            return null;
          }

          const passwordsMatch = await compare(password, user[0].password!);
          
          if (passwordsMatch) {
            return {
              id: user[0].id.toString(),
              email: user[0].email,
              name: user[0].name,
              role: user[0].role || 'investor'
            };
          }

          return null;
        } catch (error) {
          console.error('Error during authentication:', error);
          return null;
        }
      },
    }),
  ],
});
