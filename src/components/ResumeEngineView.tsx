import React, { useState } from "react";
import { ResumeState, CritiqueReport } from "../types";
import { User, Mail, Plus, Trash2, ShieldCheck, HelpCircle, Loader2, RefreshCw, Upload, FileText, CheckCircle } from "lucide-react";

interface ResumeEngineViewProps {
  resume: ResumeState;
  critique: CritiqueReport | null;
  isLoadingCritique: boolean;
  onUpdateResume: (updated: ResumeState) => void;
  onRefreshCritique: () => Promise<void>;
  onFileUpload: (text: string, fileName: string) => void;
}

export default function ResumeEngineView({
  resume,
  critique,
  isLoadingCritique,
  onUpdateResume,
  onRefreshCritique,
  onFileUpload,
}: ResumeEngineViewProps) {
  const [newSkillText, setNewSkillText] = useState("");
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [editedName, setEditedName] = useState(resume.name);
  const [editedTitle, setEditedTitle] = useState(resume.currentTitle);
  const [rawResumePaste, setRawResumePaste] = useState("");
  const [isPasting, setIsPasting] = useState(false);

  const handleAddSkill = (skill: string) => {
    const trimmed = skill.trim();
    if (trimmed && !resume.skills.includes(trimmed)) {
      const updatedSkills = [...resume.skills, trimmed];
      onUpdateResume({ ...resume, skills: updatedSkills });
      setNewSkillText("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = resume.skills.filter((s) => s !== skillToRemove);
    onUpdateResume({ ...resume, skills: updatedSkills });
  };

  const handleSaveMetadata = () => {
    onUpdateResume({
      ...resume,
      name: editedName,
      currentTitle: editedTitle,
    });
    setIsEditingMetadata(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      onFileUpload(text, file.name);
    };
    reader.readAsText(file);
  };

  const handlePasteSubmit = () => {
    if (rawResumePaste.trim()) {
      onFileUpload(rawResumePaste, "pasted_document.txt");
      setRawResumePaste("");
      setIsPasting(false);
    }
  };

  return (
    <div id="resume-tab-content" className="space-y-6 pb-20">
      {/* File Upload / Import Panel */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Upload className="w-4 h-4 text-blue-600" />
            Upload Experience & Resume Context
          </h4>
          <button
            onClick={() => setIsPasting(!isPasting)}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            {isPasting ? "Cancel Paste" : "Paste Raw Text"}
          </button>
        </div>

        {isPasting ? (
          <div className="space-y-3">
            <textarea
              className="w-full h-32 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Paste your resume, LinkedIn summary, or bio metrics..."
              value={rawResumePaste}
              onChange={(e) => setRawResumePaste(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsPasting(false)}
                className="bg-white border border-slate-200 text-slate-700 font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handlePasteSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg shadow-sm transition"
              >
                Incorporate Text
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-5 hover:bg-slate-50 transition-all cursor-pointer relative">
            <input
              type="file"
              accept=".txt,.json,.md,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="text-center space-y-1.5">
              <FileText className="w-7 h-7 text-blue-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700">Drag or select a document file (.txt, .md, .docx)</p>
              <p className="text-[10px] text-slate-400">System vectorizes context parameters instantly</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Profile View */}
      <div className="bg-white border border-slate-100/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-5">
          {isEditingMetadata ? (
            <div className="space-y-3 w-full max-w-xs">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Full Name"
              />
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Target Job / Title"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={handleSaveMetadata}
                  className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingMetadata(false)}
                  className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="font-bold text-slate-900 text-lg leading-tight flex items-center gap-2">
                {resume.name}
                <button
                  onClick={() => {
                    setEditedName(resume.name);
                    setEditedTitle(resume.currentTitle);
                    setIsEditingMetadata(true);
                  }}
                  className="text-xs text-blue-600 hover:underline font-normal"
                >
                  (Edit)
                </button>
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {resume.currentTitle} &bull; {resume.currentCompany}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-medium">
                <Mail className="w-3 h-3 text-slate-300" /> {resume.email}
              </div>
            </div>
          )}

          <div className="text-right shrink-0">
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {critique ? `${critique.overallScore}% Complete` : "92% Real-time"}
            </div>
          </div>
        </div>

        {/* Skills Tag Cloud */}
        <div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3.5">
            💡 Primary Capability Map
          </div>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-150 text-xs px-3.5 py-1.5 rounded-2xl font-medium transition cursor-default group"
              >
                {skill}
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-0.5 rounded"
                  title={`Remove ${skill}`}
                >
                  &times;
                </button>
              </span>
            ))}

            {/* Quick-add preset chips */}
            {!resume.skills.includes("Generative AI Strategy") && (
              <button
                onClick={() => handleAddSkill("Generative AI Strategy")}
                className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/80 text-xs px-3.5 py-1.5 rounded-2xl font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                + Generative AI Strategy
              </button>
            )}

            {!resume.skills.includes("B2B SaaS GTM") && (
              <button
                onClick={() => handleAddSkill("B2B SaaS GTM")}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 text-xs px-3.5 py-1.5 rounded-2xl font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                + B2B SaaS GTM
              </button>
            )}
          </div>

          {/* Manual Tag Insertion */}
          <div className="flex gap-2 mt-4 max-w-xs">
            <input
              type="text"
              placeholder="Add other competency..."
              value={newSkillText}
              onChange={(e) => setNewSkillText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddSkill(newSkillText);
                }
              }}
              className="flex-grow bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => handleAddSkill(newSkillText)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-3 flex items-center transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Critique Report from Gemini */}
        <div className="border-t border-slate-100 pt-5 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              🎯 Copilot Resume Critique
            </div>
            <button
              onClick={onRefreshCritique}
              disabled={isLoadingCritique}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 disabled:text-slate-400 transition"
            >
              {isLoadingCritique ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              Analyze Draft
            </button>
          </div>

          {isLoadingCritique ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-2">
              <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              <p className="text-xs text-slate-500 font-semibold">Gemini AI is auditing narrative impact...</p>
            </div>
          ) : critique ? (
            <div className="space-y-4">
              {/* Strengths */}
              <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Strengths Detected
                </div>
                <div className="text-slate-700 space-y-1.5 font-medium pl-1">
                  {critique.strengths.map((s, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span>✓</span> <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps */}
              <div className="bg-red-50/40 border border-red-100/60 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="font-bold text-red-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-red-600" /> Structural Red Flag Gaps
                </div>
                <div className="text-slate-700 space-y-1.5 font-medium pl-1">
                  {critique.gaps.map((g, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span>!</span> <span>{g}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action items */}
              <div className="bg-blue-50/40 border border-blue-100/60 rounded-2xl p-4 text-xs space-y-2.5">
                <div className="font-bold text-blue-800">🛠 Recommended Polish Directives</div>
                <div className="text-slate-700 space-y-1.5 font-medium pl-1">
                  {critique.actionItems.map((act, i) => (
                    <div key={i} className="flex gap-2 leading-relaxed">
                      <span>{i + 1}.</span> <span>{act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 p-4">
              <p className="text-xs text-slate-500 font-medium">Click "Analyze Draft" above to query Gemini for an expert narrative evaluation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
