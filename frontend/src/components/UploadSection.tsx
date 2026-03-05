"use client";

import { useState, useRef } from "react";
import { Upload, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface UploadSectionProps {
    onUpload: (file: File) => void;
    isUploading: boolean;
}

export default function UploadSection({ onUpload, isUploading }: UploadSectionProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (isValidVideo(file)) {
                setSelectedFile(file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (isValidVideo(file)) {
                setSelectedFile(file);
            }
        }
    };

    const isValidVideo = (file: File) => {
        return file.type.startsWith("video/") || file.name.endsWith(".mp4") || file.name.endsWith(".avi") || file.name.endsWith(".mov");
    };

    const removeFile = () => {
        setSelectedFile(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <section className="w-full max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                    "relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 glass",
                    dragActive ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/20",
                    isUploading && "pointer-events-none opacity-50"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="hidden"
                    accept="video/mp4,video/x-msvideo,video/quicktime"
                    onChange={handleChange}
                />

                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center space-y-4"
                        >
                            <div className="p-4 rounded-full bg-blue-500/10 text-blue-400">
                                <Upload size={32} />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-medium">Drag and drop your video here</p>
                                <p className="text-sm text-white/50">Supports MP4, AVI, MOV (Max 500MB)</p>
                            </div>
                            <button
                                onClick={() => inputRef.current?.click()}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
                            >
                                Select File
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center"
                        >
                            <div className="flex items-center space-x-4 p-4 rounded-xl glass-dark w-full">
                                <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
                                    <Video size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{selectedFile.name}</p>
                                    <p className="text-sm text-white/50">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                <button
                                    onClick={removeFile}
                                    className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onUpload(selectedFile)}
                                className="mt-6 w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                            >
                                {isUploading ? "Uploading..." : "Summarize Video"}
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </section>
    );
}
