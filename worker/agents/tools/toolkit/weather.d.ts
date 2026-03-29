import { ErrorResult, ToolDefinition } from "../types";
type WeatherArgs = {
    location: string;
};
export interface WeatherResult {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
}
type WeatherToolResult = WeatherResult | ErrorResult;
export declare const toolWeatherDefinition: ToolDefinition<WeatherArgs, WeatherToolResult>;
export {};
