"use client";
import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ClerkProvider, useAuth } from "@clerk/nextjs";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * 🎨 CLERK BRANDING THEME
 * This matches your #0BDC85 Emerald Green and Slate aesthetics.
 */
const clerkAppearance = {
  variables: {
    colorPrimary: '#0BDC85', // Your Logo Green
    colorText: '#1e293b',    // Slate 800
    colorInputText: '#1e293b',
    borderRadius: '1rem',    // Rounded corners for inputs
    fontFamily: 'inherit',   // Uses your Outfit font
  },
  elements: {
    // Styling the main card
    card: "shadow-2xl border-none rounded-[2rem] p-4",
    // Styling the primary buttons
    formButtonPrimary: "bg-slate-900 hover:bg-[#0BDC85] text-sm font-bold transition-all h-11",
    // Styling social buttons (Google, etc)
    socialButtonsBlockButton: "rounded-xl border-slate-100 hover:bg-slate-50 transition-colors",
    socialButtonsBlockButtonText: "font-semibold text-slate-600",
    // Styling breadcrumbs and small links
    footerActionLink: "text-[#0BDC85] hover:text-emerald-600 font-bold",
    identityPreviewText: "font-bold text-slate-700",
    userButtonPopoverCard: "rounded-2xl border-slate-100 shadow-xl",
  }
};

export default function ConvexClientProvider({ children }) {
  return (
    <ClerkProvider 
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      appearance={clerkAppearance}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}