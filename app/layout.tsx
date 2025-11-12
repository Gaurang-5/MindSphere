import "./globals.css";
import { ReactNode } from "react";
import AuthProvider from "./providers";

export const metadata = {
  title: "MindSphere – AI-Powered Flowchart Generator",
  description: "Turn any topic into an interactive, expandable flowchart with AI.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
        <AuthProvider>
          <div className="w-full h-full p-4 md:p-6">{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}