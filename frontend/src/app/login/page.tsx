"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { login, isAuthenticated } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Play } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            await login(email, password);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Invalid credentials");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 shadow-lg shadow-indigo-500/20 mb-6">
                        <Play size={32} className="text-white fill-white ml-1" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Welcome Back</h1>
                    <p className="text-white/40 font-medium">Log in to your AI Video Intelligence dashboard</p>
                </div>

                <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500" />

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-sm font-medium"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                                    placeholder="name@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Password</label>
                                <a href="#" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Forgot?</a>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.08] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 group"
                        >
                            <span>{isLoading ? "Authenticating..." : "Sign In"}</span>
                            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/40 text-sm font-medium">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-white hover:text-indigo-400 transition-colors font-bold underline underline-offset-4 decoration-white/20">
                                Create one for free
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center space-x-2 text-white/20 text-xs font-medium uppercase tracking-widest">
                    <Sparkles size={12} />
                    <span>Powered by Neural-AI Pipelines</span>
                </div>
            </motion.div>
        </main>
    );
}
