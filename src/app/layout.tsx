import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import ChatInterface from '@/components/ChatInterface';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TickTask | Premium Task Management',
  description: 'A premium task management application with modern UI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: "url('/bg.png')" }}>
          <div className="min-h-full" style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <ChatInterface />
            </ThemeProvider>
          </div>
        </div>
      </body>
    </html>
  );
}