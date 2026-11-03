// ============================================================================
// categorize.js — topic taxonomy + deterministic keyword categorization
// ============================================================================
// The keyword engine is the always-available categorizer. Workers AI is used
// only to refine items the rules cannot place (see agent.js), so the site
// never depends on AI availability.
// ============================================================================

export const TAXONOMY = [
  { slug: 'vibecoding', name: 'Vibe Coding', blurb: 'AI pair-programming, coding agents, and the tools changing how software gets written.' },
  { slug: 'ai-agents', name: 'AI Agents', blurb: 'Autonomous agents, agent frameworks, orchestration, and agentic workflows.' },
  { slug: 'machine-learning', name: 'Machine Learning', blurb: 'Models, training, inference, MLOps, and applied machine learning.' },
  { slug: 'agi', name: 'AGI', blurb: 'The road to artificial general intelligence: capabilities, evals, and milestones.' },
  { slug: 'superintelligence', name: 'Superintelligence', blurb: 'Superintelligence, AI safety, alignment, governance, and policy.' },
  { slug: 'ai-research', name: 'AI Research', blurb: 'Papers, lab breakthroughs, and research from the frontier of AI.' },
  { slug: 'ai-services', name: 'AI Services & Consulting', blurb: 'Professional services, enterprise AI adoption, and consulting practice.' },
];

export const CATEGORY_SLUGS = TAXONOMY.map(t => t.slug);
export function categoryName(slug) {
  const t = TAXONOMY.find(t => t.slug === slug);
  return t ? t.name : 'AI Research';
}

// Priority order for tie-breaks: most specific topics first.
const PRIORITY = ['superintelligence', 'agi', 'vibecoding', 'ai-agents', 'machine-learning', 'ai-services', 'ai-research'];

const KEYWORDS = {
  'superintelligence': ['superintelligence', 'super-intelligence', 'ai safety institute', 'existential risk', 'x-risk', 'ai governance', 'ai treaty', 'frontier safety', 'responsible scaling', 'ai alignment', 'alignment research', 'interpretability', 'mechanistic interpretability', 'ai control'],
  'agi': ['agi', 'artificial general intelligence', 'general intelligence', 'path to agi', 'human-level ai', 'sparrow', 'ai 2027', 'situational awareness', 'intelligence explosion', 'recursive self-improvement'],
  'vibecoding': ['vibe coding', 'vibecoding', 'vibe code', 'ai coding', 'coding assistant', 'coding agent', 'cursor', 'github copilot', 'copilot', 'claude code', 'codex', 'windsurf', 'replit', 'lovable', 'bolt.new', 'v0', 'pair programming', 'code generation', 'ai pair', 'developer tools', 'software development', 'ide', 'app builder'],
  'ai-agents': ['ai agent', 'ai agents', 'agentic', 'agent framework', 'multi-agent', 'multi agent', 'autonomous agent', 'langchain', 'langgraph', 'llamaindex', 'llama index', 'crewai', 'autogen', 'mcp', 'model context protocol', 'agent sdk', 'agents sdk', 'orchestration', 'tool use', 'function calling', 'computer use', 'browser agent', 'voice agent'],
  'machine-learning': ['machine learning', 'deep learning', 'neural network', 'transformer', 'llm', 'large language model', 'fine-tuning', 'fine tuning', 'rlhf', 'reinforcement learning', 'diffusion', 'embedding', 'inference', 'training run', 'gpu', 'dataset', 'benchmark', 'open weights', 'open-source model', 'open source model', 'quantization', 'distillation', 'mixture of experts', 'moe'],
  'ai-services': ['consulting', 'professional services', 'enterprise ai', 'ai adoption', 'ai strategy', 'digital transformation', 'managed services', 'systems integrator', 'client', 'customers can', 'for business', 'roi', 'use case', 'deployment at scale', 'ai solutions', 'thoughtworks', 'accenture', 'deloitte'],
  'ai-research': ['paper', 'arxiv', 'researchers', 'study', 'we present', 'introducing', 'announcing', 'new model', 'state-of-the-art', 'sota', 'evaluation', 'eval', 'dataset release', 'technical report'],
};

/**
 * Deterministic keyword categorization.
 * Returns { category, score } — score 0 means "no signal" (caller should use
 * the feed default or ask Workers AI).
 */
export function categorizeByRules(title, excerpt, fallback) {
  const t = (' ' + String(title || '').toLowerCase() + ' ');
  const e = (' ' + String(excerpt || '').toLowerCase() + ' ');
  let best = null;
  for (const slug of PRIORITY) {
    let score = 0;
    for (const kw of KEYWORDS[slug]) {
      if (t.includes(kw)) score += 2;
      if (e.includes(kw)) score += 1;
    }
    if (score > 0 && (!best || score > best.score)) best = { category: slug, score };
  }
  if (best) return best;
  return { category: fallback && CATEGORY_SLUGS.includes(fallback) ? fallback : 'ai-research', score: 0 };
}

/** Validate an AI-returned category string against the taxonomy. */
export function sanitizeCategory(raw, fallback) {
  const s = String(raw || '').toLowerCase().trim().replace(/[^a-z-]/g, '');
  for (const slug of CATEGORY_SLUGS) if (s.includes(slug)) return slug;
  return fallback;
}
