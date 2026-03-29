import { BaseController } from '../baseController';
import { RouteContext } from '../../types/route-context';
export interface GitHubExportData {
    success: boolean;
    repositoryUrl?: string;
    error?: string;
}
export declare class GitHubExporterController extends BaseController {
    static logger: import("../../../logger").StructuredLogger;
    static handleOAuthCallback(request: Request, env: Env, _ctx: ExecutionContext, context: RouteContext): Promise<Response>;
    static initiateGitHubExport(request: Request, env: Env, _ctx: ExecutionContext, context: RouteContext): Promise<Response>;
}
