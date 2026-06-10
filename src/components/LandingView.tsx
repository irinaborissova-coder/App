import React from "react";
import { ResumeState } from "../types";
import { Briefcase, FileText, Search } from "lucide-react";

interface LandingViewProps {
  resume: ResumeState;
  onGoToJobSearch: () => void;
  onGoToResume: () => void;
}

export default function LandingView({ resume, onGoToJobSearch, onGoToResume }: LandingViewProps) {
  return (
    <div id="front-page" className="flex-1 flex flex-col items-center justify-center p-6 bg-white text-center h-full animate-fadeIn">
      {/* Icon frame */}
      <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30">
        <Briefcase className="w-8 h-8 text-white" />
      </div>
      
      {/* Headings */}
      <h1 id="landing-title" className="text-3xl font-bold text-slate-900 mb-2">Career Copilot</h1>
      <p className="text-slate-650 text-lg mb-10 font-medium">What would you like to do first?</p>
      
      {/* Action Buttons */}
      <button 
        id="landing-search-btn"
        onClick={onGoToJobSearch} 
        className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl text-lg font-semibold mb-4 flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
      >
        <Search className="w-5 h-5" />
        Job Search
      </button>
      
      <button 
        id="landing-resume-btn"
        onClick={onGoToResume} 
        className="w-full max-w-xs bg-white border-2 border-slate-200 hover:border-blue-600 hover:text-blue-600 text-slate-700 py-4 rounded-2xl text-lg font-semibold flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
      >
        <FileText className="w-5 h-5 text-blue-600" />
        Work on Resume
      </button>
      
      {/* Footnote */}
      <p className="text-xs text-slate-400 mt-8 font-medium">Or tap the tabs above anytime</p>
    </div>
  );
}

