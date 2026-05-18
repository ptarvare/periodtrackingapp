"use client";

import { AuthContextProvider } from "@/context/AuthContext";
import { PostHogProvider } from "@/components/PostHogProvider";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <PostHogProvider>
            <AuthContextProvider>
                {children}
            </AuthContextProvider>
        </PostHogProvider>
    );
}
