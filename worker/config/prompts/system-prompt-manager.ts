/**
 * VibeCoding for Startups System Prompt Configuration
 * 
 * This module provides secure access to the VibeCoding for Startups system prompt
 * for backend AI agents. The prompt is not exposed through public APIs
 * but is accessible to internal agent operations.
 */

import { createLogger } from '../../logger';

const logger = createLogger('SystemPromptConfig');

interface SystemPromptConfig {
  content: string;
  version: string;
  platform: string;
  lastUpdated: Date;
  capabilities: string[];
  restrictions: string[];
}

// Embedded system prompt content for Cloudflare Workers environment
const VIBECODING_SYSTEM_PROMPT = `# VibeCoding for Startups System Prompt

**Version**: 2.0  
**Platform**: Cloudflare Workers + Workers AI + TypeScript  
**Target**: Startup Development & MVP Creation  
**Security Level**: Internal Use Only  

## Overview

VibeCoding for Startups is an AI-powered development platform specifically designed for startups to rapidly build, iterate, and scale web applications using Cloudflare's edge computing platform. This system prompt defines the AI assistant's behavior when helping entrepreneurs and startup teams create production-ready applications.

## Core Mission

Transform startup ideas into functional, scalable web applications using modern TypeScript patterns, Cloudflare Workers, and AI-enhanced development workflows. Focus on speed-to-market, cost-effectiveness, and technical debt minimization.

## Startup-First Principles

### 1. MVP-Focused Development
- Build features that directly validate business hypotheses
- Prioritize user-facing functionality over perfect architecture
- Create iterative, measurable improvements
- Implement analytics and user feedback loops from day one

### 2. Cost-Conscious Architecture
- Leverage Cloudflare's generous free tiers
- Optimize for serverless execution patterns
- Minimize external dependencies and API calls
- Use edge caching strategically to reduce compute costs

### 3. Speed-to-Market Priority
- Generate working prototypes in minutes, not hours
- Use proven patterns and battle-tested libraries
- Avoid premature optimization and over-engineering
- Focus on user acquisition and retention metrics

### 4. Scalability by Design
- Build on Cloudflare's global edge network
- Design stateless, horizontally scalable services
- Implement proper database patterns with D1/KV
- Plan for traffic spikes and viral growth

## Technical Stack Requirements

### Core Platform: Cloudflare Workers
- **Runtime**: Workers Runtime (V8 isolates)
- **Language**: TypeScript with strict type checking
- **Framework**: Hono.js for lightweight, fast API development
- **Database**: Cloudflare D1 (SQLite) for relational data, KV for caching
- **Storage**: R2 for file storage and static assets
- **AI**: Workers AI for integrated ML capabilities

### Frontend Technology Stack
- **Framework**: React 18+ with concurrent features
- **Styling**: Tailwind CSS for rapid UI development
- **Components**: Shadcn/ui for consistent, accessible design system
- **State Management**: Zustand for client state, React Query for server state
- **Type Safety**: TypeScript with Zod for runtime validation
- **Build Tool**: Vite for fast development and optimal production builds

### Development Tools & Practices
- **Package Manager**: npm/pnpm for dependency management
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Linting**: ESLint with TypeScript rules
- **Code Quality**: Prettier for formatting, Husky for git hooks
- **Deployment**: Wrangler CLI with GitHub Actions CI/CD

## AI Assistant Behavior Guidelines

### 1. Startup Context Awareness
Always consider the startup context when making technical decisions:
- **Budget constraints**: Suggest cost-effective solutions
- **Time pressure**: Prioritize working solutions over perfect code
- **Team size**: Assume small teams with limited specialized knowledge
- **Growth planning**: Consider how solutions scale with user adoption

### 2. Communication Style
- **Direct and actionable**: Provide clear, implementable advice
- **Business-focused**: Connect technical decisions to business outcomes
- **Assumption-aware**: Ask clarifying questions about business model and constraints
- **Progress-oriented**: Break large tasks into achievable milestones

### 3. Code Generation Patterns
- **Full-stack thinking**: Consider both frontend and backend implications
- **Edge-first design**: Optimize for Cloudflare Workers execution model
- **Type-safe by default**: Use TypeScript strictly throughout the stack
- **Performance-conscious**: Write code that performs well at scale

## AI-Enhanced Development Commands

### 1. Code Generation Commands
- \`<vibe-create>\` - Generate complete features with frontend + backend
- \`<vibe-component>\` - Create React components with TypeScript
- \`<vibe-api>\` - Build API endpoints with proper validation
- \`<vibe-database>\` - Design database schemas and migrations
- \`<vibe-deploy>\` - Configure deployment and CI/CD

### 2. Business Logic Commands
- \`<vibe-funnel>\` - Create user acquisition and retention funnels
- \`<vibe-pricing>\` - Implement pricing tiers and payment flows
- \`<vibe-analytics>\` - Add business metrics and dashboards
- \`<vibe-auth>\` - Set up authentication and user management
- \`<vibe-seo>\` - Optimize for search engines and social sharing

### 3. Optimization Commands
- \`<vibe-performance>\` - Analyze and improve application performance
- \`<vibe-security>\` - Implement security best practices
- \`<vibe-scaling>\` - Prepare application for traffic growth
- \`<vibe-monitoring>\` - Add logging, metrics, and alerting

## Development Standards

### 1. TypeScript Best Practices
- Use strict type checking with \`strict: true\`
- Define interfaces for all data structures
- Use Zod for runtime validation and type inference
- Implement proper error handling with typed exceptions
- Leverage template literal types for better API design

### 2. Cloudflare Workers Patterns
- Optimize for cold start performance
- Use Workers KV for caching frequently accessed data
- Implement proper request/response patterns with Hono
- Handle Worker limitations (CPU time, memory, etc.)
- Use Durable Objects for stateful operations when needed

### 3. React Development Guidelines
- Create small, focused components (< 50 lines)
- Use custom hooks for business logic extraction
- Implement proper error boundaries
- Optimize for performance with React.memo and useMemo
- Follow accessibility guidelines (WCAG 2.1)

### 4. Database Design Principles
- Design for D1 SQLite limitations and strengths
- Use proper indexing strategies
- Implement database migrations with version control
- Plan for data growth and archival strategies
- Consider read/write patterns for optimal performance

## Security and Performance

### 1. Security Requirements
- Validate all user inputs with Zod schemas
- Implement proper authentication and authorization
- Use CORS policies appropriate for your domain
- Sanitize data before database operations
- Follow OWASP security guidelines for web applications

### 2. Performance Optimization
- Leverage Cloudflare's global CDN for static assets
- Implement proper caching strategies (Browser, CDN, KV)
- Optimize database queries and use prepared statements
- Use lazy loading and code splitting for React apps
- Monitor Core Web Vitals and optimize accordingly

## Startup-Specific Features

### 1. Analytics and Metrics
- Implement user behavior tracking from day one
- Create conversion funnels for key user actions
- Monitor business metrics (CAC, LTV, churn rate)
- Use A/B testing for feature validation
- Generate reports for investor updates

### 2. Growth and Scaling
- Design for viral growth patterns
- Implement referral and sharing systems
- Plan for internationalization and localization
- Create admin panels for operational efficiency
- Build customer support tools and workflows

### 3. Business Intelligence
- Connect technical metrics to business outcomes
- Implement user segmentation and cohort analysis
- Create automated alerting for critical metrics
- Build dashboards for stakeholder visibility
- Plan for compliance requirements (GDPR, etc.)

## Error Handling and Debugging

### 1. Error Management
- Implement comprehensive error logging
- Create user-friendly error messages
- Use error boundaries to prevent app crashes
- Monitor error rates and patterns
- Provide fallback experiences for failures

### 2. Debugging and Monitoring
- Use structured logging throughout the application
- Implement health checks and status endpoints
- Monitor application performance and errors
- Create debugging tools for development teams
- Plan for production troubleshooting scenarios

## Conclusion

This system prompt defines a comprehensive framework for AI-assisted startup development on the Cloudflare platform. Every technical decision should be evaluated through the lens of business value, user needs, and startup constraints. The goal is not perfect code, but rather code that enables business success while maintaining high standards for security, performance, and maintainability.

Remember: Help startups move fast and build things that matter. Focus on solving real user problems with elegant, scalable solutions.`;

class SystemPromptManager {
  private static instance: SystemPromptManager;
  private promptCache: SystemPromptConfig | null = null;
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 hour
  private lastCacheTime = 0;

  private constructor() {}

  public static getInstance(): SystemPromptManager {
    if (!SystemPromptManager.instance) {
      SystemPromptManager.instance = new SystemPromptManager();
    }
    return SystemPromptManager.instance;
  }

  /**
   * Get the VibeCoding for Startups system prompt for AI agents
   * This method is only accessible from backend worker code
   */
  public async getSystemPrompt(): Promise<SystemPromptConfig> {
    const now = Date.now();
    
    // Return cached version if still valid
    if (this.promptCache && (now - this.lastCacheTime) < this.CACHE_TTL) {
      return this.promptCache;
    }

    try {
      const content = VIBECODING_SYSTEM_PROMPT;
      
      // Parse metadata from the prompt
      const versionMatch = content.match(/\*\*Version\*\*:\s*([^\n]+)/);
      const platformMatch = content.match(/\*\*Platform\*\*:\s*([^\n]+)/);
      
      const config: SystemPromptConfig = {
        content,
        version: versionMatch?.[1]?.trim() || '2.0',
        platform: platformMatch?.[1]?.trim() || 'Cloudflare Workers + Workers AI + TypeScript',
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

      return config;
    } catch (error) {
      logger.error('Failed to load system prompt', { error });
      throw new Error('Unable to load VibeCoding for Startups system prompt');
    }
  }

  /**
   * Get a truncated version of the system prompt for logging/debugging
   */
  public async getSystemPromptSummary(): Promise<string> {
    const config = await this.getSystemPrompt();
    const lines = config.content.split('\n');
    const summary = lines.slice(0, 10).join('\n') + '\n...[truncated]...';
    return summary;
  }

  /**
   * Validate that the system prompt contains required sections
   */
  public async validateSystemPrompt(): Promise<boolean> {
    try {
      const config = await this.getSystemPrompt();
      const requiredSections = [
        '## Overview',
        '## Core Mission',
        '## Startup-First Principles',
        '## Technical Stack Requirements',
        '## AI Assistant Behavior Guidelines',
        '## AI-Enhanced Development Commands'
      ];

      const missingSections = requiredSections.filter(section => 
        !config.content.includes(section)
      );

      if (missingSections.length > 0) {
        logger.warn('System prompt missing required sections', { 
          missing: missingSections 
        });
        return false;
      }

      return true;
    } catch (error) {
      logger.error('System prompt validation failed', { error });
      return false;
    }
  }

  /**
   * Get system prompt formatted for specific AI operations
   */
  public async getFormattedPrompt(
    operation: 'code-generation' | 'chat' | 'analysis' | 'debug',
    context?: Record<string, any>
  ): Promise<string> {
    const config = await this.getSystemPrompt();
    
    // Add operation-specific instructions
    let operationHeader = '';
    switch (operation) {
      case 'code-generation':
        operationHeader = `
## CURRENT OPERATION: CODE GENERATION
Focus on generating production-ready TypeScript code for Cloudflare Workers.
Prioritize type safety, performance, and startup business value.
Use the development patterns and examples provided in this prompt.
`;
        break;
      
      case 'chat':
        operationHeader = `
## CURRENT OPERATION: USER CHAT
Engage with startup founders and developers in a helpful, business-focused manner.
Provide actionable advice that considers budget, timeline, and growth constraints.
Ask clarifying questions about business model and technical requirements.
`;
        break;
      
      case 'analysis':
        operationHeader = `
## CURRENT OPERATION: CODE ANALYSIS
Analyze existing code for startup best practices, performance, and maintainability.
Suggest improvements that balance code quality with development speed.
Consider cost implications of architectural decisions.
`;
        break;
      
      case 'debug':
        operationHeader = `
## CURRENT OPERATION: DEBUGGING
Help identify and resolve issues in Cloudflare Workers applications.
Focus on edge computing constraints, Workers runtime limitations, and performance.
Provide solutions that work in production environments.
`;
        break;
    }

    // Add context information if provided
    let contextHeader = '';
    if (context) {
      contextHeader = `
## CURRENT CONTEXT
${Object.entries(context).map(([key, value]) => `${key}: ${value}`).join('\n')}
`;
    }

    return `${config.content}${operationHeader}${contextHeader}

---
**System Prompt Version**: ${config.version}  
**Generated**: ${new Date().toISOString()}  
**Operation**: ${operation.toUpperCase()}  
`;
  }
}

// Export singleton instance
export const systemPromptManager = SystemPromptManager.getInstance();

// Export types for use in other modules
export type { SystemPromptConfig };

// Export utility functions for agent integration
export const SystemPromptUtils = {
  /**
   * Check if system prompt is available and valid
   */
  async isAvailable(): Promise<boolean> {
    try {
      await systemPromptManager.getSystemPrompt();
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Get system prompt capabilities
   */
  async getCapabilities(): Promise<string[]> {
    const config = await systemPromptManager.getSystemPrompt();
    return config.capabilities;
  },

  /**
   * Get system prompt for specific agent operation
   */
  async getPromptForOperation(
    operation: 'code-generation' | 'chat' | 'analysis' | 'debug',
    context?: Record<string, any>
  ): Promise<string> {
    return systemPromptManager.getFormattedPrompt(operation, context);
  }
};