"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "../lib/api";

export default function Auth() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoginMode, setIsLoginMode] = useState(true);

    const handleSubmit = async () => {
        setLoading(true);
        setMessage("");

        const endpoint = isLoginMode ? "login" : "signup";
        const data = isLoginMode
            ? { email, password }
            : { username, email, password, isAnonymous: false };

        try {
            const response = await fetch(`${API_URL}/api/auth/${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                router.push("/dashboard");
            } else {
                setMessage(result.message || "Authentication failed");
                setLoading(false);
            }
        } catch (err: any) {
            setMessage(`Network Error: ${err.message}`);
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white px-4 font-sans">
            <div className="w-full max-w-sm bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-zinc-800">

                <div className="text-center mb-8">
                    <button onClick={() => router.push("/")} className="text-3xl mb-3 block mx-auto hover:scale-110 transition-transform">👻</button>
                    <h1 className="text-2xl font-semibold mb-2 text-zinc-100">
                        {isLoginMode ? "Welcome Back" : "Create Account"}
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        {isLoginMode ? "Enter your details to sign in" : "Sign up to start chatting"}
                    </p>
                </div>

                <div className="flex flex-col gap-4 mb-6">
                    {!isLoginMode && (
                        <input
                            className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-all"
                            placeholder="Display Name"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    )}
                    <input
                        className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-all"
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-600 transition-all"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {message && (
                    <div className="text-zinc-400 text-sm text-center mb-4 bg-zinc-800 py-2 rounded-lg border border-zinc-700">
                        {message}
                    </div>
                )}

                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white disabled:bg-zinc-800 disabled:text-zinc-500 transition-colors font-semibold py-3.5 rounded-xl mb-6"
                >
                    {loading ? "Authenticating..." : (isLoginMode ? "Sign In" : "Sign Up")}
                </button>

                <p className="text-center text-zinc-500 text-sm">
                    {isLoginMode ? "Don't have an account?" : "Already have an account?"}{" "}
                    <button
                        onClick={() => { setIsLoginMode(!isLoginMode); setMessage(""); }}
                        className="text-emerald-500 font-medium hover:underline"
                    >
                        {isLoginMode ? "Sign up" : "Log in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
