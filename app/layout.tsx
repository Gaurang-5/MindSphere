import "./globals.css";
import { ReactNode } from "react";


export const metadata = {
title: "FlowMind – Text to Flowchart",
description: "Turn any topic into an expandable flowchart.",
};


export default function RootLayout({ children }: { children: ReactNode }) {
return (
<html lang="en" className="h-full">
<body className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-800">
<div className="w-full h-full p-4 md:p-6">{children}</div>
</body>
</html>
);
}