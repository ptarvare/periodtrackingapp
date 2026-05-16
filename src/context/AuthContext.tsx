"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    User,
    onAuthStateChanged,
    signInWithPopup,
    GoogleAuthProvider,
    setPersistence,
    browserLocalPersistence,
    signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    googleSignIn: () => Promise<"ok" | "popup-blocked">;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const googleSignIn = async (): Promise<"ok" | "popup-blocked"> => {
        const provider = new GoogleAuthProvider();
        await setPersistence(auth, browserLocalPersistence);
        try {
            await signInWithPopup(auth, provider);
            return "ok";
        } catch (error: any) {
            if (
                error.code === "auth/popup-blocked" ||
                error.code === "auth/popup-closed-by-user"
            ) {
                return "popup-blocked";
            }
            console.error("Sign-in error:", error.code);
            return "ok";
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
