"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_URL } from "../../lib/api";

interface UserProfile {
    _id: string;
    username: string;
    isAnonymous: boolean;
    ghostPoints: number;
    messagesSent: number;
    roomsJoined: number;
    roomsCreated: number;
    accountLevel: string;
    lastActive: string;
    createdAt: string;
}

export default function UserProfilePage() {
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${API_URL}/api/users/${userId}`, { credentials: "include" });
                if (!res.ok) {
                    if (res.status === 401) { router.push("/auth"); return; }
                    setError("User not found");
                    return;
                }
                setUser(await res.json());
            } catch {
                setError("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const getJoinDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
                    <p className="text-sm">Loading ghost profile...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-6 font-sans">
                <div className="w-full max-w-sm bg-zinc-900 p-8 rounded-2xl border border-zinc-800 text-center">
                    <p className="text-3xl mb-4">👻</p>
                    <h2 className="text-xl font-medium mb-2">Ghost Not Found</h2>
                    <p className="text-zinc-500 text-sm mb-6">{error}</p>
                    <button onClick={() => router.push("/users")} className="w-full bg-zinc-800 hover:bg-zinc-700 transition-colors text-white py-3 rounded-lg text-sm">
                        Back to All Ghosts
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <div className="max-w-lg mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Back */}
                <button onClick={() => router.push("/users")} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-300 transition-colors mb-8 text-sm">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    All Ghosts
                </button>

                {/* Profile Card */}
                <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden" style={{ animation: "messageAppear 0.4s ease-out" }}>

                    {/* Banner */}
                    <div className="h-20 bg-zinc-800"></div>

                    {/* Avatar */}
                    <div className="flex justify-center -mt-10">
                        <div className="w-20 h-20 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold border-4 border-zinc-900">
                            {user.isAnonymous ? "👻" : user.username.charAt(0).toUpperCase()}
                        </div>
                    </div>

                    {/* Info */}
                    <div className="px-6 sm:px-8 pt-4 pb-8">
                        <h1 className="text-xl font-semibold text-center mb-1 text-zinc-100">{user.username}</h1>

                        <div className="flex items-center justify-center gap-2 mb-6">
                            <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 capitalize">
                                {user.accountLevel}
                            </span>
                            {user.isAnonymous && (
                                <span className="text-xs px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
                                    👻 Anonymous
                                </span>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                                <p className="text-zinc-200 text-2xl font-bold">{user.ghostPoints}</p>
                                <p className="text-zinc-500 text-xs mt-1">Ghost Points</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                                <p className="text-zinc-200 text-2xl font-bold">{user.messagesSent}</p>
                                <p className="text-zinc-500 text-xs mt-1">Messages Sent</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                                <p className="text-zinc-200 text-2xl font-bold">{user.roomsCreated}</p>
                                <p className="text-zinc-500 text-xs mt-1">Rooms Created</p>
                            </div>
                            <div className="bg-zinc-950 rounded-xl p-4 text-center border border-zinc-800/50">
                                <p className="text-zinc-200 text-2xl font-bold">{user.roomsJoined}</p>
                                <p className="text-zinc-500 text-xs mt-1">Rooms Joined</p>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="space-y-0">
                            <div className="flex items-center justify-between py-3 border-t border-zinc-800/50">
                                <span className="text-xs text-zinc-500">Level</span>
                                <span className="text-xs text-zinc-300 capitalize font-medium">{user.accountLevel}</span>
                            </div>
                            <div className="flex items-center justify-between py-3 border-t border-zinc-800/50">
                                <span className="text-xs text-zinc-500">Member Since</span>
                                <span className="text-xs text-zinc-300 font-medium">{getJoinDate(user.createdAt)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
