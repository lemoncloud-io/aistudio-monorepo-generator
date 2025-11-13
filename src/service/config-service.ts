/**
 * `config-service.ts`
 * - configuration management service
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { $U, _log, _inf, _err } from '../utils/logger';
import { AbstractService } from '../cores/abstract-service';
import { GenerateOptions, GeneratorConfig, GeminiConfig, LoggingConfig } from '../cores/types';
import * as fs from 'fs';
import * as path from 'path';

const NS = $U.NS('CONFIG', 'blue');

/**
 * class: `ConfigService`
 */
export class ConfigService extends AbstractService {
    public constructor() {
        super('config');
        _log(NS, 'ConfigService()...');
    }

    /**
     * say hello()
     */
    public hello = (): string => `config-service:${this.name}`;

    /**
     * Load and merge configuration from options, config file, and environment
     */
    public async load(options: GenerateOptions): Promise<GeneratorConfig> {
        const errScope = 'load()';
        _log(NS, errScope, options);

        try {
            // 1. Load from environment variables
            const envConfig = this.loadFromEnv();

            // 2. Load from config file if exists
            const fileConfig = await this.loadFromFile();

            // 3. Merge with CLI options (highest priority)
            const config = this.merge(envConfig, fileConfig, options);

            // 4. Validate configuration
            this.validate(config);

            _inf(NS, 'Configuration loaded successfully');
            return config;
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Load configuration from environment variables
     */
    private loadFromEnv(): Partial<GeneratorConfig> {
        return {
            gemini: {
                apiKey: process.env.GEMINI_API_KEY || '',
                model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
                temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.8'),
                topP: parseFloat(process.env.GEMINI_TOP_P || '0.95'),
                maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '8192', 10),
            },
            logging: {
                level: process.env.LOG_LEVEL || 'info',
                saveLogs: process.env.SAVE_LOGS === 'true',
                logDir: process.env.LOG_DIR || './logs',
            },
        };
    }

    /**
     * Load configuration from file (.mono-gen.json)
     */
    private async loadFromFile(): Promise<Partial<GeneratorConfig>> {
        const configPath = path.join(process.cwd(), '.mono-gen.json');

        if (!fs.existsSync(configPath)) {
            _log(NS, 'No config file found, using defaults');
            return {};
        }

        try {
            const content = fs.readFileSync(configPath, 'utf-8');
            const config = JSON.parse(content);
            _log(NS, 'Config file loaded:', configPath);
            return config;
        } catch (error) {
            _err(NS, 'Failed to parse config file:', error);
            return {};
        }
    }

    /**
     * Merge configurations with priority: options > file > env > defaults
     */
    private merge(
        envConfig: Partial<GeneratorConfig>,
        fileConfig: Partial<GeneratorConfig>,
        options: GenerateOptions
    ): GeneratorConfig {
        const defaults: GeneratorConfig = {
            projectName: 'my-monorepo',
            inputPath: '',
            outputPath: './output',
            template: 'default',
            dryRun: false,
            skipRefactor: false,
            gemini: {
                apiKey: '',
                model: 'gemini-2.0-flash-exp',
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
            logging: {
                level: 'info',
                saveLogs: false,
                logDir: './logs',
            },
        };

        // Merge in priority order
        return {
            projectName: options.output?.split('/').pop() || fileConfig.projectName || defaults.projectName,
            inputPath: options.input || options.s3 || fileConfig.inputPath || defaults.inputPath,
            outputPath: options.output || fileConfig.outputPath || defaults.outputPath,
            template: options.template || fileConfig.template || defaults.template,
            dryRun: options.dryRun ?? fileConfig.dryRun ?? defaults.dryRun,
            skipRefactor: options.skipRefactor ?? fileConfig.skipRefactor ?? defaults.skipRefactor,
            gemini: {
                apiKey: envConfig.gemini?.apiKey || fileConfig.gemini?.apiKey || defaults.gemini.apiKey,
                model: fileConfig.gemini?.model || envConfig.gemini?.model || defaults.gemini.model,
                temperature: fileConfig.gemini?.temperature ?? envConfig.gemini?.temperature ?? defaults.gemini.temperature,
                topP: fileConfig.gemini?.topP ?? envConfig.gemini?.topP ?? defaults.gemini.topP,
                maxOutputTokens: fileConfig.gemini?.maxOutputTokens ?? envConfig.gemini?.maxOutputTokens ?? defaults.gemini.maxOutputTokens,
            },
            logging: {
                level: options.logLevel || fileConfig.logging?.level || envConfig.logging?.level || defaults.logging.level,
                saveLogs: fileConfig.logging?.saveLogs ?? envConfig.logging?.saveLogs ?? defaults.logging.saveLogs,
                logDir: fileConfig.logging?.logDir || envConfig.logging?.logDir || defaults.logging.logDir,
            },
        };
    }

    /**
     * Validate configuration
     */
    private validate(config: GeneratorConfig): void {
        if (!config.inputPath && !config.dryRun) {
            throw new Error('Input path is required. Use --input or --s3 option');
        }

        if (!config.skipRefactor && !config.gemini.apiKey) {
            throw new Error('GEMINI_API_KEY environment variable is required for refactoring');
        }

        if (!config.outputPath) {
            throw new Error('Output path is required. Use --output option');
        }
    }

    /**
     * Initialize configuration file
     */
    public async init(options: any): Promise<void> {
        const errScope = 'init()';
        _log(NS, errScope, options);

        const configPath = path.join(process.cwd(), '.mono-gen.json');

        if (fs.existsSync(configPath)) {
            _err(NS, 'Config file already exists:', configPath);
            throw new Error('Config file already exists');
        }

        const template: Partial<GeneratorConfig> = {
            projectName: 'my-monorepo',
            outputPath: './output',
            template: options.template || 'default',
            dryRun: false,
            skipRefactor: false,
            gemini: {
                apiKey: '${GEMINI_API_KEY}',
                model: 'gemini-2.0-flash-exp',
                temperature: 0.8,
                topP: 0.95,
                maxOutputTokens: 8192,
            },
            logging: {
                level: 'info',
                saveLogs: true,
                logDir: './logs',
            },
        };

        fs.writeFileSync(configPath, JSON.stringify(template, null, 2));
        _inf(NS, 'Config file created:', configPath);
    }
}

export default ConfigService;
