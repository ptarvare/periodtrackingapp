"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    sendSignInLinkToEmail,
    isSignInWithEmailLink,
    signInWithEmailLink,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ACTION_CODE_SETTINGS = {
    url: "https://luna-app-beta.vercel.app/login",
    handleCodeInApp: true,
};

interface AuthContextType {
    user: User | null;
    loading: boolean;
    sendMagicLink: (email: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const sendMagicLink = async (email: string) => {
        await sendSignInLinkToEmail(auth, email, ACTION_CODE_SETTINGS);
        localStorage.setItem("lunaEmailForSignIn", email);
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Sign-out error:", error);
        }
    };

    useEffect(() => {
        // Complete sign-in if this page was opened via a magic link
        if (isSignInWithEmailLink(auth, window.location.href)) {
            const email = localStorage.getItem("lunaEmailForSignIn");
            if (email) {
                signInWithEmailLink(auth, email, window.location.href)
                    .then(() => localStorage.removeItem("lunaEmailForSignIn"))
                    .catch((err) => console.error("Magic link sign-in error:", err));
            }
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, sendMagicLink, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthContextProvider");
    return context;
};
