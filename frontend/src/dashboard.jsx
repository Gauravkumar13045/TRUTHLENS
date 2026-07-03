import { useState, useEffect } from "react";


function Dashboard() {
    const [activeTab, setActiveTab] = useState("verdicts");
    const [urlPlacer, setUrlPlacer] = useState("");
    const [iframeUrl, setIframeUrl] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [inputMode, setInputMode] = useState("url");
    const [transcript, setTranscript] = useState([]);
    const [analysis, setAnalysis] = useState(null);

    useEffect(() => {
        if (!iframeUrl) return;

        return () => {
            URL.revokeObjectURL(iframeUrl);
        };
    }, [iframeUrl]);

    const handleUrl = async () => {

        setLoading(true);
        setError(null);

        try {
            if (urlPlacer.trim() !== "" && selectedFile) {
                showError("Choose either a URL or a file, not both.");

                return;
            }


            if (urlPlacer.trim() === "" && !selectedFile) {
                showError("Please provide a URL or upload a URL.");

                return;
            }





            function isValidUrl(url) {
                try {
                    new URL(url);
                    return true;
                } catch (error) {
                    return false;
                }

            }
            if (!isValidUrl(urlPlacer)) {
                showError("Invalid URL");

                return;
            }


            function detectPlatform(url) {
                const hostname = new URL(url).hostname;

                if (hostname === "www.youtube.com" || hostname === "youtube.com" || hostname === "youtu.be") {
                    return "youtube";
                }

                if (hostname === "www.instagram.com" || hostname === "instagram.com") {
                    return "instagram";
                }

                if (hostname === "www.tiktok.com" || hostname === "tiktok.com") {
                    return "tiktok";
                }

                if (hostname === "vimeo.com" || hostname === "www.vimeo.com") {
                    return "vimeo";
                }

                if (hostname === "twitter.com" || hostname === "x.com" || hostname === "www.x.com") {
                    return "twitter";
                }

                return "unsupported";




            }
            const platform = detectPlatform(urlPlacer);

            if (platform === "unsupported") {
                showError("Unsupported Platform");

                return;
            }

            function extractId(url) {

                const parsed = new URL(url);
                const pathname = parsed.pathname;

                if (pathname.startsWith("/watch")) {
                    return parsed.searchParams.get("v");

                } else if (pathname.startsWith("/shorts/")) {
                    return pathname.split("/")[2];

                } else if (pathname.startsWith("/live/")) {
                    return pathname.split("/")[2];

                } else if (pathname.startsWith("/embed/")) {
                    return pathname.split("/")[2];
                } else if (pathname.startsWith("/")) {
                    return pathname.split("/")[1];


                }
                return null;


            }
            const videoId = extractId(urlPlacer);
            if (!videoId) {
                showError("Unable to extract video ID");

                return;
            }



            function generateEmbedURL(videoId) {
                const embedURl = `https://www.youtube.com/embed/${videoId}`;
                setIframeUrl(embedURl);
            }

            generateEmbedURL(videoId);


            async function handleTranscription() {
                const response = await fetch("http://127.0.0.1:5000/transcribe", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        url: urlPlacer
                    })
                })

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Something went wrong");
                }

                setTranscript(data.transcript);
                setTranscript(data.transcript);
                setAnalysis(data.analysis);
            };
            await handleTranscription();









        } catch (err) {
            showError("Something went wrong.");
        } finally {
            setLoading(false);

        }






    }

    function showError(message) {
        setError(message);

        setTimeout(() => {
            setError(null);
        }, 1500);
    }



    return (
        <div className="min-h-screen bg-[#07080a] flex flex-col font-[Inter,ui-sans-serif]">

            <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

            .tl-display { font-family: 'Space Grotesk', sans-serif; }
            .tl-mono { font-family: 'JetBrains Mono', monospace; }

            @keyframes tl-scan {
                0%   { transform: translateY(-100%); opacity: 0; }
                10%  { opacity: 1; }
                90%  { opacity: 1; }
                100% { transform: translateY(2000%); opacity: 0; }
            }
            .tl-scanline {
                animation: tl-scan 2.4s linear infinite;
            }

            @keyframes tl-pulse-ring {
                0%   { box-shadow: 0 0 0 0 rgba(56,189,248,0.35); }
                100% { box-shadow: 0 0 0 8px rgba(56,189,248,0); }
            }
            .tl-live-dot {
                animation: tl-pulse-ring 1.6s ease-out infinite;
            }

            .tl-scrollbar::-webkit-scrollbar { width: 6px; }
            .tl-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .tl-scrollbar::-webkit-scrollbar-thumb { background: #1c2127; border-radius: 999px; }
            .tl-scrollbar::-webkit-scrollbar-thumb:hover { background: #2a3138; }
        `}</style>


            {error && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pl-4 pr-6 py-3.5 rounded-2xl border border-red-500/30 bg-[#150708]/95 backdrop-blur-xl shadow-[0_8px_40px_-8px_rgba(239,68,68,0.5)] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-center shrink-0 w-9 h-9 rounded-full bg-red-500/15 border border-red-500/40 text-red-400 text-base font-bold">
                        ✕
                    </div>
                    <div>
                        <p className="text-red-400 text-[11px] font-bold tracking-[0.15em] uppercase tl-display">
                            Error
                        </p>
                        <p className="text-gray-200 text-sm leading-snug">
                            {error}
                        </p>
                    </div>
                </div>
            )}


            <header className="sticky top-0 z-40 border-b border-white/6 bg-[#07080a]/90 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 px-6 py-4">

                    <div className="flex items-center gap-2.5 shrink-0">
                        <div className="relative w-9 h-9 rounded-xl bg-linear-to-br from-sky-500/20 to-red-500/10 border border-sky-500/30 flex items-center justify-center">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10.5" cy="10.5" r="6.5" />
                                <line x1="15.5" y1="15.5" x2="21" y2="21" strokeLinecap="round" />
                            </svg>
                            <span className="tl-live-dot absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-400" />
                        </div>
                        <p className="tl-display text-2xl font-extrabold tracking-tight leading-none">
                            <span className="text-red-500">TRUTH</span>
                            <span className="text-sky-400">LENS</span>
                        </p>
                        <span className="hidden md:inline text-[11px] uppercase tracking-[0.18em] text-gray-500 border-l border-white/10 pl-2.5 ml-0.5">
                            Claim Verification
                        </span>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-none">
                            <svg viewBox="0 0 24 24" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10.5" cy="10.5" r="6.5" />
                                <line x1="15.5" y1="15.5" x2="21" y2="21" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                onChange={(e) => setUrlPlacer(e.target.value)}
                                value={urlPlacer}
                                placeholder="Paste a video URL to analyze..."
                                className="w-full sm:w-80 bg-white/3 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 outline-none transition-all duration-200 focus:border-sky-500/60 focus:bg-white/5 focus:ring-4 focus:ring-sky-500/10"
                            />
                        </div>

                        <button
                            disabled={loading}
                            onClick={handleUrl}
                            className={`group relative overflow-hidden shrink-0 px-6 py-2.5 rounded-xl text-sm font-bold tl-display tracking-wide transition-all duration-300
                            ${loading
                                    ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/10"
                                    : "bg-linear-to-r from-sky-500 to-cyan-400 text-black hover:scale-[1.03] active:scale-[0.98] shadow-[0_0_25px_-6px_rgba(14,165,233,0.6)]"
                                }`}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                                            <path d="M22 12A10 10 0 0 1 12 22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                                        </svg>
                                        ANALYZING
                                    </>
                                ) : (
                                    <>🔍 PROCESS</>
                                )}
                            </span>
                            {!loading && (
                                <span className="absolute inset-0 -translate-x-full bg-white/30 skew-x-12 transition-transform duration-700 group-hover:translate-x-[200%]" />
                            )}
                        </button>
                    </div>
                </div>
            </header>


            <div className="md:flex md:flex-1 gap-px bg-white/6">


                <div className="md:w-1/2 bg-[#07080a] p-5">
                    <div className="relative w-full h-full min-h-72 rounded-2xl overflow-hidden border border-white/10 bg-[#0b0c0f]">

                        {loading && (
                            <div className="tl-scanline absolute left-0 right-0 h-24 bg-linear-to-b from-transparent via-sky-500/10 to-transparent pointer-events-none z-10" />
                        )}

                        {iframeUrl && inputMode === "url" && (
                            <iframe
                                src={iframeUrl}
                                title="Video"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        )}

                        {iframeUrl && inputMode === "file" && (
                            <video controls className="w-full h-full bg-black">
                                <source src={iframeUrl} />
                                Your browser does not support this video.
                            </video>
                        )}

                        {!iframeUrl && (
                            <div className="w-full h-full min-h-72 flex flex-col items-center justify-center gap-3 text-gray-600">
                                <svg viewBox="0 0 24 24" className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                                    <rect x="2.5" y="5.5" width="19" height="13" rx="2.5" />
                                    <path d="M9.5 9l6 3-6 3V9z" fill="currentColor" stroke="none" />
                                </svg>
                                <p className="text-sm text-gray-600">Video preview will appear here</p>
                            </div>
                        )}
                    </div>
                </div>


                <div className="md:w-1/2 bg-[#07080a] p-5 flex flex-col">

                    <div className="flex gap-2 p-1 rounded-xl bg-white/3 border border-white/6 w-fit">
                        <button
                            onClick={() => setActiveTab("verdicts")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold tl-display tracking-wide transition-all duration-200 cursor-pointer
                            ${activeTab === "verdicts"
                                    ? "bg-sky-500 text-black shadow-[0_0_16px_-2px_rgba(14,165,233,0.6)]"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-white/4"
                                }`}
                        >
                            Verdicts
                        </button>
                        <button
                            onClick={() => setActiveTab("transcript")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold tl-display tracking-wide transition-all duration-200 cursor-pointer
                            ${activeTab === "transcript"
                                    ? "bg-sky-500 text-black shadow-[0_0_16px_-2px_rgba(14,165,233,0.6)]"
                                    : "text-gray-400 hover:text-gray-200 hover:bg-white/4"
                                }`}
                        >
                            Transcript
                        </button>
                    </div>

                    <div className="mt-5 h-150 overflow-y-auto tl-scrollbar pr-1">

                        {activeTab === "verdicts" && (
                            <div className="space-y-6">

                                {analysis ? (

                                    <>
                                        <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 to-transparent p-6">

                                            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-400 font-bold">
                                                Overall Verdict
                                            </p>

                                            <h2 className="mt-3 text-3xl font-bold text-white">
                                                {analysis.overallVerdict}
                                            </h2>

                                            <div className="mt-5">

                                                <p className="text-sm text-gray-400">
                                                    Confidence
                                                </p>

                                                <p className="text-xl font-bold text-white">
                                                    {analysis.confidence}%
                                                </p>

                                            </div>

                                            <div className="mt-6">

                                                <p className="text-sm text-gray-400 mb-2">
                                                    Summary
                                                </p>

                                                <p className="text-gray-300 leading-7">
                                                    {analysis.summary}
                                                </p>

                                            </div>

                                        </div>

                                        {analysis.claims?.map((claim, index) => (

                                            <div
                                                key={index}
                                                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
                                            >

                                                <div className="flex justify-between items-start gap-4">

                                                    <div>

                                                        <p className="text-xs uppercase tracking-widest text-gray-500">
                                                            Claim
                                                        </p>

                                                        <p className="mt-2 text-white leading-7">
                                                            {claim.claim}
                                                        </p>

                                                    </div>

                                                    <span className="rounded-full px-4 py-1 text-sm font-semibold bg-amber-500/15 text-amber-400">
                                                        {claim.verdict}
                                                    </span>

                                                </div>

                                                <div className="mt-5">

                                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                                        Confidence
                                                    </p>

                                                    <p className="mt-1 text-lg text-white font-bold">
                                                        {claim.confidence}%
                                                    </p>

                                                </div>

                                                <div className="mt-5">

                                                    <p className="text-xs uppercase tracking-widest text-gray-500">
                                                        Reason
                                                    </p>

                                                    <p className="mt-2 text-gray-300 leading-7">
                                                        {claim.reason}
                                                    </p>

                                                </div>

                                            </div>

                                        ))}

                                    </>

                                ) : (

                                    <div className="py-20 flex justify-center text-gray-500">
                                        Enter Url for Analysis 
                                    </div>

                                )}

                            </div>
                        )}


                        {activeTab === "transcript" && (
                            <div className="relative pl-5">
                                <span className="absolute left-1.75 top-2 bottom-2 w-px bg-white/10" />

                                {transcript && transcript.length > 0 ? (
                                    <div className="space-y-5">
                                        {transcript.map((segment) => (
                                            <div key={segment.id} className="relative">
                                                <span className="absolute -left-5 top-1.5 w-2.25 h-2.25 rounded-full bg-sky-400 ring-4 ring-[#07080a]" />
                                                <p className="tl-mono text-[11px] font-medium text-sky-400/90 tracking-wide">
                                                    {segment.start.toFixed(2)}s – {segment.end.toFixed(2)}s
                                                </p>
                                                <p className="text-gray-300 leading-7 mt-1.5 text-[15px]">
                                                    {segment.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-600 -ml-5">
                                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M4 5h16M4 12h16M4 19h10" strokeLinecap="round" />
                                        </svg>
                                        <p className="text-sm">Transcript will appear here</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

}

export default Dashboard