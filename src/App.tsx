import React, { useState, useEffect } from "react";
import { Job, ResumeState, Message, CritiqueReport } from "./types";
import { INITIAL_RESUME, INITIAL_JOBS } from "./data";
import LandingView from "./components/LandingView";
import JobStreamView from "./components/JobStreamView";
import ResumeEngineView from "./components/ResumeEngineView";
import AdvisorView from "./components/AdvisorView";
import { 
  Wand2, 
  RotateCw,
  RotateCcw,
  ArrowLeft,
  Wifi, 
  Signal, 
  Battery, 
  ChevronRight, 
  Paperclip, 
  Send, 
  Loader2, 
  BookOpen, 
  Briefcase, 
  FileText, 
  UserSquare,
  MessageCircle,
  Clock
} from "lucide-react";

export default function App() {
  // Navigation & Screen Control
  const [activeTab, setActiveTab] = useState<"search" | "resume" | "advice" | null>(null);

  // Core Data State
  const [resume, setResume] = useState<ResumeState>(INITIAL_RESUME);
  const [jobs, setJobs] = useState<Job[]>(INITIAL_JOBS);
  const [critique, setCritique] = useState<CritiqueReport | null>({
    overallScore: 84,
    strengths: [
      "Outstanding quantified metrics ($50M+ portfolio size, organic growth jumps).",
      "Very advanced knowledge modeling (GEO/AEO framework) listed in core operations.",
      "Clear directorship experience scaling media co-founding divisions from 4 to 80+."
    ],
    gaps: [
      "Specific B2B enterprise platform launches are not explicitly detailed.",
      "Requires clearer delineation on generative AI content workflow automations.",
      "Relatively generic wording surrounding standard Apex cross-departmental alignment."
    ],
    actionItems: [
      "Inject a dedicated bullet showcasing B2B SaaS conversion playbooks.",
      "Explicitly include 'Generative AI content pipelines' within recent CDI sections.",
      "Utilize active verbs for Apex cross-department partnerships (e.g., 'orchestrated' to 'led')."
    ]
  });

  // Loading States
  const [isSearchingJobs, setIsSearchingJobs] = useState(false);
  const [isLoadingCritique, setIsLoadingCritique] = useState(false);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);

  // Chat/Universal Agent Console State
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am your career pilot assistant. Paste coordinates, upload resume vectors, or ask me to draft cover letters and run mock behavioral interview modules based on your profile.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Handle Dynamic Clock
  const [currentTime, setCurrentTime] = useState("9:41");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync assistant with dynamic resume context shifts
  const triggerAutoSystemMessage = (title: string) => {
    const sysMsg: Message = {
      id: `sys-${Date.now()}`,
      role: "assistant",
      content: `System Warning: Resume vector updated to focus on: "${title}". Real-time critiques, mock questions, and matching job feeds re-aligning.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSystemStatus: true
    };
    setMessages(prev => [...prev, sysMsg]);
  };

  // API Call: Job Search matching via Gemini
  const handleSearchJobs = async (queryText: string) => {
    setIsSearchingJobs(true);
    try {
      const response = await fetch("/api/career/job-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText, resumeContext: resume })
      });
      const data = await response.json();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(err.message || "Failed to search opportunities due to connection limits.");
    } finally {
      setIsSearchingJobs(false);
    }
  };

  // API Call: Dynamic Resume Critique
  const handleRefreshCritique = async () => {
    setIsLoadingCritique(true);
    try {
      const response = await fetch("/api/career/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume })
      });
      const data = await response.json();
      if (data.success && data.report) {
        setCritique(data.report);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert(err.message || "Resume audit server limit exceeded.");
    } finally {
      setIsLoadingCritique(false);
    }
  };

  // API Call: Cover Letter tailorer generator
  const handleGenerateCoverLetter = async (targetJob: Job): Promise<string> => {
    const response = await fetch("/api/career/generate-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        documentType: "cover-letter",
        resume,
        job: targetJob
      })
    });
    const data = await response.json();
    if (data.success && data.content) {
      return data.content;
    }
    throw new Error(data.error || "Failed to generate Cover Letter.");
  };

  // API Call: Playable Mock Interview Step
  const handleRunInterviewStep = async (
    step: string, 
    latestAnswer: string, 
    conversation: Array<{ q: string; a: string }>
  ): Promise<string> => {
    const response = await fetch("/api/career/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle: resume.currentTitle,
        company: "Target Firm",
        step,
        userLatestAnswer: latestAnswer,
        previousConversation: conversation
      })
    });
    const data = await response.json();
    if (data.success && data.content) {
      return data.content;
    }
    throw new Error(data.error || "Interview engine error.");
  };

  // API Call: Salary Benchmarking
  const handleRunSalaryBenchmark = async (role: string, location: string): Promise<string> => {
    const response = await fetch("/api/career/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resumeContext: resume,
        messages: [
          {
            role: "user",
            content: `Estimate full custom professional compensation details, equity projections, and strategic negotiation points for the title of "${role}" in the geographic region of "${location}". Rely on 2026 executive tech market standards.`
          }
        ]
      })
    });
    const data = await response.json();
    if (data.success && data.content) {
      return data.content;
    }
    throw new Error(data.error || "Salary benchmark unavailable.");
  };

  // Parsing pasted raw texts or client documents
  const handleFileUpload = (content: string, name: string) => {
    setIsAssistantThinking(true);
    
    // Quick prompt to let Gemini pull unstructured text into our strict ResumeState
    fetch("/api/career/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: `Read this raw text resume and extract standard metadata into a compact JSON format. Return ONLY a valid JSON matching this schema:
{
  "name": "string (their name)",
  "currentTitle": "string",
  "currentCompany": "string",
  "email": "string",
  "skills": ["string", "string"],
  "experience": [{"role": "string", "company": "string", "period": "string", "description": ["string"]}]
}

Raw resume draft:
${content}`
          }
        ]
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.content) {
        try {
          // Clean output if any markdown wrapper is returned
          let rawJson = data.content.trim();
          if (rawJson.startsWith("```")) {
            rawJson = rawJson.replace(/^```json/i, "").replace(/```$/, "").trim();
          }
          const parsedResume = JSON.parse(rawJson);
          setResume(parsedResume);
          triggerAutoSystemMessage(parsedResume.currentTitle);
          setActiveTab("resume");
        } catch (e) {
          // Fallback parser if JSON fails
          setResume(prev => ({
            ...prev,
            name: "Uploaded Candidate",
            about: content.substring(0, 300) + "..."
          }));
          setActiveTab("resume");
        }
      }
    })
    .catch(() => {
      alert("Failed to parse document text seamlessly.");
    })
    .finally(() => {
      setIsAssistantThinking(false);
    });
  };

  // Submit Assistant Query in bottom chat input
  const handleSubmitChat = async () => {
    const text = chatInput.trim();
    if (!text) return;

    setChatInput("");
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs);
    setIsAssistantThinking(true);

    try {
      const response = await fetch("/api/career/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMsgs,
          resumeContext: resume
        })
      });
      const data = await response.json();
      if (data.success && data.content) {
        setMessages(prev => [...prev, {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: data.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: "Warning: Gemini API server limits encountered. Confirm GEMINI_API_KEY environment variable is configured in Setting panel.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsAssistantThinking(false);
    }
  };

  // Handle Preset Helper Chips from lower deck
  const handleChipClick = (chipText: string) => {
    if (chipText.includes("Fast-Track") || chipText.includes("Bay Area")) {
      setActiveTab("search");
      handleSearchJobs(chipText);
    } else if (chipText.includes("Autopilot") || chipText.includes("Cover Letter")) {
      setActiveTab("resume");
      setChatInput("Can you generate an executive summary cover letter argument based on CDI Media?");
    } else if (chipText.includes("Comp Scales") || chipText.includes("Behavioral")) {
      setActiveTab("advice");
    } else {
      setChatInput(chipText);
    }
  };

  const handleResetToHome = () => {
    setActiveTab(null);
    setResume(INITIAL_RESUME);
    setJobs(INITIAL_JOBS);
  };

  // Display helper chips depending on what tab is visible
  const getHelperChips = () => {
    if (activeTab === "search") {
      return ["⚡ Remote Director Roles", "📍 Bay Area Operations", "📊 Technology Executives"];
    }
    if (activeTab === "resume") {
      return ["✍️ Autopilot Match Tailor", "📝 Draft Target Cover Letter", "🔄 Reset Context Vector"];
    }
    if (activeTab === "advice") {
      return ["🎤 Practice Behavioral Prompts", "💰 Silicon Valley Comp Scales", "💪 Master Salary Negotiation"];
    }
    return ["🔍 Find High-Paying CMO Jobs", "📄 Audit CDI Media Resume", "🗣 Mock Interview Help"];
  };

  return (
    <div id="career-copilot-root-container" className="min-h-screen bg-slate-950 flex items-center justify-center py-4 px-2 select-none md:select-text">
      {/* Sleek simulated fluid container wrapper */}
      <div id="phone-frame-wrapper" className="w-full max-w-[412px] h-[846px] bg-[#f8fafc] border-[12px] border-slate-900 rounded-[44px] flex flex-col relative overflow-hidden shadow-2xl my-2">
        
        {/* Dynamic header signal status line */}
        <div className="px-6 pt-3 pb-2 bg-white flex justify-between items-center text-xs text-slate-800 font-semibold z-30 select-none">
          <div>{currentTime}</div>
          {/* Simulated hardware camera pill */}
          <div className="w-24 h-4 bg-black rounded-full absolute left-1/2 transform -translate-x-1/2 top-2 z-40" />
          <div className="flex items-center gap-1.5">
            <Signal className="w-3.5 h-3.5 text-slate-800" />
            <Wifi className="w-3.5 h-3.5 text-slate-800" />
            <Battery className="w-4 h-4 text-slate-950" />
          </div>
        </div>

        {/* Brand visual header navigation */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 z-30 shadow-sm shadow-slate-100/50">
          <div onClick={handleResetToHome} className="flex items-center gap-3 cursor-pointer select-none">
            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-sm tracking-tight">Career Copilot</h1>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse" />
                Context Engine Linked
              </div>
            </div>
          </div>
          <button
            onClick={handleResetToHome}
            title={activeTab !== null ? "Back to front page" : "Reset to home screen"}
            className="w-8 h-8 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer border border-slate-100/50"
          >
            {activeTab !== null ? (
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            ) : (
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>

        {/* Global tab options */}
        <div className="flex bg-white border-b border-slate-100 text-xs font-semibold text-slate-400 relative z-30 select-none">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer ${
              activeTab === "search" ? "text-blue-600 font-bold" : "hover:text-slate-600"
            }`}
          >
            Job Stream
          </button>
          <button
            onClick={() => setActiveTab("resume")}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer ${
              activeTab === "resume" ? "text-blue-600 font-bold" : "hover:text-slate-600"
            }`}
          >
            Resume Engine
          </button>
          <button
            onClick={() => setActiveTab("advice")}
            className={`flex-1 py-3.5 text-center transition-colors cursor-pointer ${
              activeTab === "advice" ? "text-blue-600 font-bold" : "hover:text-slate-600"
            }`}
          >
            AI Advisor
          </button>
          <div 
            className="tab-indicator" 
            style={{ 
              left: activeTab === "search" || activeTab === null ? "4%" : activeTab === "resume" ? "37%" : "70%", 
              width: "25.3%",
              opacity: activeTab === null ? 0 : 1
            }} 
          />
        </div>

        {/* Active main layouts */}
        <div 
          id="canvas-main-scrollable-body" 
          className={`flex-grow overflow-y-auto select-text scrollbar-none flex flex-col ${
            activeTab === null ? "p-0 bg-white" : "p-4 bg-[#f8fafc]"
          }`}
        >
          {activeTab === null && (
            <LandingView
              resume={resume}
              onGoToJobSearch={() => setActiveTab("search")}
              onGoToResume={() => setActiveTab("resume")}
            />
          )}

          {activeTab === "search" && (
            <JobStreamView
              jobs={jobs}
              resume={resume}
              onSelectFixResume={() => setActiveTab("resume")}
              onSearchJobs={handleSearchJobs}
              isSearching={isSearchingJobs}
              onApplyForJob={(appliedJob) => {
                alert(`Tailored application package generated for: ${appliedJob.title} at ${appliedJob.company}! Your customized CDI Media experiences have been attached.`);
              }}
              onGenerateCoverLetter={handleGenerateCoverLetter}
            />
          )}

          {activeTab === "resume" && (
            <ResumeEngineView
              resume={resume}
              critique={critique}
              isLoadingCritique={isLoadingCritique}
              onUpdateResume={(updatedRes) => {
                setResume(updatedRes);
                // Trigger quick dynamic update warning
              }}
              onRefreshCritique={handleRefreshCritique}
              onFileUpload={handleFileUpload}
            />
          )}

          {activeTab === "advice" && (
            <AdvisorView
              resume={resume}
              onRunInterviewStep={handleRunInterviewStep}
              onRunSalaryBenchmark={handleRunSalaryBenchmark}
            />
          )}
        </div>

        {/* Universal AI Agent Chat Lower Deck */}
        <div className="bg-white border-t border-slate-100 p-3.5 space-y-3 z-30 shadow-lg">
          {/* Scrollable quick help micro chips */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none flex-nowrap shrink-0">
            {getHelperChips().map((chip) => (
              <button
                key={chip}
                onClick={() => handleChipClick(chip)}
                className="text-[10px] font-bold text-slate-500 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 border border-slate-205 py-1.5 px-3 rounded-full whitespace-nowrap transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Omnibar inputs */}
          <div className="flex items-center gap-2.5">
            <div className="flex-grow bg-slate-50 border border-slate-200/80 rounded-2xl px-3.5 py-3.5 flex items-center gap-2.5 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-md focus-within:shadow-blue-500/5 transition-all">
              <label 
                htmlFor="chat-file-uploader" 
                className="cursor-pointer text-slate-400 hover:text-blue-600 transition-colors p-0.5"
                title="Integrate raw resume text files directly"
              >
                <Paperclip className="w-4 h-4" />
                <input
                  id="chat-file-uploader"
                  type="file"
                  accept=".txt,.md,.json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (fileEvent) => {
                        const contentText = fileEvent.target?.result as string;
                        handleFileUpload(contentText, file.name);
                      };
                      reader.readAsText(file);
                    }
                  }}
                />
              </label>
              <input
                id="omnibar-chat-input"
                type="text"
                placeholder="Ask Career Copilot to critique or write anything..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitChat()}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleSubmitChat}
              disabled={isAssistantThinking || !chatInput.trim()}
              className="w-11 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/15 active:scale-95 transition-all shrink-0"
            >
              {isAssistantThinking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
