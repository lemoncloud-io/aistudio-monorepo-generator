/**
 * `types.ts`
 * - Common type definitions
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */

/**
 * Generator options from CLI
 */
export interface GenerateOptions {
    input?: string;
    output?: string;
    s3?: string;
    template?: string;
    dryRun?: boolean;
    skipRefactor?: boolean;
    logLevel?: string;
    interactive?: boolean;
}

/**
 * Configuration from file or merged options
 */
export interface GeneratorConfig {
    projectName: string;
    inputPath: string;
    outputPath: string;
    template: string;
    dryRun: boolean;
    skipRefactor: boolean;
    gemini: GeminiConfig;
    logging: LoggingConfig;
}

/**
 * Gemini API configuration
 */
export interface GeminiConfig {
    apiKey: string;
    model: string;
    temperature: number;
    topP: number;
    maxOutputTokens: number;
}

/**
 * Logging configuration
 */
export interface LoggingConfig {
    level: string;
    saveLogs: boolean;
    logDir: string;
}

/**
 * Refactoring result
 */
export interface RefactorResult {
    success: boolean;
    filesProcessed: number;
    tokensUsed: number;
    dryRun: boolean;
    errors?: string[];
}

/**
 * File map for refactoring
 */
export interface FileMap {
    [key: string]: string;
}

/**
 * Template preset
 */
export interface TemplatePreset {
    name: string;
    description: string;
    fileMap: FileMap;
    outputMap: FileMap;
    optional: string[];
}
