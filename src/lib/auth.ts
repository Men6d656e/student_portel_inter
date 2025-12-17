import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";
import { sendVerificationEmail, sendResetPasswordEmail } from "./email";

export const auth = betterAuth({

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      console.log("---------------------------------------------------------------------------------");
      console.log("Triggering sendResetPassword hook for:", user.email);
      console.log("Reset URL:", url);
      await sendResetPasswordEmail({ user, url })
      console.log("sendResetPasswordEmail completed");
      console.log("---------------------------------------------------------------------------------");
    }
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      void sendVerificationEmail({ user, url })
    },
    sendOnSignIn: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "STUDENT",
      },
      isApproved: {
        type: "boolean",
        defaultValue: false,
      },
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
            return {
              data: {
                ...user,
                role: "ADMIN",
              },
            };
          }
          // Ensure default is STUDENT if not set, though schema handles default.
          // If we want to handle teacher signup via API, we might need to intercept here too or rely on client passing data.
          // Better-auth might not pass extra fields easily without plugin or config. 
          // For now, handling ADMIN promotion here.
          return { data: user };
        },
      },
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
});
