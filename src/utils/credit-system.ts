export type PromptComplexity = 'simple-prompt' | 'medium-prompt' | 'complex-prompt' | 'code-generation' | 'refactoring';

export interface CreditCosts {
	'simple-prompt': number;
	'medium-prompt': number;
	'complex-prompt': number;
	'code-generation': number;
	'refactoring': number;
}

export const DEFAULT_CREDIT_COSTS: CreditCosts = {
	'simple-prompt': 1,
	'medium-prompt': 2,
	'complex-prompt': 3,
	'code-generation': 2,
	'refactoring': 1,
};

export const PLAN_LIMITS = {
	free: {
		monthlyCredits: 45,
		maxApps: 2,
		creditCosts: DEFAULT_CREDIT_COSTS,
	},
	pro: {
		monthlyCredits: 500,
		maxApps: Infinity,
		creditCosts: DEFAULT_CREDIT_COSTS,
	},
	team: {
		monthlyCredits: 2000,
		maxApps: Infinity,
		creditCosts: DEFAULT_CREDIT_COSTS,
	},
	enterprise: {
		monthlyCredits: Infinity,
		maxApps: Infinity,
		creditCosts: {
			'simple-prompt': 0.8,
			'medium-prompt': 1.5,
			'complex-prompt': 2.5,
			'code-generation': 1.5,
			'refactoring': 0.8,
		},
	},
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;

/**
 * Analyzes a prompt and returns the estimated complexity and credit cost
 */
export function analyzePromptComplexity(prompt: string, context?: {
	isCodeGeneration?: boolean;
	isRefactoring?: boolean;
	hasFileUpload?: boolean;
	targetFiles?: string[];
}): { complexity: PromptComplexity; estimatedCost: number; reasoning: string } {
	const promptLength = prompt.length;
	const words = prompt.split(/\s+/).length;
	
	// Check for specific indicators
	const codeGenKeywords = ['create', 'build', 'generate', 'make', 'new component', 'new page', 'add feature'];
	const refactorKeywords = ['refactor', 'optimize', 'clean', 'improve', 'restructure', 'fix'];
	const complexKeywords = ['database', 'api', 'integration', 'authentication', 'payment', 'deployment', 'server', 'backend'];
	const mediumKeywords = ['component', 'form', 'navigation', 'styling', 'layout', 'responsive', 'animation'];
	
	const hasCodeGenKeywords = codeGenKeywords.some(keyword => 
		prompt.toLowerCase().includes(keyword.toLowerCase())
	);
	
	const hasRefactorKeywords = refactorKeywords.some(keyword => 
		prompt.toLowerCase().includes(keyword.toLowerCase())
	);
	
	const hasComplexKeywords = complexKeywords.some(keyword => 
		prompt.toLowerCase().includes(keyword.toLowerCase())
	);
	
	const hasMediumKeywords = mediumKeywords.some(keyword => 
		prompt.toLowerCase().includes(keyword.toLowerCase())
	);

	// Determine complexity based on context and content
	if (context?.isRefactoring || hasRefactorKeywords) {
		return {
			complexity: 'refactoring',
			estimatedCost: DEFAULT_CREDIT_COSTS['refactoring'],
			reasoning: 'Code refactoring or optimization task'
		};
	}
	
	if (context?.isCodeGeneration || hasCodeGenKeywords) {
		return {
			complexity: 'code-generation',
			estimatedCost: DEFAULT_CREDIT_COSTS['code-generation'],
			reasoning: 'Code generation or new feature creation'
		};
	}
	
	if (hasComplexKeywords || promptLength > 500 || words > 100 || context?.hasFileUpload) {
		return {
			complexity: 'complex-prompt',
			estimatedCost: DEFAULT_CREDIT_COSTS['complex-prompt'],
			reasoning: 'Complex request requiring advanced AI processing'
		};
	}
	
	if (hasMediumKeywords || promptLength > 200 || words > 40) {
		return {
			complexity: 'medium-prompt',
			estimatedCost: DEFAULT_CREDIT_COSTS['medium-prompt'],
			reasoning: 'Moderate complexity request'
		};
	}
	
	return {
		complexity: 'simple-prompt',
		estimatedCost: DEFAULT_CREDIT_COSTS['simple-prompt'],
		reasoning: 'Simple request or basic interaction'
	};
}

/**
 * Calculates the credit cost for a specific plan
 */
export function getCreditCost(complexity: PromptComplexity, planType: PlanType = 'free'): number {
	const planLimits = PLAN_LIMITS[planType];
	return planLimits.creditCosts[complexity];
}

/**
 * Checks if a user has enough credits for an operation
 */
export function hasEnoughCredits(
	currentCredits: number, 
	requiredCredits: number
): { canProceed: boolean; shortfall: number } {
	const canProceed = currentCredits >= requiredCredits;
	const shortfall = canProceed ? 0 : requiredCredits - currentCredits;
	
	return { canProceed, shortfall };
}

/**
 * Estimates monthly credit usage based on usage patterns
 */
export function estimateMonthlyUsage(dailyPrompts: {
	simple: number;
	medium: number;
	complex: number;
	codeGen: number;
	refactor: number;
}): number {
	const dailyCredits = (
		dailyPrompts.simple * DEFAULT_CREDIT_COSTS['simple-prompt'] +
		dailyPrompts.medium * DEFAULT_CREDIT_COSTS['medium-prompt'] +
		dailyPrompts.complex * DEFAULT_CREDIT_COSTS['complex-prompt'] +
		dailyPrompts.codeGen * DEFAULT_CREDIT_COSTS['code-generation'] +
		dailyPrompts.refactor * DEFAULT_CREDIT_COSTS['refactoring']
	);
	
	return dailyCredits * 30; // Estimate for 30-day month
}

/**
 * Suggests the best plan based on estimated usage
 */
export function suggestPlan(estimatedMonthlyCredits: number): {
	recommendedPlan: PlanType;
	reasoning: string;
	alternatives: PlanType[];
} {
	if (estimatedMonthlyCredits <= PLAN_LIMITS.free.monthlyCredits) {
		return {
			recommendedPlan: 'free',
			reasoning: 'Your estimated usage fits within the Free plan limits',
			alternatives: ['pro']
		};
	}
	
	if (estimatedMonthlyCredits <= PLAN_LIMITS.pro.monthlyCredits) {
		return {
			recommendedPlan: 'pro',
			reasoning: 'Pro plan provides sufficient credits with room for growth',
			alternatives: ['team']
		};
	}
	
	if (estimatedMonthlyCredits <= PLAN_LIMITS.team.monthlyCredits) {
		return {
			recommendedPlan: 'team',
			reasoning: 'Team plan provides ample credits for heavy usage',
			alternatives: ['enterprise']
		};
	}
	
	return {
		recommendedPlan: 'enterprise',
		reasoning: 'Enterprise plan recommended for high-volume usage',
		alternatives: []
	};
}

/**
 * Formats credit display for UI
 */
export function formatCredits(credits: number): string {
	if (credits >= 1000000) {
		return `${(credits / 1000000).toFixed(1)}M`;
	}
	if (credits >= 1000) {
		return `${(credits / 1000).toFixed(1)}k`;
	}
	return credits.toString();
}