import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MockupForge — Free Mockup Generator',
  description: 'Create stunning product mockups instantly. No sign-in required. T-shirts, posters, mugs, signboards and more.',
  keywords: ['mockup generator', 'free mockup', 'product mockup', 'tshirt mockup', 'poster mockup'],
  openGraph: {
    title: 'MockupForge — Free Mockup Generator',
    description: 'Create stunning product mockups instantly. No sign-in required.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-forge-bg text-forge-text antialiased">
        {children}
      </body>
    </html>
  );
}
