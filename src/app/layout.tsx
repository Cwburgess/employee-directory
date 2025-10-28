import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "@/app/globals.css";
import { cn } from "../../lib/utils";
//import NavBar from "../components/layout/NavBar";
//import MainMenu from "@/components/layout/MainMenu";
import SessionProviderWrapper from "@/components/layout/SessionProviderWrapper";
import { ThemeProvider } from "next-themes";
import DebugModalSegment from "@/components/DebugModalSegment";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "700"],
});

// export const metadata: Metadata = {
//   title: "ACHD Image Handling",
//   description: "ACHD Image Manipulation Proof-of-Concept Application",
//   icons: { icon: "/logo.svg" },
// };

export default function RootLayout({
  children,
  modal,
}: Readonly<{
  children: React.ReactNode;
  modal: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="bg-white text-black dark:bg-slate-950 dark:text-white"
    >
      <body
        className={cn(
          `${poppins.variable} min-h-screen antialiased flex flex-col px-2 bg-white text-black dark:bg-slate-950 dark:text-white`
        )}
      >
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* Main content area */}
            <main className="flex-grow">
              {children}
              {modal}
            </main>
            {modal}
            <footer className="relative z-10">...</footer>
          </ThemeProvider>
          {modal}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
