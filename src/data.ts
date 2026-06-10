import { ResumeState, Job } from "./types";

export const INITIAL_RESUME: ResumeState = {
  name: "Irina Borissova",
  currentTitle: "EVP Marketing & Co-Founder",
  currentCompany: "CDI Media",
  email: "iborissova47@gmail.com",
  skills: [
    "GEO/AEO Optimization",
    "Paid Search (SEM)",
    "Smart Bidding Systems",
    "Performance Marketing",
    "Executive Leadership",
    "ROAS Acceleration",
    "Direct-to-Consumer Strategy",
    "AI Marketing Automation",
    "Data-Driven Growth Models"
  ],
  about: "High-growth executive and founder with a history of steering $50M+ performance portfolio budgets. Pioneer of modern Generative Engine Optimization (GEO) and Answer Engine Optimization (AEO) frameworks, scaling enterprise value through intelligent search, algorithmic media execution, and technical brand architecture.",
  experience: [
    {
      role: "EVP Marketing & Co-Founder",
      company: "CDI Media",
      period: "2021 - Present",
      description: [
        "Steered multi-channel paid search portfolio exceeding $50M in annual media deployment, achieving flat customer acquisition cost (CAC) while scaling volume over 140%.",
        "Invented and deployed corporate GEO/AEO (Generative/Answer Engine Optimization) response modeling framework, securing over 25% organic visibility shares on AI search platforms.",
        "Engineered intelligent Smart Bidding models, increasing global segment ROAS by 34% through customized programmatic bid adjustments.",
        "Expanded dynamic co-founding team from 4 to 80+ media specialists and engineers, cultivating high-performance output culture."
      ]
    },
    {
      role: "VP of Digital & Growth Strategy",
      company: "Apex Media Group",
      period: "2017 - 2021",
      description: [
        "Pioneered customer acquisition campaigns, increasing annual digital revenue from $12M to $38M within a 3-year tenure.",
        "Designed real-time attribution dashboards with custom multi-touch fractional weightings, refining budget allocation efficiency by 18%.",
        "Orchestrated cross-departmental alignment across engineering, product development, and brand design to streamline product market fit cycles."
      ]
    }
  ]
};

export const INITIAL_JOBS: Job[] = [
  {
    id: "job-1",
    title: "Head of Marketing",
    company: "Tempus AI",
    location: "San Francisco / Remote",
    type: "hybrid",
    matchScore: 94,
    salaryRange: "$230,000 - $280,000 + equity",
    postedTime: "2 hours ago",
    matchExplanation: "Matches your extensive GEO/AEO response modeling history at CDI Media and your $50M+ performance growth portfolio scale perfectly.",
    adjustmentsNeeded: [
      "Missing explicitly designated 'Generative AI Content Generation' metrics in recent bullet points.",
      "Incorporate secondary references to 'B2B SaaS product launch playbooks'."
    ],
    description: "Seeking a performance-driven senior marketing executive to scale our next-generation healthcare diagnostic platforms. This position will lead both organic AI search visibility and premium paid conversion channels."
  },
  {
    id: "job-2",
    title: "VP of Growth & Algorithmic Media",
    company: "Synthetix Labs",
    location: "Oakland, CA / Remote",
    type: "remote",
    matchScore: 89,
    salaryRange: "$250,000 - $310,000",
    postedTime: "1 day ago",
    matchExplanation: "Aligns beautifully with your programmatic bid optimizations, smart bidding solutions, and direct co-founding experience at CDI Media.",
    adjustmentsNeeded: [
      "Expand on multi-million dollar direct programmatic negotiation capabilities.",
      "Add detail regarding engineering partnership initiatives."
    ],
    description: "Synthetix is leading the charge in distributed AI compute virtualization. You will own our entire growth funnel, deploying dynamic programmatic acquisition budgets and scaling multi-channel technical outreach."
  }
];

export const SALARY_BENCHMARKS = [
  { role: "VP of Marketing", location: "San Francisco, CA", range: "$220k - $290k", equity: "0.2% - 0.7%", confidence: "High" },
  { role: "Executive VP (EVP) of Growth", location: "Bay Area / Remote", range: "$250k - $340k", equity: "0.5% - 1.2%", confidence: "High" },
  { role: "Chief Marketing Officer (CMO)", location: "Silicon Valley", range: "$280k - $420k", equity: "1.0% - 2.5%", confidence: "Medium" },
  { role: "Marketing Director", location: "Oakland, CA", range: "$160k - $210k", equity: "0.1% - 0.3%", confidence: "High" }
];
