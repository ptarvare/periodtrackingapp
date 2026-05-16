"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    googleSignIn: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const googleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Use local persistence so mobile browsers don't lose state
            await setPersistence(auth, browserLocalPersistence);
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            // Popup blocked (common on mobile) — fall back to redirect
            if (
                error.code === "auth/popup-blocked" ||
                error.code === "auth/popup-closed-by-user"
            ) {
                try {
                    await setPersistence(auth, browserLocalPersistence);
                    await signInWithRedirect(auth, provider);
                } catch (redirectErr) {
                    console.error("Redirect sign-in error:", redirectErr);
                }
            } else {
                console.error("Sign-in error:", error);
            }
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    useEffect(() => {
        // Handle result if the user was redirected back (mobile fallback)
        getRedirectResult(auth).catch(() => {
            // Silently ignore — no redirect was in progress
        });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, googleSignIn, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthContextProvider");
    return context;
};
