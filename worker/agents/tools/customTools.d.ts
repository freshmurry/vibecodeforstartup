import type { ToolDefinition } from './types';
export declare function executeToolWithDefinition<TArgs, TResult>(toolDef: ToolDefinition<TArgs, TResult>, args: TArgs): Promise<TResult>;
