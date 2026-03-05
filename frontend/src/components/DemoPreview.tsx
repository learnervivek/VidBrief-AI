"use client";

import { motion } from "framer-motion";
import { Play, FileText, ArrowRight } from "lucide-react";

export default function DemoPreview() {
    return (
        <div className="w-full max-w-6xl mx-auto py-20 px-6">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">Experience the Magic</h2>
                <p className="text-white/50 text-lg">Watch how hours of content condense down to the most important points.</p>
            </div>

            <div className="flex flex-col lg:flex-row items-stretch gap-6">

                {/* Before */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex-1 glass dark rounded-3xl p-6 border border-white/5 flex flex-col relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Play size={100} />
                    </div>
                    <h3 className="text-xl font-bold mb-6 text-white/80 flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
                        <span>Before (1hr Lecture)</span>
                    </h3>
                    <div className="flex-1 bg-black/40 rounded-2xl p-6 font-mono text-sm text-white/40 leading-relaxed overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black pointer-events-none" />
                        <p>
                            "So, um, today we're going to talk about... wait, let me pull up the slides. Okay, yes, quantum mechanics. Now, basically, if you look at the wave function, it collapses when... oh, did everyone get the syllabus? Anyway, the key point is about superposition... like Schrodinger's cat, which is both alive and dead. I mean, it's a thought experiment, but you know what I mean. Let's take a 5-minute break before we dive into the math part..."
                        </p>
                        <p className="mt-4">
                            [...45 minutes of derivations and tangents...]
                        </p>
                        <p className="mt-4">
                            "So in conclusion, quantum entanglement means particles are linked across space. Okay, read chapter 4 for next week."
                        </p>
                    </div>
                </motion.div>

                {/* Arrow */}
                <div className="hidden lg:flex flex-col justify-center items-center px-4 text-blue-500">
                    <motion.div
                        animate={{ x: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        <ArrowRight size={40} />
                    </motion.div>
                </div>

                {/* After */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="flex-1 glass rounded-3xl p-6 border border-blue-500/30 relative overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 pointer-events-none" />
                    <h3 className="text-xl font-bold mb-6 text-blue-400 flex items-center space-x-2">
                        <FileText size={20} />
                        <span>After (AI Summary)</span>
                    </h3>

                    <div className="flex-1 bg-blue-950/20 rounded-2xl p-6 relative z-10">
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-bold text-white mb-2">Short Summary:</h4>
                                <p className="text-white/80 leading-relaxed text-sm">
                                    The lecture covered the foundational concepts of quantum mechanics, focusing on wave function collapse, superposition, and quantum entanglement.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-blue-500/20">
                                <h4 className="font-bold text-white mb-3">Key Points:</h4>
                                <ul className="space-y-3">
                                    <li className="flex items-start space-x-3 text-sm text-white/70">
                                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                                        <span><strong>Superposition:</strong> Particles can exist in multiple states simultaneously (e.g., Schrodinger's cat thought experiment).</span>
                                    </li>
                                    <li className="flex items-start space-x-3 text-sm text-white/70">
                                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                                        <span><strong>Entanglement:</strong> Particles remained linked across space, affecting each other instantly.</span>
                                    </li>
                                    <li className="flex items-start space-x-3 text-sm text-white/70">
                                        <span className="text-blue-400 font-bold mt-0.5">•</span>
                                        <span><strong>Action Item:</strong> Read Chapter 4 before the next class.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
