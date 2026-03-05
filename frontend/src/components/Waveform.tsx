"use client";

import { motion } from "framer-motion";

export default function Waveform() {
    const bars = 20;

    return (
        <div className="flex items-center justify-center space-x-1 h-12">
            {Array.from({ length: bars }).map((_, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-blue-500 rounded-full"
                    animate={{
                        height: ["20%", "100%", "20%"],
                        backgroundColor: ["#3b82f6", "#8b5cf6", "#3b82f6"],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1,
                    }}
                    style={{ height: "20%" }}
                />
            ))}
        </div>
    );
}
