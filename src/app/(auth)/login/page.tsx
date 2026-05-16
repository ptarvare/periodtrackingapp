"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";

type Screen = "login" | "blocked";

export default function LoginPage() {
    const { user, googleSignIn } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [screen, setScreen] = useState<Screen>("login");

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

    const handleSignIn = async () => {
        setLoading(true);
        const result = await googleSignIn();
        if (result === "popup-blocked") {
            setScreen("blocked");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">

                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="text-6xl mb-4">🌙</div>
                    <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600 tracking-tight">
                        Luna
                    </h1>
                    <p className="text-gray-400 text-sm mt-2">Your holistic cycle companion</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-8 space-y-5">

                    {screen === "login" && (
                        <>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Welcome 👋</h2>
                                <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                                    Sign in with Google — no password needed.
                                </p>
                            </div>

                            <button
                                onClick={handleSignIn}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-white border-2 border-gray-100 rounded-2xl hover:border-pink-200 hover:bg-pink-50/30 disabled:opacity-60 transition-all shadow-sm font-semibold text-gray-700"
                            >
                                {loading ? (
                                    <>
                                        <span className="w-5 h-5 border-2 border-gray-300 border-t-pink-500 rounded-full animate-spin" />
                                        <span>Opening Google…</span>
                                    </>
                                ) : (
                                    <>
                                        <GoogleIcon />
                                        <span>Continue with Google</span>
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-gray-400 text-center">
                                Works best in Safari on iPhone.
                            </p>
                        </>
                    )}

                    {screen === "blocked" && (
                        <div className="text-center space-y-4">
                            <div className="text-4xl">🌐</div>
                            <h2 className="text-lg font-bold text-gray-900">Open in Safari</h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Chrome on iPhone blocks sign-in popups. To sign in:
                            </p>
                            <ol className="text-sm text-gray-600 text-left space-y-2 bg-pink-50 rounded-2xl p-4">
                                <li className="flex gap-2"><span className="text-pink-400 font-bold">1.</span> Tap the <span className="font-semibold">share icon</span> (□↑) at the bottom of Chrome</li>
                                <li className="flex gap-2"><span className="text-pink-400 font-bold">2.</span> Tap <span className="font-semibold">&ldquo;Open in Safari&rdquo;</span></li>
                                <li className="flex gap-2"><span className="text-pink-400 font-bold">3.</span> Sign in there — it works perfectly</li>
                            </ol>
                            <button
                                onClick={() => { setScreen("login"); }}
                                className="text-sm text-pink-500 underline underline-offset-2"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-6 px-4">
                    Luna is a wellness tool, not a medical device.
                </p>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
    );
}
