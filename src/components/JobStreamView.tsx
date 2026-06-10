import React, { useState } from "react";
import { Job, ResumeState } from "../types";
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2, ChevronRight, Wand2, Sparkles, Send, Loader2, FileText, AlertCircle } from "lucide-react";

interface JobStreamViewProps {
  jobs: Job[];
  resume: ResumeState;
  onSelectFixResume: () => void;
  onSearchJobs: (query: string) => Promise<void>;
  isSearching: boolean;
  onApplyForJob: (job: Job) => void;
  onGenerateCoverLetter: (job: Job) => Promise<string>;
}

export default function JobStreamView({
  jobs,
  resume,
  onSelectFixResume,
  onSearchJobs,
  isSearching,
  onApplyForJob,
  onGenerateCoverLetter,
}: JobStreamViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobForLetter, setSelectedJobForLetter] = useState<Job | null>(null);
  const [generatedLetter, setGeneratedLetter] = useState("");
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [letterError, setLetterError] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchJobs(searchQuery);
    }
  };

  const handleCreateLetter = async (job: Job) => {
    setSelectedJobForLetter(job);
    setGeneratedLetter("");
    setIsGeneratingLetter(true);
    setLetterError("");
    try {
      const letter = await onGenerateCoverLetter(job);
      setGeneratedLetter(letter);
    } catch (err: any) {
      setLetterError(err.message || "Failed to generate Cover Letter.");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  return (
    <div id="job-stream-tab-content" className="space-y-6 pb-20">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2.5">
        <input
          id="job-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for roles (e.g. VP Marketing, growth architect)..."
          className="flex-grow bg-white border border-slate-200/80 rounded-2xl px-4 py-3 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
        />
        <button
          id="job-search-submit"
          type="submit"
          disabled={isSearching}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold text-sm px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-500/15 active:scale-95 transition-all"
        >
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          Match Jobs
        </button>
      </form>

      <div className="flex justify-between items-center bg-transparent px-1">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {isSearching ? "Re-aligning Neural Channels..." : "Hyper-Targeted Opportunities"}
        </h3>
        <span className="text-[11px] text-blue-600 font-bold bg-blue-50/80 border border-blue-100/50 px-2.5 py-1 rounded-lg">
          {jobs.length} Match{jobs.length !== 1 ? "es" : ""} Found
        </span>
      </div>

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-12 px-6 bg-white border border-slate-100/80 rounded-3xl space-y-4 shadow-sm">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <div className="text-center">
            <h4 className="font-bold text-slate-900 text-sm">Synthesizing Active Job Markets...</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">Gemini AI is parsing structural experience markers to target precise digital capabilities.</p>
          </div>
        </div>
      )}

      {!isSearching && jobs.length === 0 && (
        <div className="text-center py-12 px-6 bg-white border border-slate-100/80 rounded-3xl shadow-sm">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">No direct opportunities matches found</h4>
          <p className="text-xs text-slate-500 mt-1">Try querying different executive keywords in the tracker above.</p>
        </div>
      )}

      {/* Recommended Jobs Loop */}
      {!isSearching && jobs.map((job) => (
        <div
          id={`job-card-${job.id}`}
          key={job.id}
          className="bg-white border border-slate-100/80 rounded-3xl shadow-sm overflow-hidden border-l-4 border-l-blue-600 hover:shadow-md transition-all active:translate-y-0 translate-y-[-1px] duration-300"
        >
          <div className="p-5 md:p-6 bg-gradient-to-b from-slate-50/50 to-transparent">
            {/* Header / Badges */}
            <div className="flex justify-between items-start gap-3">
              <div>
                <h4 className="font-bold text-slate-900 text-base flex items-center gap-1.5 leading-snug">
                  {job.title}
                </h4>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {job.company} &bull; <MapPin className="inline w-3 h-3 text-slate-400 mb-0.5" /> {job.location}
                </p>
              </div>
              <div className="flex flex-col items-end shrink-0">
                <div className={`px-2.5 py-1 rounded-xl text-xs font-bold shadow-sm border ${
                  job.matchScore >= 90
                    ? "bg-emerald-50 text-emerald-700 border-emerald-100/80"
                    : "bg-blue-50 text-blue-700 border-blue-100/80"
                }`}>
                  {job.matchScore}% Match
                </div>
                {job.postedTime && (
                  <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {job.postedTime}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 mt-3 leading-relaxed font-normal">
              {job.description}
            </p>

            {job.salaryRange && (
              <div className="flex items-center gap-1 text-slate-500 text-xs mt-3.5 font-medium bg-slate-50 inline-flex px-2.5 py-1 rounded-lg border border-slate-100/50">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" /> {job.salaryRange}
              </div>
            )}
          </div>

          {/* Job Critique / Adjustments Panel */}
          <div className="bg-slate-50/70 border-t border-b border-slate-100/80 p-5 space-y-3 mx-5 my-1.5 rounded-2xl">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Targeted Resume Adjustments Needed
            </div>
            
            <div className="text-xs text-slate-700 space-y-2 font-medium">
              {job.adjustmentsNeeded.map((adj, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">&bull;</span>
                  <span>{adj}</span>
                </div>
              ))}
            </div>

            <button
              onClick={onSelectFixResume}
              className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition"
            >
              Fix Resume For This Job <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Action Footer */}
          <div className="p-5 md:p-6 pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => onApplyForJob(job)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-3.5 rounded-2xl shadow-lg shadow-blue-500/15 hover:shadow-xl hover:shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" /> Submit Tailored Profile
            </button>
            <button
              onClick={() => handleCreateLetter(job)}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-semibold px-4 py-3.5 rounded-2xl transition hover:border-slate-300 flex items-center justify-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-blue-600" /> Tailor Cover Letter
            </button>
          </div>
        </div>
      ))}

      {/* Cover Letter Modal/Overlay Drawer */}
      {selectedJobForLetter && (
        <div id="cover-letter-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-slate-100/80 overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100/80 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Tailored Cover Letter</h3>
                <p className="text-xs text-slate-500 mt-0.5">For {selectedJobForLetter.title} at {selectedJobForLetter.company}</p>
              </div>
              <button
                onClick={() => setSelectedJobForLetter(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow space-y-4">
              {isGeneratingLetter && (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  <p className="text-xs text-slate-500 font-semibold">Gemini AI is drafting custom executive arguments...</p>
                </div>
              )}

              {letterError && (
                <div className="p-4 bg-red-50 text-red-700 rounded-2xl text-xs font-medium border border-red-100 flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {letterError}
                </div>
              )}

              {generatedLetter && (
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap select-all">
                  {generatedLetter}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/80 flex justify-between items-center gap-3">
              <span className="text-[10px] text-slate-400 font-medium">Click text to select all for custom clipboard copies</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLetter);
                    alert("Cover letter text successfully copied to clipboard.");
                  }}
                  disabled={!generatedLetter}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition shadow"
                >
                  Copy Letter
                </button>
                <button
                  onClick={() => setSelectedJobForLetter(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
