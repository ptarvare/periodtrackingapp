"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

type Screen = "input" | "sent";

export default function LoginPage() {
    const { user, sendMagicLink } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [screen, setScreen] = useState<Screen>("input");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !email.includes("@")) {
            setError("Please enter a valid email address.");
            return;
        }
        setLoading(true);
        try {
            await sendMagicLink(email.trim().toLowerCase());
            setScreen("sent");
        } catch (err: any) {
            setError("Something went wrong. Please try again.");
            console.error(err);
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

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8">

                    {screen === "input" && (
                        <>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome 👋</h2>
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                                Enter your email and we&apos;ll send you a magic link — no password needed.
                            </p>

                            <form onSubmit={handleSend} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Email address
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                        autoFocus
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none transition-all text-sm"
                                    />
                                    {error && (
                                        <p className="text-xs text-red-500 mt-1.5">{error}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-lg shadow-pink-200 hover:opacity-95 disabled:opacity-60 transition-all"
                                >
                                    {loading ? "Sending…" : "Send magic link ✨"}
                                </button>
                            </form>
                        </>
                    )}

                    {screen === "sent" && (
                        <div className="text-center py-2">
                            <div className="text-5xl mb-4">📬</div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Check your inbox!</h2>
                            <p className="text-sm text-gray-500 leading-relaxed mb-6">
                                We sent a sign-in link to{" "}
                                <span className="font-semibold text-pink-600">{email}</span>.
                                <br />
                                Tap the link in the email to sign in — it works on any browser.
                            </p>
                            <button
                                onClick={() => { setScreen("input"); setEmail(""); }}
                                className="text-sm text-gray-400 hover:text-pink-500 transition-colors underline underline-offset-2"
                            >
                                Use a different email
                            </button>
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
