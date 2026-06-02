"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";


export default function Nav() {
  const { user } = useAuth();
  const pathname = usePathname();

  const initials = user?.displayName
    ? user.displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      {/* ── Top bar ── */}
      <header className="bg-white/80 backdrop-blur-md border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
            Luna 🌙
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink href="/dashboard" active={pathname === "/dashboard"}>🏠 Home</NavLink>
            <NavLink href="/log" active={pathname === "/log"}>📋 Log</NavLink>
            <NavLink href="/report" active={pathname === "/report"}>📊 Report</NavLink>
            <NavLink href="/profile" active={pathname === "/profile"}>👤 Profile</NavLink>
          </nav>

          {/* Avatar */}
          <div className="flex items-center">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-pink-200" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-pink-100 z-50 sm:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          <BottomTab href="/dashboard" active={pathname === "/dashboard"} emoji="🏠" label="Home" />
          <BottomTab href="/log" active={pathname === "/log"} emoji="📋" label="Log" />
          <BottomTab href="/report" active={pathname === "/report"} emoji="📊" label="Report" />
          <BottomTab href="/profile" active={pathname === "/profile"} emoji="👤" label="Profile" />
        </div>
      </nav>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      active
        ? "bg-pink-50 text-pink-600 font-semibold"
        : "text-gray-500 hover:text-pink-500 hover:bg-pink-50/50"
    }`}>
      {children}
    </Link>
  );
}

function BottomTab({ href, active, emoji, label }: { href: string; active: boolean; emoji: string; label: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-0.5 py-2 px-4">
      <span className={`text-xl transition-transform ${active ? "scale-110" : "opacity-60"}`}>{emoji}</span>
      <span className={`text-xs font-medium transition-colors ${active ? "text-pink-600" : "text-gray-400"}`}>
        {label}
      </span>
    </Link>
  );
}
