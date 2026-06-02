"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#FDF2F8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-pink-200 border-t-pink-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
          Luna
        </h1>
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-full bg-white text-gray-800 font-medium shadow-sm hover:shadow-md transition-all border border-gray-100"
        >
          Sign In ✨
        </Link>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto mt-[-5vh]">
        <div className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-sm font-semibold tracking-wide mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          ✨ Built for your rhythm
        </div>

        <h2 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Your body has a rhythm.<br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
            Plan your life around it.
          </span>
        </h2>

        <p className="text-xl text-gray-600 max-w-2xl mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          Luna helps you understand your cycle so you can stay on top of your game — every single day. Know when to push, when to rest, and what your body needs right now.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <Link
            href="/login"
            className="px-8 py-4 rounded-full bg-gray-900 text-white font-bold text-lg shadow-xl hover:bg-gray-800 hover:scale-105 transition-all"
          >
            Get Started
          </Link>
          <a
            href="#features"
            className="px-8 py-4 rounded-full bg-white text-gray-700 font-bold text-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-all"
          >
            Learn More
          </a>
        </div>
      </main>

      <section id="features" className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔮"
            title="Know your phase"
            desc="Understand exactly where you are in your cycle and what your body needs today — not tomorrow, today."
          />
          <FeatureCard
            icon="🥗"
            title="Eat for your cycle"
            desc="Breakfast, lunch, and dinner recommendations that work with your hormones — personalised to your phase."
          />
          <FeatureCard
            icon="📊"
            title="Discover your patterns"
            desc="Log mood and energy daily. See which days you perform best and plan your life — meetings, workouts, rest — around it."
          />
        </div>
      </section>

      <footer className="py-8 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Luna. Built for you.
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
