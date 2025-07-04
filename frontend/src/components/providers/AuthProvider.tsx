"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  
  // If no Clerk keys are configured, render children without auth
  if (!publishableKey) {
    return <>{children}</>;
  }
  
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        baseTheme: undefined,
        elements: {
          // Global glassmorphism styling for all Clerk components
          card: "bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg shadow-black/10",
          headerTitle: "text-glass text-2xl font-bold",
          headerSubtitle: "text-glass-secondary",
          formButtonPrimary: "bg-gradient-to-r from-accent-coral to-accent-blue text-white font-medium py-3 px-6 rounded-2xl backdrop-blur-sm border border-white/20 shadow-lg shadow-black/10 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105",
          formButtonSecondary: "bg-white/10 backdrop-blur-md text-glass font-medium py-3 px-6 rounded-2xl border border-white/20 shadow-lg shadow-black/10 hover:bg-white/20 hover:shadow-xl hover:shadow-black/20 transition-all duration-300 transform hover:scale-105",
          formFieldInput: "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 text-glass placeholder:text-glass-secondary shadow-lg shadow-black/10 focus:border-accent-coral focus:shadow-xl focus:shadow-accent-coral/20 transition-all duration-300",
          formFieldLabel: "text-glass font-medium mb-2 block",
          footerActionLink: "text-accent-coral hover:text-accent-blue transition-colors duration-300",
        },
        variables: {
          colorPrimary: "#ff6b6b",
          colorText: "#2c2c2c",
          colorTextSecondary: "#6c757d",
          colorBackground: "#ffffff",
          colorInputBackground: "rgba(255, 255, 255, 0.1)",
          colorInputText: "#2c2c2c",
          borderRadius: "1rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}