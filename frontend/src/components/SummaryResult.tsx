"use client";

import { motion } from "framer-motion";
import { Copy, Sparkles, FileText, Download, RotateCcw, PlayCircle, Clock } from "lucide-react";
import { useState, useRef } from "react";
import { TimestampedSummaryPoint, BASE_URL } from "@/lib/api";

interface SummaryResultProps {
    transcript: string;
    summary: string;
    timestampedSummary?: TimestampedSummaryPoint[];
    videoFilename: string;
    onReset: () => void;
}

export default function SummaryResult({
    transcript,
    summary,
    timestampedSummary,
    videoFilename,
    onReset
}: SummaryResultProps) {
    const [copied, setCopied] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const copyToClipboard = () => {
        let textToCopy = `OVERVIEW:\n${summary}\n\nDETAILED TIMELINE:\n`;
        if (timestampedSummary) {
            textToCopy += timestampedSummary.map(s => `${s.timestamp} - ${s.text}`).join('\n');
        }
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadSummary = () => {
        let textToDownload = `AI VIDEO SUMMARY\n================\n\nOVERVIEW:\n${summary}\n\nDETAILED TIMELINE:\n`;
        if (timestampedSummary) {
            textToDownload += timestampedSummary.map(s => `${s.timestamp} - ${s.text}`).join('\n');
        }
        const element = document.createElement("a");
        const file = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        element.download = "video_summary.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const downloadSubtitleFile = (format: 'srt' | 'vtt') => {
        const baseName = videoFilename.substring(0, videoFilename.lastIndexOf('.'));
        const fileName = `${baseName}.${format}`;
        const srtUrl = `${BASE_URL}/uploads/${encodeURIComponent(fileName)}`;
        const element = document.createElement("a");
        element.href = srtUrl;
        element.download = fileName;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const seekTo = (seconds: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = seconds;
            videoRef.current.play();
            // Scroll video into view if needed
            videoRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    const videoUrl = `${BASE_URL}/uploads/${encodeURIComponent(videoFilename)}`;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-5xl mx-auto mt-12 space-y-8 pb-20"
        >
            <div className="glass rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Summary Header */}
                <div className="px-8 py-6 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex items-center justify-between border-b border-white/10">
                    <div className="flex items-center space-x-3">
                        <Sparkles className="text-blue-400" />
                        <h2 className="text-xl font-bold">AI Video Intelligence</h2>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={copyToClipboard}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                            title="Copy Summary"
                        >
                            <Copy size={18} />
                        </button>
                        <button
                            onClick={downloadSummary}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                            title="Download Summary Text"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            onClick={onReset}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-sm font-medium rounded-lg transition-colors flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                        >
                            <RotateCcw size={16} />
                            <span>New Brief</span>
                        </button>
                    </div>
                </div>

                {/* Subtitle Downloads */}
                <div className="px-8 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-[11px] font-bold tracking-widest uppercase text-white/40">
                    <span>Generated Deliverables</span>
                    <div className="flex items-center space-x-4">
                        <button onClick={() => downloadSubtitleFile('srt')} className="hover:text-indigo-400 transition-colors flex items-center space-x-1">
                            <Download size={12} />
                            <span>SRT Subtitles</span>
                        </button>
                        <button onClick={() => downloadSubtitleFile('vtt')} className="hover:text-indigo-400 transition-colors flex items-center space-x-1">
                            <Download size={12} />
                            <span>VTT Subtitles</span>
                        </button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2">
                    {/* Video Player */}
                    <div className="p-8 border-r border-white/10 bg-black/40">
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                            <video
                                ref={videoRef}
                                src={videoUrl}
                                controls
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <div className="mt-6">
                            <h3 className="text-white/40 uppercase tracking-widest text-[10px] font-bold mb-2">Original Filename</h3>
                            <p className="text-xs text-white/60 truncate">{videoFilename}</p>
                        </div>
                    </div>

                    {/* Summaries Column */}
                    <div className="p-8 flex flex-col h-full bg-white/[0.02] border-l border-white/5">
                        {/* Overall Summary */}
                        <div className="mb-10">
                            <h3 className="text-sm font-bold text-fuchsia-400 mb-4 flex items-center space-x-2">
                                <Sparkles size={16} />
                                <span>AI Overview</span>
                            </h3>
                            <div className="p-5 rounded-2xl border border-white/5 bg-white/5 shadow-inner">
                                <p className="text-sm text-white/90 leading-relaxed italic">
                                    "{summary}"
                                </p>
                            </div>
                        </div>

                        {/* Timestamped Summary */}
                        <div className="flex flex-col flex-1 min-h-0">
                            <h3 className="text-sm font-bold text-indigo-400 mb-6 flex items-center space-x-2">
                                <Clock size={16} />
                                <span>Timestamped Brief</span>
                            </h3>

                            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-4 scrollbar-thin scrollbar-thumb-white/10">
                                {timestampedSummary && timestampedSummary.length > 0 ? (
                                    timestampedSummary.map((item, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => seekTo(item.seconds)}
                                            className="group cursor-pointer p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all flex items-start space-x-4"
                                        >
                                            <div className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold font-mono shrink-0 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                                                {item.timestamp}
                                            </div>
                                            <p className="text-sm text-white/80 leading-relaxed group-hover:text-white transition-colors">
                                                {item.text}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 italic text-white/40 text-sm">
                                        No timestamped data available.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Transcript Section */}
                <div className="border-t border-white/5 bg-black/20 p-8">
                    <details className="group">
                        <summary className="flex items-center justify-between cursor-pointer text-white/50 hover:text-white transition-colors">
                            <div className="flex items-center space-x-2">
                                <FileText size={18} />
                                <span className="font-medium text-sm">View Neural Transcript</span>
                            </div>
                            <span className="text-xs transition-transform group-open:rotate-180">▼</span>
                        </summary>
                        <div className="mt-6 text-sm text-white/30 leading-loose max-h-60 overflow-y-auto pr-4 font-mono scrollbar-thin scrollbar-thumb-white/10 bg-black/30 p-6 rounded-2xl border border-white/5">
                            {transcript}
                        </div>
                    </details>
                </div>
            </div>

            {copied && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-indigo-500 text-white rounded-full shadow-2xl font-medium z-50 flex items-center space-x-2"
                >
                    <Sparkles size={16} />
                    <span>Brief copied to clipboard!</span>
                </motion.div>
            )}
        </motion.div>
    );
}
