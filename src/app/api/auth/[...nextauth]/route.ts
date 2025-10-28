// src/app/api/auth/[...nextauth]/route.ts
//import NextAuth, { NextAuthOptions } from "next-auth";
//import AzureADProvider from "next-auth/providers/azure-ad";

import NextAuth from "next-auth";
import { authOptions } from "auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// declare module "next-auth" {
//   interface Session {
//     accessToken?: string;
//     idToken?: string;
//   }
// }
// declare module "next-auth/jwt" {
//   interface JWT {
//     provider?: string;
//     accessToken?: string;
//     idToken?: string;
//     expires_at?: number; // optional if you decide to implement refresh
//     refresh_token?: string; // optional
//   }
// }

// export const authOptions: NextAuthOptions = {
//   providers: [
//     AzureADProvider({
//       clientId: process.env.AZURE_AD_CLIENT_ID!,
//       clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
//       tenantId: process.env.AZURE_AD_TENANT_ID!,
//       authorization: {
//         params: {
//           // IMPORTANT: request Graph *delegated* scopes explicitly
//           scope: [
//             "openid",
//             "profile",
//             "email",
//             "offline_access",
//             "https://graph.microsoft.com/User.Read",
//             "https://graph.microsoft.com/Chat.ReadBasic",
//             "https://graph.microsoft.com/Mail.ReadBasic",
//           ].join(" "),
//         },
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET!,
//   callbacks: {
//     async jwt({ token, account }) {
//       // On initial sign-in, copy tokens from the provider
//       if (account) {
//         token.idToken = account.id_token;
//         token.accessToken = account.access_token;
//         // Optionally keep these for refresh later:
//         // token.expires_at = account.expires_at;
//         // token.refresh_token = account.refresh_token;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.accessToken = token.accessToken;
//       session.idToken = token.idToken;
//       return session;
//     },
//   },
//   // (Optional) Configure checks and pages if you need
//   // session: { strategy: "jwt" },
//   // checks: ["pkce", "state"],
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };
