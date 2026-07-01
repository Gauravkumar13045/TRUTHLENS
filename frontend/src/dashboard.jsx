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
                showError("Please provide a URL or upload a file.");

                return;
            }
            if (selectedFile) {

                const preview = URL.createObjectURL(selectedFile);
                setIframeUrl(preview);
                setInputMode("file");


                console.log("Process uploaded file");

                return;

            } else {
                setInputMode("url");
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
        <div className="min-h-screen bg-black flex flex-col">



            {error && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-xl border border-red-500/60 bg-linear-to-r from-red-950 via-red-900 to-red-950 backdrop-blur-lg shadow-[0_0_25px_rgba(239,68,68,0.45)] animate-in fade-in slide-in-from-top duration-300">

                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white text-xl font-bold">
                        ✕
                    </div>

                    <div>
                        <h2 className="text-red-300 font-bold tracking-wide">
                            Error
                        </h2>

                        <p className="text-white text-sm">
                            {error}
                        </p>
                    </div>

                </div>
            )}



            <div className="h-16 border border-gray-800 flex items-center px-6">
                <p className="text-red-500 text-xl font-extrabold">TRUTH<span className="text-sky-500 text-lg">LENS</span></p>
                <div className="ml-auto  items-center gap-3 flex-wrap flex">
                    <input type="text" onChange={(e) => setUrlPlacer(e.target.value)} value={urlPlacer} className="border  border-sky-500 rounded-lg cursor-pointer placeholder-gray-400 pl-2 p-1 text-gray-300  focus:border-sky-500" placeholder="Enter URL..."></input>
                    <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="text-gray-300 border border-sky-500  cursor-pointer bg-black  rounded-lg  ml-5 pl-2 p-1" accept=".mp3,.wav,.m4a,.aac,.flac,.ogg,.mp4,.mov,.mkv,.webm"></input>
                    <button
                        disabled={loading}
                        onClick={handleUrl}
                        className={`group  relative overflow-hidden px-6 py-2.5 ml-3 rounded-xl font-bold tracking-wide transition-all duration-300

                               ${loading
                                ? "bg-gray-700 cursor-not-allowed"
                                : "bg-linear-to-r from-sky-500 to-cyan-400 hover:scale-105 shadow-[0_0_20px_rgba(14,165,233,0.35)]"
                            }
                                `}><span className="relative z-10 flex items-center gap-2">

                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"> <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                                        <path d="M22 12A10 10 0 0 1 12 22" stroke="currentColor" strokeWidth="3" /></svg>

                                    ANALYZING...
                                </>
                            ) : (
                                <>
                                    🔍 PROCESS
                                </>
                            )}

                        </span>
                        <span className="absolute inset-0 -translate-x-full bg-white/25 skew-x-12 transition-transform duration-700 group-hover:translate-x-[200%]"></span>
                    </button>


                </div>


            </div>


            <div className="md:flex md:flex-1 ">

                <div className="md:w-1/2 border border-gray-800 p-4">

                    {iframeUrl && inputMode === "url" && (
                        <iframe
                            src={iframeUrl}
                            title="Video"
                            allowFullScreen
                            className="rounded-xl w-full h-full"
                        />
                    )}

                    {iframeUrl && inputMode === "file" && (
                        <video
                            controls
                            className="w-full h-full rounded-xl"
                        >
                            <source src={iframeUrl} />
                            Your browser does not support this video.
                        </video>
                    )}

                </div>

                <div className="md:w-1/2 border border-gray-800 p-4">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setActiveTab("verdicts")}
                            className={`px-4 py-2 rounded-lg border border-sky-500 text-sm transition-all duration-300 cursor-pointer
                                     ${activeTab === "verdicts"
                                    ? "bg-sky-500 text-black font-semibold"
                                    : "bg-transparent text-white/90 hover:bg-sky-500 hover:text-black"
                                }`}
                        >
                            Verdicts
                        </button>

                        <button
                            onClick={() => setActiveTab("transcript")}
                            className={`px-4 py-2 rounded-lg border border-sky-500 text-sm transition-all duration-300 cursor-pointer
                                     ${activeTab === "transcript"
                                    ? "bg-sky-500 text-black font-semibold"
                                    : "bg-transparent text-white/90 hover:bg-sky-500 hover:text-black"
                                }`}
                        >
                            Transcript
                        </button>
                    </div>


                    <div>
                        {activeTab === "verdicts" && (
                            <div className="  mt-5 h-150 p-5 overflow-x-scroll scrollbar-none ">
                                <div>
                                    <p className="text-yellow-500"> Kisan keval annadata nahi urjadata banega,  heye ouri sarkar ki soch hai.  Aar isi liye,  abhme august maine me,  Toyota company ki gadi wo ko launch kar raho.  Aap ko pata hoga kemri kar ke gadi thi.  O innovae,  Aap sab gadi aak kisan ho ne thayar keve ihthanal prachalegi.  Saad prasne ihthanal,  40% dijli,  uska agar average pakla jai ga,  to pandra rupe litre petrol ka bhao hoga,  janata ka bhao hoga,  kisan urjadata banega,  desh ka pradushan ka mhoga,  import ka mhoga,  sola lock crore rupe ka import hai,  uske bhaiye hai paisa kisan ho ke ghar me jai ga,  gao sambhrut da sambhan na banege,  gao ke kisan ke betu ko rojgaar me lega. </p>
                                </div>

                            </div>
                        )}

                        {activeTab === "transcript" && (
                            <div className="space-y-4 mt-5 h-150 p-5 overflow-x-scroll scrollbar-none ">
                                {transcript.map((segment) => (
                                    <div
                                        key={segment.id}
                                        className="border-b border-zinc-700 pb-3"
                                    >
                                        <p className="text-sky-400 text-sm font-medium">
                                            {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
                                        </p>

                                        <p className="text-gray-300 leading-7 mt-2">
                                            {segment.text}
                                        </p>
                                    </div>
                                ))}
                            </div>

                        )}
                    </div>
                </div>
            </div>
        </div>

    );

}

export default Dashboard