"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
    _id: string;
    username: string;
    isAnonymous: boolean;
    ghostPoints: number;
    messagesSent: number;
    accountLevel: string;
    lastActive: string;
}

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/users", { credentials: "include" });
                if (!res.ok) { router.push("/auth"); return; }
                setUsers(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getTimeSince = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
                    <p className="text-sm">Loading ghosts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => router.push("/dashboard")} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-zinc-100">All Ghosts</h1>
                        <p className="text-xs text-zinc-500">{users.length} on this server</p>
                    </div>
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search ghosts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 text-sm text-white placeholder-zinc-500 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:border-zinc-600 transition-colors mb-6"
                />

                {/* Users List */}
                <div className="space-y-2">
                    {filteredUsers.length === 0 ? (
                        <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
                            <p className="text-3xl mb-3">👻</p>
                            <p className="text-zinc-500 text-sm">No ghosts found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user, i) => (
                            <button
                                key={user._id}
                                onClick={() => router.push(`/users/${user._id}`)}
                                className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition-all group text-left"
                                style={{ animation: `messageAppear 0.3s ease-out ${i * 0.04}s both` }}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${user.isAnonymous ? "bg-zinc-800 border border-zinc-700" : "bg-zinc-700"
                                        }`}>
                                        {user.isAnonymous ? "👻" : user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                                            {user.username}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-zinc-500 capitalize">{user.accountLevel}</span>
                                            <span className="text-zinc-700">·</span>
                                            <span className="text-[10px] text-zinc-500">{getTimeSince(user.lastActive)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-zinc-300 text-sm font-medium">{user.ghostPoints}</p>
                                        <p className="text-zinc-600 text-[10px]">pts</p>
                                    </div>
                                    <svg className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
