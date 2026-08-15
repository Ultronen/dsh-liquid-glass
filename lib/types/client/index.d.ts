export interface ThemeLabThemeTokens {
	[token: string]: string;
}
export interface ThemeLabTheme {
	id: string;
	colorScheme: "light" | "dark";
	tokens: ThemeLabThemeTokens;
}
export declare const SETTINGS_NS: string;
export declare const THEMES: ThemeLabTheme[];
export declare const DEFAULT_THEME: string;
export declare function apply(ctx: unknown): void;
export declare const inject: string[];
