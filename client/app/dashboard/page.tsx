"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";

interface Room {
    _id: string;
    name: string;
    isMain: boolean;
    members: string[];
    pendingMembers: string[];
    createdBy: any;
    status?: string;
}

interface Message {
    _id: string;
    sender: string;
    senderName: string;
    text: string;
    createdAt: string;
    vanishing?: boolean;
}

interface PendingUser {
    _id: string;
    username: string;
    ghostPoints: number;
    accountLevel: string;
}

let socket: Socket | null = null;

export default function Dashboard() {
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [activeRoom, setActiveRoom] = useState<Room | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [vanishMode, setVanishMode] = useState(false);
    const [showCreateRoom, setShowCreateRoom] = useState(false);
    const [newRoomName, setNewRoomName] = useState("");
    const [createError, setCreateError] = useState("");
    const [pendingStatus, setPendingStatus] = useState<string | null>(null);
    const [pendingRequests, setPendingRequests] = useState<PendingUser[]>([]);
    const [showPending, setShowPending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const vanishIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, roomsRes] = await Promise.all([
                    fetch("http://localhost:5000/api/auth/profile", { credentials: "include" }),
                    fetch("http://localhost:5000/api/rooms", { credentials: "include" }),
                ]);
                if (!profileRes.ok) { router.push("/auth"); return; }
                const profileData = await profileRes.json();
                const roomsData = await roomsRes.json();
                setProfile(profileData);
                setRooms(roomsData);
                if (window.innerWidth >= 768) setSidebarOpen(true);
                if (roomsData.length > 0) {
                    const lobby = roomsData.find((r: Room) => r.isMain) || roomsData[0];
                    handleSelectRoom(lobby);
                }
            } catch { router.push("/auth"); }
            finally { setLoading(false); }
        };
        fetchData();
        return () => {
            if (socket) { socket.disconnect(); socket = null; }
            if (vanishIntervalRef.current) clearInterval(vanishIntervalRef.current);
        };
    }, []);

    useEffect(() => {
        if (!profile) return;
        socket = io("http://localhost:5000", { withCredentials: true });
        socket.on("newMessage", (msg: Message) => setMessages((prev) => [...prev, msg]));
        socket.on("messageVanished", (messageId: string) => {
            setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, vanishing: true } : m)));
            setTimeout(() => setMessages((prev) => prev.filter((m) => m._id !== messageId)), 600);
        });
        return () => { if (socket) { socket.disconnect(); socket = null; } };
    }, [profile]);

    useEffect(() => {
        if (vanishIntervalRef.current) { clearInterval(vanishIntervalRef.current); vanishIntervalRef.current = null; }
        if (vanishMode && activeRoom && socket) {
            vanishIntervalRef.current = setInterval(() => {
                setMessages((prev) => {
                    if (prev.length === 0) return prev;
                    const oldest = prev.find((m) => !m.vanishing);
                    if (oldest && socket) socket.emit("vanishMessage", { roomId: activeRoom._id, messageId: oldest._id });
                    return prev;
                });
            }, 10000);
        }
        return () => { if (vanishIntervalRef.current) clearInterval(vanishIntervalRef.current); };
    }, [vanishMode, activeRoom]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSelectRoom = async (room: Room) => {
        if (activeRoom && socket) socket.emit("leaveRoom", activeRoom._id);
        setActiveRoom(room);
        setMessages([]);
        setVanishMode(false);
        setPendingStatus(null);
        setShowPending(false);
        if (window.innerWidth < 768) setSidebarOpen(false);

        // Try to join the room
        try {
            const joinRes = await fetch(`http://localhost:5000/api/rooms/join/${room._id}`, {
                method: "POST", credentials: "include",
            });
            const joinData = await joinRes.json();

            if (joinData.status === "pending") {
                setPendingStatus("pending");
                return; // Don't load messages or join socket room
            }

            // Approved member — load messages and join socket
            setPendingStatus("member");
        } catch (err) { console.error(err); }

        try {
            const res = await fetch(`http://localhost:5000/api/messages/${room._id}`, { credentials: "include" });
            if (res.ok) setMessages(await res.json());
        } catch (err) { console.error(err); }

        if (socket) socket.emit("joinRoom", room._id);
    };

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;
        setCreateError("");
        try {
            const res = await fetch("http://localhost:5000/api/rooms/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newRoomName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setCreateError(data.message); return; }
            setRooms((prev) => [...prev, data]);
            setNewRoomName("");
            setShowCreateRoom(false);
            handleSelectRoom(data);
        } catch { setCreateError("Failed to create room"); }
    };

    const fetchPendingRequests = async (roomId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/rooms/pending/${roomId}`, { credentials: "include" });
            if (res.ok) setPendingRequests(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleApprove = async (userId: string) => {
        if (!activeRoom) return;
        try {
            await fetch(`http://localhost:5000/api/rooms/approve/${activeRoom._id}/${userId}`, {
                method: "POST", credentials: "include",
            });
            setPendingRequests((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) { console.error(err); }
    };

    const handleReject = async (userId: string) => {
        if (!activeRoom) return;
        try {
            await fetch(`http://localhost:5000/api/rooms/reject/${activeRoom._id}/${userId}`, {
                method: "POST", credentials: "include",
            });
            setPendingRequests((prev) => prev.filter((u) => u._id !== userId));
        } catch (err) { console.error(err); }
    };

    const handleSend = () => {
        if (!newMessage.trim() || !activeRoom || !socket) return;
        socket.emit("sendMessage", { roomId: activeRoom._id, text: newMessage.trim() });
        setNewMessage("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const canCreateRoom = (profile?.ghostPoints ?? 0) >= 100;
    const isRoomOwner = activeRoom && activeRoom.createdBy &&
        (typeof activeRoom.createdBy === "string"
            ? activeRoom.createdBy === profile?._id
            : activeRoom.createdBy._id === profile?._id);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-zinc-500 font-sans">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-zinc-700 border-t-zinc-400 rounded-full animate-spin"></div>
                    <p className="text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-950 text-white font-sans relative">

            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <div className={`
        fixed md:relative z-30
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        ${sidebarOpen ? "w-64" : "w-0 md:w-0"}
        transition-all duration-300 bg-zinc-900 border-r border-zinc-800 flex flex-col overflow-hidden shrink-0 h-full
      `}>
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-100 tracking-tight">ghostchats</span>
                    <button onClick={() => setSidebarOpen(false)} className="md:hidden text-zinc-500 hover:text-zinc-300">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div onClick={() => router.push("/profile")} className="mx-3 mt-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {profile?.isAnonymous ? "G" : profile?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{profile?.username}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{profile?.ghostPoints ?? 0} pts</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto mt-3 px-3">
                    <div className="flex items-center justify-between mb-2 px-1">
                        <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">Rooms</p>
                        <button
                            onClick={() => { setShowCreateRoom(!showCreateRoom); setCreateError(""); }}
                            className="text-zinc-500 hover:text-zinc-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {showCreateRoom && (
                        <div className="mb-3 space-y-2">
                            {canCreateRoom ? (
                                <>
                                    <input type="text" placeholder="Room name..." value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleCreateRoom(); }}
                                        className="w-full bg-zinc-950 text-xs text-white placeholder-zinc-500 border border-zinc-800 rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-600 transition-all"
                                    />
                                    <button onClick={handleCreateRoom} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs py-2 rounded-lg transition-colors font-medium">
                                        Create Room
                                    </button>
                                </>
                            ) : (
                                <p className="text-[10px] text-zinc-500 px-1">
                                    Need <span className="text-zinc-300">100</span> pts to create a room. You have <span className="text-zinc-300">{profile?.ghostPoints ?? 0}</span>.
                                </p>
                            )}
                            {createError && <p className="text-[10px] text-red-400 px-1">{createError}</p>}
                        </div>
                    )}

                    <div className="space-y-0.5">
                        {rooms.map((room) => (
                            <button key={room._id} onClick={() => handleSelectRoom(room)}
                                className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-all text-sm ${activeRoom?._id === room._id
                                        ? "bg-emerald-500/10 text-emerald-400"
                                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                                    }`}
                            >
                                <span className="text-xs">#</span>
                                <span className="font-medium truncate text-xs">{room.name}</span>
                                {!room.isMain && <span className="text-[9px] text-zinc-600 ml-auto">private</span>}
                            </button>
                        ))}
                    </div>

                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold mb-2 px-1 mt-5">Explore</p>
                    <button onClick={() => router.push("/users")}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 transition-all"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-xs font-medium">Browse Ghosts</span>
                    </button>
                </div>

                <div className="p-3 border-t border-zinc-800">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-zinc-950 rounded-lg p-2 text-center">
                            <p className="text-zinc-200 text-sm font-semibold">{profile?.ghostPoints ?? 0}</p>
                            <p className="text-zinc-600 text-[10px]">Points</p>
                        </div>
                        <div className="bg-zinc-950 rounded-lg p-2 text-center">
                            <p className="text-zinc-200 text-sm font-semibold">{profile?.messagesSent ?? 0}</p>
                            <p className="text-zinc-600 text-[10px]">Messages</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">

                <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-zinc-900 border-b border-zinc-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <div>
                            <h2 className="text-sm font-semibold text-zinc-200">{activeRoom?.name || "Select a room"}</h2>
                            <p className="text-[11px] text-zinc-500">{activeRoom?.members?.length || 0} members</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Pending requests button — only visible to room owner */}
                        {isRoomOwner && !activeRoom?.isMain && (
                            <button
                                onClick={() => {
                                    setShowPending(!showPending);
                                    if (!showPending && activeRoom) fetchPendingRequests(activeRoom._id);
                                }}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${showPending
                                        ? "bg-zinc-700 text-zinc-200 border border-zinc-600"
                                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300"
                                    }`}
                            >
                                Requests
                            </button>
                        )}

                        {activeRoom && pendingStatus === "member" && (
                            <button onClick={() => setVanishMode(!vanishMode)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${vanishMode ? "bg-zinc-700 text-zinc-200 border border-zinc-600"
                                        : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:text-zinc-300"
                                    }`}
                            >
                                <span className="hidden sm:inline">{vanishMode ? "Vanish ON" : "Vanish"}</span>
                                <span className="sm:hidden">{vanishMode ? "ON" : "V"}</span>
                            </button>
                        )}

                        <div className="hidden sm:flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[11px] text-zinc-500">Live</span>
                        </div>
                    </div>
                </div>

                {/* Pending Requests Panel */}
                {showPending && isRoomOwner && (
                    <div className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-3">
                        <p className="text-xs text-zinc-400 mb-3 font-medium">Join Requests</p>
                        {pendingRequests.length === 0 ? (
                            <p className="text-[11px] text-zinc-500">No pending requests</p>
                        ) : (
                            <div className="space-y-2">
                                {pendingRequests.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-[10px] font-bold">
                                                {user.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-zinc-200">{user.username}</p>
                                                <p className="text-[10px] text-zinc-500">{user.ghostPoints} pts · {user.accountLevel}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleApprove(user._id)} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] px-3 py-1.5 rounded-lg transition-colors font-medium">
                                                Approve
                                            </button>
                                            <button onClick={() => handleReject(user._id)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-[10px] px-3 py-1.5 rounded-lg transition-colors font-medium border border-zinc-700">
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {vanishMode && (
                    <div className="bg-zinc-800/50 border-b border-zinc-700/50 px-4 py-1.5 flex items-center justify-center">
                        <span className="text-zinc-400 text-[11px]">Vanish Mode — messages dissolve every 10s</span>
                    </div>
                )}

                {/* Main Content */}
                {activeRoom ? (
                    pendingStatus === "pending" ? (
                        /* Pending Approval Screen */
                        <div className="flex-1 flex items-center justify-center px-6">
                            <div className="text-center max-w-xs">
                                <div className="w-12 h-12 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H10m6-7V5a2 2 0 00-2-2H10a2 2 0 00-2 2v5a2 2 0 002 2h4a2 2 0 002-2z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-semibold text-zinc-200 mb-2">Request Sent</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">
                                    Your request to join <span className="text-zinc-300 font-medium">{activeRoom.name}</span> has been sent to the room owner. You'll be able to chat once they approve you.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Normal Chat */
                        <>
                            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-2.5">
                                {messages.length === 0 && (
                                    <div className="flex items-center justify-center h-full">
                                        <p className="text-zinc-600 text-sm">No messages yet</p>
                                    </div>
                                )}
                                {messages.map((msg) => {
                                    const isMine = msg.sender === profile?._id;
                                    return (
                                        <div key={msg._id}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"} transition-all duration-500 ${msg.vanishing ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"
                                                }`}
                                            style={{ animation: msg.vanishing ? undefined : "messageAppear 0.3s ease-out" }}
                                        >
                                            <div className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-2.5 ${isMine ? "bg-emerald-600 text-white" : "bg-zinc-800 text-zinc-200"
                                                }`}>
                                                {!isMine && <p className="text-[11px] text-zinc-400 mb-1 font-medium">{msg.senderName}</p>}
                                                <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                                                <p className={`text-[10px] mt-1 ${isMine ? "text-emerald-200/50" : "text-zinc-500"}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="px-4 sm:px-6 py-3 bg-zinc-900 border-t border-zinc-800 shrink-0">
                                <div className="flex items-center gap-3">
                                    <input type="text" placeholder="Type a message..." value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                                        className="flex-1 bg-zinc-950 text-sm text-white placeholder-zinc-500 border border-zinc-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-600 transition-all"
                                    />
                                    <button onClick={handleSend} disabled={!newMessage.trim()}
                                        className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white p-2.5 rounded-xl transition-all shrink-0"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-zinc-600 text-sm">Select a room to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
