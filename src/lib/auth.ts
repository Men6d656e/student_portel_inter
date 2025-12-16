import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "./db";
import { sendVerificationEmail } from "./email";

export const auth = betterAuth({
  
  emailAndPassword: {
    enabled: true,
    requireEmailVerification:true
  },
  emailVerification:{
    sendVerificationEmail: async ({user,url,token},request)=>{
      void sendVerificationEmail({user,url})
    },
    sendOnSignIn:true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
});
