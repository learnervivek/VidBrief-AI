"use client";

import { CheckCircle2, Loader2, Music, Scissors, Type, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Waveform from "./Waveform";

export type ProcessStep = "pending" | "extracting_audio" | "transcribing" | "summarizing" | "completed" | "failed";

interface ProcessingStatusProps {
    status: ProcessStep;
}

const steps = [
    { id: "extracting_audio", label: "Extracting Audio", icon: Music },
    { id: "transcribing", label: "Transcribing Speech", icon: Type },
    { id: "summarizing", label: "AI Summarization", icon: FileText },
];

export default function ProcessingStatus({ status }: ProcessingStatusProps) {
    const getStepStatus = (stepId: string) => {
        const statusOrder = ["pending", "extracting_audio", "transcribing", "summarizing", "completed", "failed"];
        const currentIndex = statusOrder.indexOf(status);
        const stepIndex = statusOrder.indexOf(stepId);

        if (status === "failed") return "failed";
        if (currentIndex > stepIndex || status === "completed") return "completed";
        if (currentIndex === stepIndex) return "active";
        return "waiting";
    };

    return (
        <div className="w-full max-w-xl mx-auto mt-12 space-y-8 glass rounded-3xl p-8 relative overflow-hidden text-left shadow-2xl">
            <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay pointer-events-none" />

            <div className="text-center mb-8 relative z-10">
                <h3 className="text-xl font-bold mb-4 text-white">AI Engine Processing</h3>
                <div className="h-16 flex items-center justify-center">
                    {status !== "failed" && status !== "completed" ? (
                        <Waveform />
                    ) : (
                        <div className="text-white/30 text-sm italic">Processing finished</div>
                    )}
                </div>
            </div>

            <div className="flex flex-col space-y-4 relative z-10">
                {steps.map((step, index) => {
                    const stepStatus = getStepStatus(step.id);
                    const Icon = step.icon;

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={cn(
                                "flex items-center space-x-4 p-4 rounded-xl transition-all duration-500",
                                stepStatus === "active" ? "glass border-blue-500/50 shadow-lg shadow-blue-500/10" : "bg-white/5 opacity-50"
                            )}
                        >
                            <div className={cn(
                                "p-2 rounded-lg",
                                stepStatus === "completed" ? "bg-green-500/20 text-green-400" :
                                    stepStatus === "active" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-white/30"
                            )}>
                                {stepStatus === "completed" ? <CheckCircle2 size={24} /> :
                                    stepStatus === "active" ? <Loader2 size={24} className="animate-spin" /> :
                                        <Icon size={24} />}
                            </div>
                            <div className="flex-1">
                                <p className={cn(
                                    "font-medium",
                                    stepStatus === "active" ? "text-white" : "text-white/70"
                                )}>
                                    {step.label}
                                </p>
                                {stepStatus === "active" && (
                                    <p className="text-xs text-blue-400/80 mt-1">Processing...</p>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {status === "failed" && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center"
                >
                    Something went wrong during processing. Please try again.
                </motion.div>
            )}
        </div>
    );
}
