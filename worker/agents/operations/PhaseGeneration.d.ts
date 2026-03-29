import { PhaseConceptGenerationSchemaType } from '../schemas';
import { IssueReport } from '../domain/values/IssueReport';
import { AgentOperation, OperationOptions } from '../operations/common';
export interface PhaseGenerationInputs {
    issues: IssueReport;
    userSuggestions?: string[] | null;
    isUserSuggestedPhase?: boolean;
}
export declare class PhaseGenerationOperation extends AgentOperation<PhaseGenerationInputs, PhaseConceptGenerationSchemaType> {
    execute(inputs: PhaseGenerationInputs, options: OperationOptions): Promise<PhaseConceptGenerationSchemaType>;
}
