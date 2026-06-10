import React, { useState, useRef, useEffect } from "react";
import { ResumeState } from "../types";
import { SALARY_BENCHMARKS } from "../data";
import { Award, Brain, MessageSquare, Send, RefreshCw, Sparkles, Loader2, DollarSign, TrendingUp, HelpCircle, Briefcase } from "lucide-react";

interface AdvisorViewProps {
  resume: ResumeState;
  onRunInterviewStep: (step: string, latestAnswer: string, conversation: Array<{ q: string; a: string }>) => Promise<string>;
  onRunSalaryBenchmark: (role: string, location: string) => Promise<string>;
}

export default function AdvisorView({ resume, onRunInterviewStep, onRunSalaryBenchmark }: AdvisorViewProps) {
  // Mock Interview State
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  const [interviewHistory, setInterviewHistory] = useState<Array<{ question: string; answer: string; feedback?: string }>>([]);
  const [lastFeedback, setLastFeedback] = useState("");

  // Salary Benchmarking State
  const [benchmarkLoading, setBenchmarkLoading] = useState(false);
  const [searchRole, setSearchRole] = useState("VP of Marketing");
  const [searchLocation, setSearchLocation] = useState("San Francisco, CA");
  const [aiBenchmarkResult, setAiBenchmarkResult] = useState("");

  const interviewEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    interviewEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interviewHistory, currentQuestion, interviewLoading]);

  // Handler for Interview Start
  const handleStartInterview = async () => {
    setInterviewStarted(true);
    setInterviewLoading(true);
    setInterviewHistory([]);
    setLastFeedback("");
    try {
      const question = await onRunInterviewStep("start", "", []);
      setCurrentQuestion(question);
    } catch (err: any) {
      setCurrentQuestion("Could not initiate interview session. Please check connection or API key.");
    } finally {
      setInterviewLoading(false);
    }
  };

  // Handler for Answer submission
  const handleSubmitAnswer = async () => {
    if (!userAnswer.trim()) return;
    const ans = userAnswer;
    setUserAnswer("");
    setInterviewLoading(true);

    const historyPayload = interviewHistory.map(h => ({ q: h.question, a: h.answer }));
    
    // Add pending answer to history locally
    const updatedHistory = [...interviewHistory, { question: currentQuestion, answer: ans }];
    setInterviewHistory(updatedHistory);

    try {
      const response = await onRunInterviewStep("continue", ans, historyPayload);
      
      // The backend returns evaluation + next question.
      // We parse out or display together
      const splitIndex = response.indexOf("Question:");
      let feedback = "";
      let nextQ = response;

      if (splitIndex !== -1) {
        feedback = response.substring(0, splitIndex).trim();
        nextQ = response.substring(splitIndex).trim();
      } else {
        feedback = "Response received and evaluated.";
      }

      setLastFeedback(feedback);
      setCurrentQuestion(nextQ);

      // Attach feedback to the last item in history
      setInterviewHistory(prev => {
        const copy = [...prev];
        if (copy.length > 0) {
          copy[copy.length - 1].feedback = feedback;
        }
        return copy;
      });

    } catch (err) {
      setCurrentQuestion("Failed to fetch the next interview response.");
    } finally {
      setInterviewLoading(false);
    }
  };

  // Quick preset answers for fast demo testing
  const handlePresetAnswer = (preset: string) => {
    setUserAnswer(preset);
  };

  // Run Custom Salary Benchmark
  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBenchmarkLoading(true);
    setAiBenchmarkResult("");
    try {
      const result = await onRunSalaryBenchmark(searchRole, searchLocation);
      setAiBenchmarkResult(result);
    } catch (err: any) {
      setAiBenchmarkResult("Failed to generate custom salary benchmark recommendation. Check API key configuration.");
    } finally {
      setBenchmarkLoading(false);
    }
  };

  return (
    <div id="coaching-tab-content" className="space-y-6 pb-20">
      {/* 1. MOCK INTERVIEW CORE PANEL */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-600" />
              AI Recruiter Behavioral Simulation
            </h4>
            <p className="text-[10px] text-slate-400 mt-1">Practice executive communication loops dynamically</p>
          </div>
          {!interviewStarted ? (
            <button
              onClick={handleStartInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow shadow-blue-500/10 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> Start Interview
            </button>
          ) : (
            <button
              onClick={handleStartInterview}
              className="text-xs text-slate-500 font-semibold hover:text-blue-600 flex items-center gap-1.5 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restart
            </button>
          )}
        </div>

        {interviewStarted ? (
          <div className="space-y-4">
            {/* Conversation Stream Container */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 max-h-72 overflow-y-auto space-y-3.5 flex flex-col scrollbar-none">
              
              {interviewHistory.map((turn, i) => (
                <div key={i} className="space-y-3">
                  {/* Recruiter Question bubble */}
                  <div className="bg-white border border-slate-100 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none mr-8 text-slate-800 leading-relaxed font-medium shadow-xs">
                    <span className="font-bold text-blue-600">Interviewer: </span>
                    {turn.question.replace(/^Question:\s*/i, "")}
                  </div>

                  {/* Candidate Answer bubble */}
                  <div className="bg-blue-600 text-white text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-none ml-8 text-right font-medium self-end shadow-sm">
                    <span className="font-bold text-blue-100">You: </span>
                    {turn.answer}
                  </div>

                  {/* Recruiter Feedback bubble */}
                  {turn.feedback && (
                    <div className="bg-emerald-50/70 border border-emerald-100 text-[11px] text-emerald-800 p-3 rounded-xl font-normal max-w-[90%] flex gap-2">
                      <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Evaluation: </span>
                        {turn.feedback}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {interviewLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-100 text-slate-400 text-xs px-3.5 py-2.5 rounded-2xl rounded-tl-none shadow-xs flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    Interviewer is evaluating response metrics...
                  </div>
                </div>
              )}

              {/* Next active question prompt */}
              {!interviewLoading && currentQuestion && (
                <div className="bg-indigo-50/50 border border-indigo-150/50 text-xs px-4 py-3 rounded-2xl rounded-tl-none mr-8 text-slate-800 font-semibold leading-relaxed shadow-sm animate-fadeIn">
                  <span className="text-indigo-700 font-bold block mb-1">🗣 Active Recruiter Question:</span>
                  {currentQuestion.replace(/^Question:\s*/i, "")}
                </div>
              )}

              <div ref={interviewEndRef} />
            </div>

            {/* Answer Submission Input Panel */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type your strategic verbal response..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitAnswer()}
                  className="flex-grow bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={handleSubmitAnswer}
                  disabled={interviewLoading || !userAnswer.trim()}
                  className="w-11 h-11 bg-blue-600 disabled:bg-slate-300 text-white rounded-2xl flex items-center justify-center shadow-lg hover:bg-blue-700 transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Bullet Presets / Quick Sandbox shortcuts for Demo flow */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[10px] text-slate-400 font-bold shrink-0 uppercase tracking-widest mr-1">Demo sandbox tags:</span>
                <button
                  onClick={() => handlePresetAnswer("I managed a multi-channel deployment exceeding $50M annually with flat metrics")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-xl transition"
                >
                  $50M Portfolio Scale
                </button>
                <button
                  onClick={() => handlePresetAnswer("I launched a patented GEO/AEO response model framework that secured 25% organic shares")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-xl transition"
                >
                  GEO/AEO framework
                </button>
                <button
                  onClick={() => handlePresetAnswer("I scaled the co-founding core team from 4 specialists to over 80 within 24 months")}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] px-2.5 py-1 rounded-xl transition"
                >
                  Operational scaling
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-6 text-center space-y-3">
            <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
            <h5 className="font-bold text-slate-800 text-xs">Simulated Recruiter Chamber is Empty</h5>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Click "Start Interview" above to trigger a direct behavioral critique loop based on your latest credentials.</p>
          </div>
        )}
      </div>

      {/* 2. SALARY BENCHMARK PANEL */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-5">
        <div>
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-600" />
            Executive Compensation Benchmarks
          </h4>
          <p className="text-[10px] text-slate-400 mt-1">Cross-reference target Bay Area markets & request dynamic estimations</p>
        </div>

        {/* Existing Market Estimates */}
        <div className="overflow-x-auto rounded-2xl border border-slate-150">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 text-[10px] uppercase tracking-wider">
                <th className="p-3">Designation</th>
                <th className="p-3">Geography</th>
                <th className="p-3">Base Range</th>
                <th className="p-3">Equity Grant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 font-medium text-slate-700">
              {SALARY_BENCHMARKS.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-900">{item.role}</td>
                  <td className="p-3 text-slate-500">{item.location}</td>
                  <td className="p-3">{item.range}</td>
                  <td className="p-3">{item.equity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Custom AI Estimator Form */}
        <form onSubmit={handleSalarySubmit} className="bg-slate-50/60 border border-slate-150 p-4 rounded-2xl space-y-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            Dynamic Compensation Estimator
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Target Role (e.g. CMO)"
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Location (e.g. New York)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={benchmarkLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1.5 transition shadow"
          >
            {benchmarkLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Calculate Custom Comp & Levers
          </button>
        </form>

        {/* Result Area */}
        {aiBenchmarkResult && (
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 border border-slate-800 text-xs leading-relaxed font-mono whitespace-pre-wrap">
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1.5">
              Gemini Dynamic Assessment Report
            </div>
            {aiBenchmarkResult}
          </div>
        )}
      </div>
    </div>
  );
}
