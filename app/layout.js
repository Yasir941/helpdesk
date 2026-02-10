import { Outfit } from "next/font/google";
import "./globals.css";
import ConvexClientProvider from "./ConvexClientProvider";

const outfit = Outfit({ subsets: ["latin"] });

/** * ✨ METADATA UPDATE
 * We are now pointing to your specific SVG file name.
 */
export const metadata = {
  title: "helpdesk",
  description: "Your personalized AI learning companion",
  icons: {
    icon: "/logo1.svg",  // Matches your public/logo1.svg file
    apple: "/logo1.svg", // Ensures it looks good on iOS devices too
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={outfit.className}>
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}