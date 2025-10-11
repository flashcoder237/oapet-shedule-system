// src/app/layout.tsx
import './globals.css';
import { Lato } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/context';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { NotificationProvider } from '@/components/ui/notifications';
import { ThemeProvider } from '@/components/ui/theme-provider';

const lato = Lato({
  weight: ['300', '400', '700', '900'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata = {
  title: 'OAPET Schedule System - Système de gestion des emplois du temps avec IA',
  description: 'Application de gestion des emplois du temps universitaire avec intelligence artificielle - Université de Douala',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || 'system';
                const root = document.documentElement;
                
                root.classList.remove('light', 'dark');
                
                if (theme === 'system') {
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  root.classList.add(systemTheme);
                } else {
                  root.classList.add(theme);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`h-full bg-background text-foreground antialiased ${lato.variable}`} style={{ fontFamily: 'var(--font-lato), system-ui, sans-serif' }}>
        <ThemeProvider>
          <ToastProvider>
            <NotificationProvider>
              <AuthProvider>
                <AppLayoutWrapper>
                  {children}
                </AppLayoutWrapper>
              </AuthProvider>
            </NotificationProvider>
            <Toaster />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}