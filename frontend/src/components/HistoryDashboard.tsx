"use client";

import { motion } from "framer-motion";
import { Play, Clock, FileText, ChevronRight, Calendar, Sparkles } from "lucide-react";
import { VideoProcessingResponse, BASE_URL } from "@/lib/api";

interface HistoryDashboardProps {
    videos: VideoProcessingResponse[];
    onSelectVideo: (video: VideoProcessingResponse) => void;
}

export default function HistoryDashboard({ videos, onSelectVideo }: HistoryDashboardProps) {
    if (videos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-white/40 space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                    <Clock size={32} />
                </div>
                <p className="text-lg font-medium">No videos processed yet.</p>
                <p className="text-sm">Upload your first video to see it here!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {videos.map((video, idx) => (
                <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => onSelectVideo(video)}
                    className="group glass-dark rounded-[2rem] border border-white/5 hover:border-indigo-500/30 overflow-hidden cursor-pointer transition-all hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:-translate-y-1"
                >
                    {/* Thumbnail Section */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                        {video.thumbnail_path ? (
                            <img
                                src={`${BASE_URL}/uploads/${video.thumbnail_path}`}
                                alt={video.filename}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-500/10">
                                <Play size={32} className="text-indigo-400 opacity-50" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                            <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${video.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                                    video.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'
                                }`}>
                                {video.status}
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                        <div>
                            <h3 className="text-white font-bold truncate group-hover:text-indigo-400 transition-colors" title={video.filename}>
                                {video.filename}
                            </h3>
                            <div className="flex items-center text-white/30 text-[10px] mt-1 space-x-3">
                                <div className="flex items-center">
                                    <Calendar size={10} className="mr-1" />
                                    {new Date(video.created_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center">
                                    <Clock size={10} className="mr-1" />
                                    {new Date(video.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>

                        {video.summary && (
                            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed italic">
                                "{video.summary}"
                            </p>
                        )}

                        <div className="pt-4 flex items-center justify-between border-t border-white/5">
                            <div className="flex space-x-3 text-white/40">
                                <div className="flex items-center" title="Transcript Available">
                                    <FileText size={14} className={video.transcript ? "text-indigo-400" : ""} />
                                </div>
                                <div className="flex items-center" title="AI Summary Available">
                                    <Sparkles size={14} className={video.summary ? "text-fuchsia-400" : ""} />
                                </div>
                            </div>
                            <button className="text-xs font-bold text-white group-hover:text-indigo-400 flex items-center space-x-1 transition-colors">
                                <span>View Details</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
