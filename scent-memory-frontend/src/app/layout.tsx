import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import RotatingCube from "@/components/Pomegranate3d";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scent Memory",
  description: "Your personal fragrance memory platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
   
      <body className={inter.className}>
        <div className="fixed inset-0 z-0">
          <div 
            className="absolute inset-0"
            style={{
              background: `
            
                radial-gradient(ellipse 1400px 800px at 50% 100%, #7d5a5e 10%, #4d2a2f 50%, #2b1a1f 100%)
              `
            }}
          />
          <div 
            className="absolute inset-x-0 bottom-0 h-2/3"
           
          />
          <div 
            className="absolute inset-0"
            
          />

    <div className="fixed bottom-60 left-80 z-20">
        <RotatingCube />
      </div>
        </div>
        <div className="relative z-10">
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}