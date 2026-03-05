"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { signup, isAuthenticated } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, ArrowRight, Play, User } from "lucide-react";
import Link from "next/link";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/");
        }
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError("");
        try {
            await signup(email, password);
            setSuccess(true);
            setTimeout(() => router.push("/login"), 2000);
        } catch (err: any) {
            setError(err.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#030712] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/20 rounded-full blur-[120px]" />
                <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/20 mb-6">
                        <User size={32} className="text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight mb-2">Join VidBrief</h1>
                    <p className="text-white/40 font-medium">Create your neural intelligence account</p>
                </div>

                <div className="glass-dark rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-10 space-y-4"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="text-emerald-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Account Created!</h2>
                            <p className="text-white/40">Welcome to the future of video summary. Redirecting you to login...</p>
                        </motion.div>
                    ) : (
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
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Choose Password</label>
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

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-white/40 uppercase tracking-widest ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                    <input
                                        type="password"
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
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
                                <span>{isLoading ? "Creating Profile..." : "Create Account"}</span>
                                {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <p className="text-white/40 text-sm font-medium">
                            Already a member?{" "}
                            <Link href="/login" className="text-white hover:text-indigo-400 transition-colors font-bold underline underline-offset-4 decoration-white/20">
                                Log in instead
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center space-x-2 text-white/20 text-xs font-medium uppercase tracking-widest">
                    <Play size={10} className="fill-white/20" />
                    <span>Secure Cloud Infrastructure</span>
                </div>
            </motion.div>
        </main>
    );
}
