import { CodeReviewOutputType } from '../schemas';
import { IssueReport } from '../domain/values/IssueReport';
import { AgentOperation, OperationOptions } from '../operations/common';
export interface CodeReviewInputs {
    issues: IssueReport;
}
export declare class CodeReviewOperation extends AgentOperation<CodeReviewInputs, CodeReviewOutputType> {
    execute(inputs: CodeReviewInputs, options: OperationOptions): Promise<CodeReviewOutputType>;
}
