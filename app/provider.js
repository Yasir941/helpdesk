"use client"
import React from 'react'
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { useAuth } from "@clerk/nextjs";

// Moving this outside the component prevents unnecessary re-connections
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

function Provider({ children }) {
  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  )
}

export default Provider