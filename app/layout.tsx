import './globals.css';

import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';

let title = 'Inverti en la agricultura paraguaya';
let description =
  'Conecta con productores locales y forma parte de campañas de producción agrícola sostenible. Diversifica tu inversión mientras apoyas la agricultura paraguaya.';

export const metadata = {
  title,
  description,
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    },
    metadataBase: new URL('https://agrobeat-crowdfunding-vym1.vercel.app/'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en"> 
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>{children}</body>
    </html>
  );
}
