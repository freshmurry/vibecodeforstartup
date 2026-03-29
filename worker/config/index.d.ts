import { ConfigurableSecuritySettings } from "./security";
export interface GlobalConfigurableSettings {
    security: ConfigurableSecuritySettings;
}
export declare function getGlobalConfigurableSettings(env: Env): Promise<GlobalConfigurableSettings>;
export declare function getUserConfigurableSettings(env: Env, userId: string, globalConfig: GlobalConfigurableSettings): Promise<GlobalConfigurableSettings>;
