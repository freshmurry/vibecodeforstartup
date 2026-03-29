import { TemplateListResponse } from '../../services/sandbox/sandboxTypes';
import { InferenceContext } from '../inferutils/config.types';
import { TemplateSelection } from '../../agents/schemas';
interface SelectTemplateArgs {
    env: Env;
    query: string;
    availableTemplates: TemplateListResponse['templates'];
    inferenceContext: InferenceContext;
}
/**
 * Uses AI to select the most suitable template for a given query.
 */
export declare function selectTemplate({ env, query, availableTemplates, inferenceContext }: SelectTemplateArgs): Promise<TemplateSelection>;
export {};
