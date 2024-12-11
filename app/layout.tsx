import './globals.css';
import "@radix-ui/themes/styles.css";
import type { Metadata } from 'next';
import { Theme } from "@radix-ui/themes";
import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster"
import Providers from '@/app/providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'The List',
  description: 'Manage your manga list',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Theme appearance='dark' accentColor='indigo'>
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </Theme>
      </body>
    </html>
  );
}