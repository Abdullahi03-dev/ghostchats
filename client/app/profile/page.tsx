"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";

export default function Profile() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`${API_URL}/api/auth/profile`, { credentials: "include" });
                if (!res.ok) { router.push("/auth"); return; }
                setProfile(await res.json());
            } catch { router.push("/auth"); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, []);

    const handleToggleAnonymous = async () => {
        setToggling(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/toggle-anonymous`, { method: "PUT", credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setProfile((prev: any) => ({ ...prev, isAnonymous: data.isAnonymous, username: data.username }));
            }
        } catch (err) { console.error(err); }
        finally { setToggling(false); }
    };

    const handleLogout = async () => {
        await fetch(`${API_URL}/api/auth/logout`, { method: "POST", credentials: "include" });
        router.push("/auth");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 font-sans">
                <p className="animate-pulse text-sm">Loading...</p>
            </div>
        );
    }

    if (!profile) return null;

    const ghostAlias = `Ghost${String(profile._id).slice(-4)}`;

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-12">

                <button onClick={() => router.push("/dashboard")} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Chat
                </button>

                {/* Profile Card */}
                <div className="bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-800 mb-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold">
                            {profile.isAnonymous ? "👻" : profile.username?.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    <h1 className="text-2xl font-semibold text-center mb-1 text-zinc-100">
                        {profile.isAnonymous ? ghostAlias : profile.username}
                    </h1>
                    <p className="text-zinc-500 text-center text-sm mb-2">{profile.email}</p>
                    <p className="text-center mb-6">
                        <span className={`text-xs px-3 py-1 rounded-full ${profile.isAnonymous
                            ? "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                            }`}>
                            {profile.isAnonymous ? "👻 Anonymous Mode" : "Visible Mode"}
                        </span>
                    </p>

                    <button
                        onClick={handleToggleAnonymous}
                        disabled={toggling}
                        className="w-full py-3 rounded-xl text-sm font-medium transition-all mb-4 bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
                    >
                        {toggling ? "Switching..." : profile.isAnonymous ? "Reveal My Identity" : "Go Anonymous 👻"}
                    </button>
                    <p className="text-zinc-600 text-xs text-center">
                        {profile.isAnonymous
                            ? `Others see you as "${ghostAlias}" in chats`
                            : `Others see your real username "${profile.username}" in chats`
                        }
                    </p>
                </div>

                {/* Stats */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-4">Ghost Stats</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                            <p className="text-zinc-200 text-xl font-semibold">{profile.ghostPoints ?? 0}</p>
                            <p className="text-zinc-500 text-xs mt-1">Ghost Points</p>
                        </div>
                        <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                            <p className="text-zinc-200 text-xl font-semibold">{profile.messagesSent ?? 0}</p>
                            <p className="text-zinc-500 text-xs mt-1">Messages Sent</p>
                        </div>
                        <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                            <p className="text-zinc-200 text-xl font-semibold">{profile.roomsCreated ?? 0}</p>
                            <p className="text-zinc-500 text-xs mt-1">Rooms Created</p>
                        </div>
                        <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                            <p className="text-zinc-200 text-xl font-semibold capitalize">{profile.accountLevel ?? "newbie"}</p>
                            <p className="text-zinc-500 text-xs mt-1">Level</p>
                        </div>
                    </div>

                    {/* Level Progress */}
                    {(() => {
                        const pts = profile.ghostPoints ?? 0;
                        const levels = [
                            { name: "Newbie", min: 0, max: 49 },
                            { name: "Ghost", min: 50, max: 199 },
                            { name: "Phantom", min: 200, max: 499 },
                            { name: "Specter", min: 500, max: Infinity },
                        ];
                        const current = levels.find((l) => pts >= l.min && pts <= l.max) || levels[0];
                        const nextLevel = levels[levels.indexOf(current) + 1];
                        const progress = nextLevel
                            ? Math.min(((pts - current.min) / (nextLevel.min - current.min)) * 100, 100)
                            : 100;

                        return (
                            <div className="mt-4 pt-4 border-t border-zinc-800/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[11px] text-zinc-400 capitalize">{current.name}</span>
                                    {nextLevel ? (
                                        <span className="text-[11px] text-zinc-500">{nextLevel.min - pts} pts to {nextLevel.name}</span>
                                    ) : (
                                        <span className="text-[11px] text-emerald-500">Max level</span>
                                    )}
                                </div>
                                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })()}
                </div>

                {/* How Points Work */}
                <div className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 mb-6">
                    <h2 className="text-sm font-semibold text-zinc-300 mb-4">How Points Work</h2>

                    <div className="space-y-3 mb-5">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Earn</p>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-xs text-zinc-400">Send a message</span>
                            <span className="text-xs text-emerald-500 font-medium">+1 pt</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-xs text-zinc-400">Get approved into a room</span>
                            <span className="text-xs text-emerald-500 font-medium">+5 pts</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-xs text-zinc-400">Create a room (reward)</span>
                            <span className="text-xs text-emerald-500 font-medium">+10 pts</span>
                        </div>
                    </div>

                    <div className="space-y-3 mb-5">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Spend</p>
                        <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                            <span className="text-xs text-zinc-400">Create a private room</span>
                            <span className="text-xs text-red-400 font-medium">-100 pts</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Levels</p>
                        {[
                            { name: "Newbie", range: "0–49 pts" },
                            { name: "Ghost", range: "50–199 pts" },
                            { name: "Phantom", range: "200–499 pts" },
                            { name: "Specter", range: "500+ pts" },
                        ].map((level) => (
                            <div key={level.name} className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                                <span className={`text-xs font-medium capitalize ${profile.accountLevel === level.name.toLowerCase() ? "text-emerald-400" : "text-zinc-400"
                                    }`}>
                                    {level.name}
                                    {profile.accountLevel === level.name.toLowerCase() && " ← you"}
                                </span>
                                <span className="text-xs text-zinc-500">{level.range}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all text-zinc-400 py-3 rounded-xl text-sm font-medium"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}
