import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import DashboardWrapper from "./dashboardWrapper";
import { AuthProvider } from "@/contexts/AuthContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SIMS - Supermarket Inventory Management System",
  description: "Complete inventory management solution for supermarkets and retail stores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <RealtimeProvider>
            <NotificationProvider>
              <DashboardWrapper>{children}</DashboardWrapper>
            </NotificationProvider>
          </RealtimeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}