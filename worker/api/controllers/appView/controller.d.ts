import { BaseController } from '../baseController';
import { ApiResponse, ControllerResponse } from '../types';
import type { RouteContext } from '../../types/route-context';
import { AppDetailsData, AppStarToggleData } from './types';
export declare class AppViewController extends BaseController {
    static logger: import("../../../logger").StructuredLogger;
    static getAppDetails(request: Request, env: Env, _ctx: ExecutionContext, context: RouteContext): Promise<ControllerResponse<ApiResponse<AppDetailsData>>>;
    static toggleAppStar(_request: Request, env: Env, _ctx: ExecutionContext, context: RouteContext): Promise<ControllerResponse<ApiResponse<AppStarToggleData>>>;
}
