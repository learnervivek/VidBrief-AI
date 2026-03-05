"use client";

import { useState, useEffect, useRef } from "react";
import UploadSection from "@/components/UploadSection";
import ProcessingStatus, { ProcessStep } from "@/components/ProcessingStatus";
import SummaryResult from "@/components/SummaryResult";
import HistoryDashboard from "@/components/HistoryDashboard";
import { uploadVideo, getVideoStatus, getAllVideos, VideoProcessingResponse, isAuthenticated, logout } from "@/lib/api";
import { Sparkles, Play, ArrowRight, Zap, Download, Layers, ShieldCheck, Cpu, Mic, FileText, CheckCircle2, Clock, LogOut } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";

// Fallback Lottie URLs (Valid Public Lottie JSONs)
const AI_LOTTIE_URL = "https://assets2.lottiefiles.com/packages/lf20_w51pcehl.json";
const PIPELINE_LOTTIE_URL = "https://assets9.lottiefiles.com/packages/lf20_tno6cg2w.json";

function FadeInWhenVisible({ children, delay = 0, yOffset = 50 }: { children: React.ReactNode, delay?: number, yOffset?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------
// Animated Pipeline Component
// ----------------------------------------------------
function AnimatedPipeline() {
  const steps = [
    { title: "Raw Video", icon: Play, color: "text-blue-400", bg: "bg-blue-500/20" },
    { title: "Audio Extraction", icon: Mic, color: "text-purple-400", bg: "bg-purple-500/20" },
    { title: "Speech to Text", icon: FileText, color: "text-pink-400", bg: "bg-pink-500/20" },
    { title: "AI Summary", icon: Cpu, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  ];

  return (
    <div className="relative w-full max-w-5xl mx-auto py-12">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex flex-col items-center text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${step.bg} ${step.color} shadow-lg transition-transform group-hover:scale-110`}>
              <step.icon size={28} />
            </div>
            <h4 className="font-bold text-lg text-white/90">{step.title}</h4>
            <p className="text-white/40 text-sm mt-2">Step 0{i + 1}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Main VidBrief AI Page
// ----------------------------------------------------
export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<number | null>(null);
  const [status, setStatus] = useState<VideoProcessingResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [view, setView] = useState<"upload" | "history">("upload");
  const [history, setHistory] = useState<VideoProcessingResponse[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const router = useRouter();

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // State to hold fetched Lottie JSON data
  const [aiLottieData, setAiLottieData] = useState(null);

  const heroUploadRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);

  // Fetch Lottie JSONs
  useEffect(() => {
    fetch(AI_LOTTIE_URL)
      .then(res => res.json())
      .then(data => setAiLottieData(data))
      .catch(err => console.error("Failed to load Lottie:", err));
  }, []);

  const handleReset = () => {
    setCurrentVideoId(null);
    setStatus(null);
    setIsUploading(false);
    setView("upload");
  };

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const data = await getAllVideos();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleShowHistory = () => {
    setView("history");
    fetchHistory();
  };

  const handleSelectHistoryVideo = (video: VideoProcessingResponse) => {
    setCurrentVideoId(video.id);
    setStatus(video);
    setView("upload"); // Switch back to upload view to show the result
  };

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const data = await uploadVideo(file);
      setCurrentVideoId(data.id);
      setStatus(data);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload video. Please check if the backend is running.");
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!currentVideoId || status?.status === "completed" || status?.status === "failed") return;

    const interval = setInterval(async () => {
      try {
        const data = await getVideoStatus(currentVideoId);
        setStatus(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentVideoId, status?.status]);

  const scrollToUpload = () => {
    heroUploadRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white selection:bg-indigo-500/30 font-sans">

      {/* Abstract Glowing Neon Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] sm:top-[-20%] left-[-10%] sm:left-[-10vw] w-[60vw] h-[60vw] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] sm:bottom-[-20%] right-[-10%] sm:right-[-10vw] w-[60vw] h-[60vw] bg-fuchsia-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 w-full">

        {/* Modern SaaS Navbar */}
        <nav className="fixed top-0 w-full border-b border-indigo-500/10 bg-[#030712]/80 backdrop-blur-xl z-50">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-2xl font-black tracking-tighter">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Play size={16} className="text-white fill-white ml-0.5" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">VidBrief AI</span>
            </div>

            <div className="hidden md:flex space-x-8 text-sm font-medium text-white/60">
              <button
                onClick={() => setView("upload")}
                className={`hover:text-white transition-colors ${view === "upload" ? "text-white" : ""}`}
              >
                Summarizer
              </button>
              <button
                onClick={handleShowHistory}
                className={`hover:text-white transition-colors ${view === "history" ? "text-white" : ""}`}
              >
                Archive
              </button>
              <button
                onClick={handleLogout}
                className="hover:text-red-400 transition-colors flex items-center space-x-1"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
              <a href="#features" className="hover:text-white transition-colors">Features</a>
            </div>

            <div className="flex items-center space-x-4">
              <a href="#" className="hidden md:block text-sm font-medium text-white/60 hover:text-white">Sign In</a>
              <button onClick={scrollToUpload} className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white text-sm font-bold rounded-xl hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-105 transition-all">
                Try for Free
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 container mx-auto px-6 min-h-screen flex flex-col items-center">

          <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-7xl">
            {/* Left Content */}
            <motion.div style={{ opacity, scale }} className="space-y-8 text-center lg:text-left z-20">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium"
              >
                <Sparkles size={16} />
                <span>The Future of Video Content</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1]"
              >
                Summarize <br className="hidden lg:block" />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-fuchsia-400">
                  Hours of Video
                </span> <br className="hidden lg:block" />
                in Seconds.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-white/50 leading-relaxed font-light max-w-xl mx-auto lg:mx-0"
              >
                VidBrief AI uses state-of-the-art Local Whisper pipelines and DistilBART neural networks to instantly extract, transcribe, and summarize any video.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4"
              >
                <button onClick={scrollToUpload} className="w-full sm:w-auto px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-indigo-50 transition-colors flex items-center justify-center space-x-2">
                  <span>Start Summarizing</span>
                  <ArrowRight size={18} />
                </button>
                <p className="text-white/40 text-sm font-medium flex items-center">
                  <CheckCircle2 size={16} className="text-emerald-500 mr-2" /> No credit card required.
                </p>
              </motion.div>
            </motion.div>

            {/* Right Content - Lottie Animation & Glowing elements */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="relative hidden lg:flex justify-center items-center w-full aspect-square"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 rounded-full blur-[100px]" />
              {aiLottieData ? (
                <Lottie animationData={aiLottieData} loop={true} className="w-[120%] h-[120%] opacity-80 mix-blend-screen z-10" />
              ) : (
                <div className="w-[400px] h-[400px] rounded-full border border-indigo-500/30 flex items-center justify-center p-12 relative animate-spin-slow">
                  <div className="w-full h-full rounded-full border-t border-fuchsia-500/50" />
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Upload Interactor Section */}
        <section ref={heroUploadRef} className="py-20 container mx-auto px-6 relative z-30">
          <div className="max-w-4xl mx-auto">
            <div className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-b from-indigo-500/50 to-fuchsia-500/50 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
              <div className="glass-dark rounded-[2.5rem] p-4 sm:p-10 w-full overflow-hidden">
                <AnimatePresence mode="wait">
                  {view === "history" ? (
                    <motion.div
                      key="history-dashboard"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h2 className="text-2xl font-black tracking-tight flex items-center space-x-3">
                            <Clock className="text-indigo-400" />
                            <span>Your Briefings Archive</span>
                          </h2>
                          <p className="text-white/40 text-sm mt-1">Review your previously processed intelligence.</p>
                        </div>
                        <button
                          onClick={() => setView("upload")}
                          className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors border border-white/5"
                        >
                          Back to Upload
                        </button>
                      </div>
                      <HistoryDashboard videos={history} onSelectVideo={handleSelectHistoryVideo} />
                    </motion.div>
                  ) : !status || (status.status === "pending" && !isUploading) ? (
                    <UploadSection onUpload={handleUpload} isUploading={isUploading} key="upload-section" />
                  ) : status.status === "completed" ? (
                    <SummaryResult
                      key="summary-result"
                      summary={status.summary || ""}
                      transcript={status.transcript || ""}
                      timestampedSummary={status.timestamped_summary}
                      videoFilename={status.filename}
                      onReset={handleReset}
                    />
                  ) : (
                    <ProcessingStatus key="processing-status" status={status.status as ProcessStep} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* How AI Works - Animated Pipeline */}
        <section id="how-it-works" className="py-32 bg-[#050B14] border-y border-indigo-900/30 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[1px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />

          <div className="container mx-auto px-6">
            <FadeInWhenVisible>
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">How VidBrief AI Works</h2>
                <p className="text-lg text-white/50 font-light">A seamless 4-stage neural pipeline executing securely on our cloud infrastructure.</p>
              </div>
            </FadeInWhenVisible>

            <AnimatedPipeline />
          </div>
        </section>

        {/* Feature Showcase */}
        <section id="features" className="py-32 container mx-auto px-6 relative">
          <FadeInWhenVisible>
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight">Enterprise-Grade Architecture</h2>
              <p className="text-lg text-white/50 font-light">Built for performance, accuracy, and scale.</p>
            </div>
          </FadeInWhenVisible>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Layers, title: "Frame Extraction", desc: "OpenCV analyzes key visual moments every 5 seconds.", color: "text-blue-400", border: "group-hover:border-blue-500/50" },
              { icon: Zap, title: "Scene Detection", desc: "Smart algorithms determine major context shifts rapidly.", color: "text-yellow-400", border: "group-hover:border-yellow-500/50" },
              { icon: Cpu, title: "Smart Summarization", desc: "Transformers generate concise, actionable intelligence.", color: "text-indigo-400", border: "group-hover:border-indigo-500/50" },
              { icon: Download, title: "Report Generation", desc: "Download full transcripts and summaries as raw text.", color: "text-emerald-400", border: "group-hover:border-emerald-500/50" },
            ].map((feat, i) => (
              <FadeInWhenVisible key={i} delay={i * 0.1}>
                <div className={`group p-8 glass rounded-3xl border border-white/5 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${feat.border} hover:bg-white/[0.02]`}>
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                    <feat.icon size={24} className={feat.color} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feat.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed font-light">{feat.desc}</p>
                </div>
              </FadeInWhenVisible>
            ))}
          </div>
        </section>

        {/* Demo Output Section */}
        <section id="demo" className="py-32 border-t border-indigo-900/30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#030712] to-[#030712]">
          <div className="container mx-auto px-6">
            <FadeInWhenVisible>
              <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">See It In Action</h2>
                <p className="text-lg text-white/50 font-light">A real example of raw transcript chaos turned into intelligent clarity.</p>
              </div>
            </FadeInWhenVisible>

            <div className="max-w-5xl mx-auto glass border border-indigo-500/20 rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(99,102,241,0.1)]">

              {/* Bad Transcript */}
              <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 bg-black/40">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)] animate-pulse" />
                  <h3 className="text-white/70 font-bold uppercase tracking-widest text-sm">Raw Speech</h3>
                </div>
                <div className="space-y-4 font-mono text-sm text-white/40 leading-loose">
                  <p>
                    "So, um, yeah if we look at the Q3 metrics... wait let me find the slide. Okay here. The revenue is up by... I think 14%? Yeah 14% year over year."
                  </p>
                  <p>
                    "But, like, the customer acquisition cost actually went up too. So we need to, um, figure out a better marketing strategy."
                  </p>
                </div>
              </div>

              {/* Perfect Summary */}
              <div className="flex-1 p-8 md:p-12 relative overflow-hidden bg-indigo-950/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-fuchsia-500/5 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                    <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-sm text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">VidBrief AI Output</h3>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-white font-bold mb-2">Short Summary</h4>
                      <p className="text-white/80 text-sm leading-relaxed">
                        Q3 revenue increased by 14% YoY, but customer acquisition costs (CAC) simultaneously rose, necessitating a revised marketing strategy.
                      </p>
                    </div>
                    <div className="border-t border-indigo-500/20 pt-6">
                      <h4 className="text-white font-bold mb-4">Key Priorities</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start text-sm text-white/70">
                          <Sparkles size={16} className="text-indigo-400 mr-3 shrink-0" />
                          <span>Analyze root causes for increased CAC.</span>
                        </li>
                        <li className="flex items-start text-sm text-white/70">
                          <Sparkles size={16} className="text-indigo-400 mr-3 shrink-0" />
                          <span>Deploy new marketing optimization strategy for Q4.</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global CTA Footer */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <FadeInWhenVisible>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-8">
                Ready to brief your videos?
              </h2>
              <button onClick={scrollToUpload} className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-bold text-lg rounded-xl hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:scale-105 transition-all">
                Upload Your First Video Limitless
              </button>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Real Footer */}
        <footer className="border-t border-white/10 py-12 bg-black">
          <div className="container mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-8 mb-8 border-b border-white/10 pb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-2 text-xl font-black tracking-tighter mb-4">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center">
                    <Play size={12} className="text-white fill-white ml-0.5" />
                  </div>
                  <span className="text-white">VidBrief AI</span>
                </div>
                <p className="text-white/40 text-sm max-w-sm">The world's most advanced Local LLM powered video summarization pipeline. Built for absolute data privacy and speed.</p>
              </div>
              <div>
                <h5 className="text-white font-bold mb-4">Product</h5>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                </ul>
              </div>
              <div>
                <h5 className="text-white font-bold mb-4">Company</h5>
                <ul className="space-y-2 text-sm text-white/50">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between text-white/30 text-xs">
              <span>© 2026 VidBrief AI, Inc. All rights reserved.</span>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy</a>
                <a href="#" className="hover:text-white">Terms</a>
                <a href="#" className="hover:text-white">Cookies</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </main>
  );
}
