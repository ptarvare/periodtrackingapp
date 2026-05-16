"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";

type Screen = "input" | "sent" | "confirm" | "signingIn";

export default function LoginPage() {
    const { user, sendMagicLink } = useAuth();
    const router = useRouter();

    const [screen, setScreen] = useState<Screen>("input");
    const [email, setEmail] = useState("");
    const [confirmEmail, setConfirmEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sentTo, setSentTo] = useState("");

    // Redirect once signed in
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, "users", user.uid));
                router.push(
                    snap.exists() && snap.data().onboardingCompleted && snap.data().profile?.periodDates?.length
                        ? "/dashboard"
                        : "/onboarding"
                );
            } catch {
                router.push("/onboarding");
            }
        })();
    }, [user, router]);

    // Detect magic link on page load
    useEffect(() => {
        if (!isSignInWithEmailLink(auth, window.location.href)) return;

        const saved = localStorage.getItem("lunaEmailForSignIn");
        if (saved) {
            // Same browser — complete silently
            setScreen("signingIn");
            signInWithEmailLink(auth, saved, window.location.href)
                .then(() => localStorage.removeItem("lunaEmailForSignIn"))
                .catch(() => {
                    setError("The link has expired or already been used. Please request a new one.");
                    setScreen("input");
                });
        } else {
            // Different browser/device — ask for email
            setScreen("confirm");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !trimmed.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            await sendMagicLink(trimmed);
            setSentTo(trimmed);
            setScreen("sent");
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        const trimmed = confirmEmail.trim().toLowerCase();
        if (!trimmed || !trimmed.includes("@")) {
            setError("Please enter the email address you used.");
            return;
        }
        setLoading(true);
        try {
            await signInWithEmailLink(auth, trimmed, window.location.href);
            localStorage.removeItem("lunaEmailForSignIn");
        } catch {
            setError("That email doesn't match the link. Please check and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Brand */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🌙</div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 tracking-tight">
                        Luna
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Your holistic cycle companion</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">

                    {/* Default — enter email */}
                    {screen === "input" && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome 👋</h2>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                Enter your email and we&apos;ll send you a sign-in link. No password needed.
                            </p>
                            <form onSubmit={handleSend} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                                    <input
                                        type="email" value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email" autoFocus
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                                    />
                                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-60 transition-all">
                                    {loading ? "Sending…" : "Send magic link ✨"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Email sent */}
                    {screen === "sent" && (
                        <div className="text-center py-2">
                            <div className="text-5xl mb-4">📬</div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-2">
                                We sent a sign-in link to{" "}
                                <span className="font-semibold text-pink-600">{sentTo}</span>
                            </p>
                            <p className="text-xs text-gray-400 leading-relaxed mb-6">
                                Tap the link in the email — it works on any browser.{" "}
                                <span className="font-medium text-amber-500">If you don&apos;t see it, check your spam folder.</span>
                            </p>
                            <button onClick={() => { setScreen("input"); setEmail(""); }}
                                className="text-sm text-gray-400 hover:text-pink-500 transition-colors underline underline-offset-2">
                                Use a different email
                            </button>
                        </div>
                    )}

                    {/* Confirm email (opened in different browser) */}
                    {screen === "confirm" && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Almost there! 🎉</h2>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                Just type the email address you used to request the link to confirm it&apos;s you.
                            </p>
                            <form onSubmit={handleConfirm} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm your email</label>
                                    <input
                                        type="email" value={confirmEmail}
                                        onChange={(e) => setConfirmEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email" autoFocus
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                                    />
                                    {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-60 transition-all">
                                    {loading ? "Signing in…" : "Confirm & sign in →"}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Signing in silently */}
                    {screen === "signingIn" && (
                        <div className="text-center py-6">
                            <div className="text-4xl mb-4">🌙</div>
                            <p className="text-sm font-medium text-gray-600">Signing you in…</p>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed px-4">
                    Luna is a wellness tool, not a medical device.
                </p>
            </div>
        </div>
    );
}
