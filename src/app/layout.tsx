import './globals.css';
import type { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-black antialiased">
        <div className="w-full max-w-5xl mx-auto px-4">{children}</div>
      </body>
    </html>
  );
}
