import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import { Toaster } from "@/components/ui/sonner";
import { Inter, Playfair_Display, Hind_Siliguri } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import MainLayoutWrapper from "@/components/MainLayoutWrapper";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const hindSiliguri = Hind_Siliguri({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin", "bengali"],
  variable: "--font-bengali",
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${inter.variable} ${playfair.variable} ${hindSiliguri.variable} bg-[#FFF8F0] min-h-screen text-[#333333] font-sans flex flex-col`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <MainLayoutWrapper>{children}</MainLayoutWrapper>
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
