"use client";

import { useEffect, useState } from "react";

type Platform = "ios" | "android" | null;

export default function InstallBanner() {
    const [platform, setPlatform] = useState<Platform>(null);
    const [show, setShow] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

    useEffect(() => {
        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        if (isStandalone) return;
        if (sessionStorage.getItem("install-banner-dismissed")) return;

        const ua = navigator.userAgent;
        const isIOS = /iPhone|iPad|iPod/.test(ua);
        const isAndroid = /Android/.test(ua);

        if (isIOS) {
            setPlatform("ios");
            setShow(true);
        }

        if (isAndroid) {
            const handler = (e: Event) => {
                e.preventDefault();
                setDeferredPrompt(e);
                setPlatform("android");
                setShow(true);
            };
            window.addEventListener("beforeinstallprompt", handler as any);
            return () => window.removeEventListener("beforeinstallprompt", handler as any);
        }
    }, []);

    const dismiss = () => {
        sessionStorage.setItem("install-banner-dismissed", "1");
        setShow(false);
    };

    const installAndroid = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed bottom-20 sm:bottom-6 left-4 right-4 z-50 max-w-sm mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-pink-100 p-4 flex gap-3 items-start">
                <div className="text-2xl shrink-0">🌙</div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">Add Luna to your home screen</p>
                    {platform === "ios" && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Tap the <span className="font-semibold">share icon</span> (□↑) at the bottom of Safari, then tap <span className="font-semibold">&ldquo;Add to Home Screen&rdquo;</span>
                        </p>
                    )}
                    {platform === "android" && (
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                            Install Luna as an app for quick access from your home screen.
                        </p>
                    )}
                    {platform === "android" && (
                        <button
                            onClick={installAndroid}
                            className="mt-2 px-4 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-semibold rounded-lg"
                        >
                            Install App
                        </button>
                    )}
                </div>
                <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 text-xl leading-none shrink-0">×</button>
            </div>
        </div>
    );
}
