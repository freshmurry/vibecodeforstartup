import { SmartCodeGeneratorAgent } from './core/smartGeneratorAgent';
import { CodeGenState } from './core/state';
import { StructuredLogger } from '../logger';
import { InferenceContext } from './inferutils/config.types';
import { TemplateDetails } from '../services/sandbox/sandboxTypes';
import { TemplateSelection } from './schemas';
export declare function getAgentStub(env: Env, agentId: string, searchInOtherJurisdictions: boolean, logger: StructuredLogger): Promise<DurableObjectStub<SmartCodeGeneratorAgent>>;
export declare function getAgentState(env: Env, agentId: string, searchInOtherJurisdictions: boolean, logger: StructuredLogger): Promise<CodeGenState>;
export declare function cloneAgent(env: Env, agentId: string, logger: StructuredLogger): Promise<{
    newAgentId: string;
    newAgent: DurableObjectStub<SmartCodeGeneratorAgent>;
}>;
export declare function getTemplateForQuery(env: Env, inferenceContext: InferenceContext, query: string, hostname: string, logger: StructuredLogger): Promise<{
    sandboxSessionId: string;
    templateDetails: TemplateDetails;
    selection: TemplateSelection;
}>;
