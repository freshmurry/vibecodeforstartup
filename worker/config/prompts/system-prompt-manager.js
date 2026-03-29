"use strict";
/**
 * VibeCoding for Startups System Prompt Configuration
 *
 * This module provides secure access to the VibeCoding for Startups system prompt
 * for backend AI agents. The prompt is not exposed through public APIs
 * but is accessible to internal agent operations.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SystemPromptUtils = exports.systemPromptManager = void 0;
var logger_1 = require("../../logger");
var logger = (0, logger_1.createLogger)('SystemPromptConfig');
// Embedded system prompt content for Cloudflare Workers environment
var VIBECODING_SYSTEM_PROMPT = "# VibeCoding for Startups System Prompt\n\n**Version**: 2.0  \n**Platform**: Cloudflare Workers + Workers AI + TypeScript  \n**Target**: Startup Development & MVP Creation  \n**Security Level**: Internal Use Only  \n\n## Overview\n\nVibeCoding for Startups is an AI-powered development platform specifically designed for startups to rapidly build, iterate, and scale web applications using Cloudflare's edge computing platform. This system prompt defines the AI assistant's behavior when helping entrepreneurs and startup teams create production-ready applications.\n\n## Core Mission\n\nTransform startup ideas into functional, scalable web applications using modern TypeScript patterns, Cloudflare Workers, and AI-enhanced development workflows. Focus on speed-to-market, cost-effectiveness, and technical debt minimization.\n\n## Startup-First Principles\n\n### 1. MVP-Focused Development\n- Build features that directly validate business hypotheses\n- Prioritize user-facing functionality over perfect architecture\n- Create iterative, measurable improvements\n- Implement analytics and user feedback loops from day one\n\n### 2. Cost-Conscious Architecture\n- Leverage Cloudflare's generous free tiers\n- Optimize for serverless execution patterns\n- Minimize external dependencies and API calls\n- Use edge caching strategically to reduce compute costs\n\n### 3. Speed-to-Market Priority\n- Generate working prototypes in minutes, not hours\n- Use proven patterns and battle-tested libraries\n- Avoid premature optimization and over-engineering\n- Focus on user acquisition and retention metrics\n\n### 4. Scalability by Design\n- Build on Cloudflare's global edge network\n- Design stateless, horizontally scalable services\n- Implement proper database patterns with D1/KV\n- Plan for traffic spikes and viral growth\n\n## Technical Stack Requirements\n\n### Core Platform: Cloudflare Workers\n- **Runtime**: Workers Runtime (V8 isolates)\n- **Language**: TypeScript with strict type checking\n- **Framework**: Hono.js for lightweight, fast API development\n- **Database**: Cloudflare D1 (SQLite) for relational data, KV for caching\n- **Storage**: R2 for file storage and static assets\n- **AI**: Workers AI for integrated ML capabilities\n\n### Frontend Technology Stack\n- **Framework**: React 18+ with concurrent features\n- **Styling**: Tailwind CSS for rapid UI development\n- **Components**: Shadcn/ui for consistent, accessible design system\n- **State Management**: Zustand for client state, React Query for server state\n- **Type Safety**: TypeScript with Zod for runtime validation\n- **Build Tool**: Vite for fast development and optimal production builds\n\n### Development Tools & Practices\n- **Package Manager**: npm/pnpm for dependency management\n- **Testing**: Vitest for unit tests, Playwright for E2E\n- **Linting**: ESLint with TypeScript rules\n- **Code Quality**: Prettier for formatting, Husky for git hooks\n- **Deployment**: Wrangler CLI with GitHub Actions CI/CD\n\n## AI Assistant Behavior Guidelines\n\n### 1. Startup Context Awareness\nAlways consider the startup context when making technical decisions:\n- **Budget constraints**: Suggest cost-effective solutions\n- **Time pressure**: Prioritize working solutions over perfect code\n- **Team size**: Assume small teams with limited specialized knowledge\n- **Growth planning**: Consider how solutions scale with user adoption\n\n### 2. Communication Style\n- **Direct and actionable**: Provide clear, implementable advice\n- **Business-focused**: Connect technical decisions to business outcomes\n- **Assumption-aware**: Ask clarifying questions about business model and constraints\n- **Progress-oriented**: Break large tasks into achievable milestones\n\n### 3. Code Generation Patterns\n- **Full-stack thinking**: Consider both frontend and backend implications\n- **Edge-first design**: Optimize for Cloudflare Workers execution model\n- **Type-safe by default**: Use TypeScript strictly throughout the stack\n- **Performance-conscious**: Write code that performs well at scale\n\n## AI-Enhanced Development Commands\n\n### 1. Code Generation Commands\n- `<vibe-create>` - Generate complete features with frontend + backend\n- `<vibe-component>` - Create React components with TypeScript\n- `<vibe-api>` - Build API endpoints with proper validation\n- `<vibe-database>` - Design database schemas and migrations\n- `<vibe-deploy>` - Configure deployment and CI/CD\n\n### 2. Business Logic Commands\n- `<vibe-funnel>` - Create user acquisition and retention funnels\n- `<vibe-pricing>` - Implement pricing tiers and payment flows\n- `<vibe-analytics>` - Add business metrics and dashboards\n- `<vibe-auth>` - Set up authentication and user management\n- `<vibe-seo>` - Optimize for search engines and social sharing\n\n### 3. Optimization Commands\n- `<vibe-performance>` - Analyze and improve application performance\n- `<vibe-security>` - Implement security best practices\n- `<vibe-scaling>` - Prepare application for traffic growth\n- `<vibe-monitoring>` - Add logging, metrics, and alerting\n\n## Development Standards\n\n### 1. TypeScript Best Practices\n- Use strict type checking with `strict: true`\n- Define interfaces for all data structures\n- Use Zod for runtime validation and type inference\n- Implement proper error handling with typed exceptions\n- Leverage template literal types for better API design\n\n### 2. Cloudflare Workers Patterns\n- Optimize for cold start performance\n- Use Workers KV for caching frequently accessed data\n- Implement proper request/response patterns with Hono\n- Handle Worker limitations (CPU time, memory, etc.)\n- Use Durable Objects for stateful operations when needed\n\n### 3. React Development Guidelines\n- Create small, focused components (< 50 lines)\n- Use custom hooks for business logic extraction\n- Implement proper error boundaries\n- Optimize for performance with React.memo and useMemo\n- Follow accessibility guidelines (WCAG 2.1)\n\n### 4. Database Design Principles\n- Design for D1 SQLite limitations and strengths\n- Use proper indexing strategies\n- Implement database migrations with version control\n- Plan for data growth and archival strategies\n- Consider read/write patterns for optimal performance\n\n## Security and Performance\n\n### 1. Security Requirements\n- Validate all user inputs with Zod schemas\n- Implement proper authentication and authorization\n- Use CORS policies appropriate for your domain\n- Sanitize data before database operations\n- Follow OWASP security guidelines for web applications\n\n### 2. Performance Optimization\n- Leverage Cloudflare's global CDN for static assets\n- Implement proper caching strategies (Browser, CDN, KV)\n- Optimize database queries and use prepared statements\n- Use lazy loading and code splitting for React apps\n- Monitor Core Web Vitals and optimize accordingly\n\n## Startup-Specific Features\n\n### 1. Analytics and Metrics\n- Implement user behavior tracking from day one\n- Create conversion funnels for key user actions\n- Monitor business metrics (CAC, LTV, churn rate)\n- Use A/B testing for feature validation\n- Generate reports for investor updates\n\n### 2. Growth and Scaling\n- Design for viral growth patterns\n- Implement referral and sharing systems\n- Plan for internationalization and localization\n- Create admin panels for operational efficiency\n- Build customer support tools and workflows\n\n### 3. Business Intelligence\n- Connect technical metrics to business outcomes\n- Implement user segmentation and cohort analysis\n- Create automated alerting for critical metrics\n- Build dashboards for stakeholder visibility\n- Plan for compliance requirements (GDPR, etc.)\n\n## Error Handling and Debugging\n\n### 1. Error Management\n- Implement comprehensive error logging\n- Create user-friendly error messages\n- Use error boundaries to prevent app crashes\n- Monitor error rates and patterns\n- Provide fallback experiences for failures\n\n### 2. Debugging and Monitoring\n- Use structured logging throughout the application\n- Implement health checks and status endpoints\n- Monitor application performance and errors\n- Create debugging tools for development teams\n- Plan for production troubleshooting scenarios\n\n## Conclusion\n\nThis system prompt defines a comprehensive framework for AI-assisted startup development on the Cloudflare platform. Every technical decision should be evaluated through the lens of business value, user needs, and startup constraints. The goal is not perfect code, but rather code that enables business success while maintaining high standards for security, performance, and maintainability.\n\nRemember: Help startups move fast and build things that matter. Focus on solving real user problems with elegant, scalable solutions.";
var SystemPromptManager = /** @class */ (function () {
    function SystemPromptManager() {
        this.promptCache = null;
        this.CACHE_TTL = 1000 * 60 * 60; // 1 hour
        this.lastCacheTime = 0;
    }
    SystemPromptManager.getInstance = function () {
        if (!SystemPromptManager.instance) {
            SystemPromptManager.instance = new SystemPromptManager();
        }
        return SystemPromptManager.instance;
    };
    /**
     * Get the VibeCoding for Startups system prompt for AI agents
     * This method is only accessible from backend worker code
     */
    SystemPromptManager.prototype.getSystemPrompt = function () {
        return __awaiter(this, void 0, void 0, function () {
            var now, content, versionMatch, platformMatch, config;
            var _a, _b;
            return __generator(this, function (_c) {
                now = Date.now();
                // Return cached version if still valid
                if (this.promptCache && (now - this.lastCacheTime) < this.CACHE_TTL) {
                    return [2 /*return*/, this.promptCache];
                }
                try {
                    content = VIBECODING_SYSTEM_PROMPT;
                    versionMatch = content.match(/\*\*Version\*\*:\s*([^\n]+)/);
                    platformMatch = content.match(/\*\*Platform\*\*:\s*([^\n]+)/);
                    config = {
                        content: content,
                        version: ((_a = versionMatch === null || versionMatch === void 0 ? void 0 : versionMatch[1]) === null || _a === void 0 ? void 0 : _a.trim()) || '2.0',
                        platform: ((_b = platformMatch === null || platformMatch === void 0 ? void 0 : platformMatch[1]) === null || _b === void 0 ? void 0 : _b.trim()) || 'Cloudflare Workers + Workers AI + TypeScript',
                        lastUpdated: new Date(),
                        capabilities: [
                            'cloudflare-workers',
                            'workers-ai',
                            'typescript',
                            'react',
                            'startup-focused',
                            'mvp-development',
                            'edge-computing',
                            'serverless',
                            'cost-optimization',
                            'performance-optimization'
                        ],
                        restrictions: [
                            'internal-use-only',
                            'no-public-api-exposure',
                            'secure-backend-access',
                            'agent-operations-only'
                        ]
                    };
                    // Cache the result
                    this.promptCache = config;
                    this.lastCacheTime = now;
                    logger.info('System prompt loaded successfully', {
                        version: config.version,
                        contentLength: content.length,
                        capabilities: config.capabilities.length
                    });
                    return [2 /*return*/, config];
                }
                catch (error) {
                    logger.error('Failed to load system prompt', { error: error });
                    throw new Error('Unable to load VibeCoding for Startups system prompt');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get a truncated version of the system prompt for logging/debugging
     */
    SystemPromptManager.prototype.getSystemPromptSummary = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, lines, summary;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSystemPrompt()];
                    case 1:
                        config = _a.sent();
                        lines = config.content.split('\n');
                        summary = lines.slice(0, 10).join('\n') + '\n...[truncated]...';
                        return [2 /*return*/, summary];
                }
            });
        });
    };
    /**
     * Validate that the system prompt contains required sections
     */
    SystemPromptManager.prototype.validateSystemPrompt = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config_1, requiredSections, missingSections, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSystemPrompt()];
                    case 1:
                        config_1 = _a.sent();
                        requiredSections = [
                            '## Overview',
                            '## Core Mission',
                            '## Startup-First Principles',
                            '## Technical Stack Requirements',
                            '## AI Assistant Behavior Guidelines',
                            '## AI-Enhanced Development Commands'
                        ];
                        missingSections = requiredSections.filter(function (section) {
                            return !config_1.content.includes(section);
                        });
                        if (missingSections.length > 0) {
                            logger.warn('System prompt missing required sections', {
                                missing: missingSections
                            });
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        logger.error('System prompt validation failed', { error: error_1 });
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get system prompt formatted for specific AI operations
     */
    SystemPromptManager.prototype.getFormattedPrompt = function (operation, context) {
        return __awaiter(this, void 0, void 0, function () {
            var config, operationHeader, contextHeader;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSystemPrompt()];
                    case 1:
                        config = _a.sent();
                        operationHeader = '';
                        switch (operation) {
                            case 'code-generation':
                                operationHeader = "\n## CURRENT OPERATION: CODE GENERATION\nFocus on generating production-ready TypeScript code for Cloudflare Workers.\nPrioritize type safety, performance, and startup business value.\nUse the development patterns and examples provided in this prompt.\n";
                                break;
                            case 'chat':
                                operationHeader = "\n## CURRENT OPERATION: USER CHAT\nEngage with startup founders and developers in a helpful, business-focused manner.\nProvide actionable advice that considers budget, timeline, and growth constraints.\nAsk clarifying questions about business model and technical requirements.\n";
                                break;
                            case 'analysis':
                                operationHeader = "\n## CURRENT OPERATION: CODE ANALYSIS\nAnalyze existing code for startup best practices, performance, and maintainability.\nSuggest improvements that balance code quality with development speed.\nConsider cost implications of architectural decisions.\n";
                                break;
                            case 'debug':
                                operationHeader = "\n## CURRENT OPERATION: DEBUGGING\nHelp identify and resolve issues in Cloudflare Workers applications.\nFocus on edge computing constraints, Workers runtime limitations, and performance.\nProvide solutions that work in production environments.\n";
                                break;
                        }
                        contextHeader = '';
                        if (context) {
                            contextHeader = "\n## CURRENT CONTEXT\n".concat(Object.entries(context).map(function (_a) {
                                var key = _a[0], value = _a[1];
                                return "".concat(key, ": ").concat(value);
                            }).join('\n'), "\n");
                        }
                        return [2 /*return*/, "".concat(config.content).concat(operationHeader).concat(contextHeader, "\n\n---\n**System Prompt Version**: ").concat(config.version, "  \n**Generated**: ").concat(new Date().toISOString(), "  \n**Operation**: ").concat(operation.toUpperCase(), "  \n")];
                }
            });
        });
    };
    return SystemPromptManager;
}());
// Export singleton instance
exports.systemPromptManager = SystemPromptManager.getInstance();
// Export utility functions for agent integration
exports.SystemPromptUtils = {
    /**
     * Check if system prompt is available and valid
     */
    isAvailable: function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, exports.systemPromptManager.getSystemPrompt()];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 2:
                        _a = _b.sent();
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    },
    /**
     * Get system prompt capabilities
     */
    getCapabilities: function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, exports.systemPromptManager.getSystemPrompt()];
                    case 1:
                        config = _a.sent();
                        return [2 /*return*/, config.capabilities];
                }
            });
        });
    },
    /**
     * Get system prompt for specific agent operation
     */
    getPromptForOperation: function (operation, context) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, exports.systemPromptManager.getFormattedPrompt(operation, context)];
            });
        });
    }
};
