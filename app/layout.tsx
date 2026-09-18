import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Vaani AI | A little practice. A world of possibility.',description:'Build interview confidence in Hindi and English. Match your skills, practise by text or voice, and take your next step.',manifest:'/manifest.webmanifest',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg',apple:'/icon-192.png'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
