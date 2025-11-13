/**
 * `gemini-service.ts`
 * - Gemini API service
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { $U, _log, _inf, _err } from '../utils/logger';
import { AbstractService } from '../cores/abstract-service';
import { GeminiConfig } from '../cores/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

const NS = $U.NS('GMNI', 'yellow');

/**
 * class: `GeminiService`
 */
export class GeminiService extends AbstractService {
    private client: GoogleGenerativeAI | null = null;

    public constructor() {
        super('gemini');
        _log(NS, 'GeminiService()...');
    }

    /**
     * say hello()
     */
    public hello = (): string => `gemini-service:${this.name}`;

    /**
     * Initialize Gemini client
     */
    private initClient(config: GeminiConfig): void {
        if (!this.client || this.client !== null) {
            this.client = new GoogleGenerativeAI(config.apiKey);
            _log(NS, 'Gemini client initialized');
        }
    }

    /**
     * Validate API key
     */
    public async validate(config: GeminiConfig): Promise<boolean> {
        const errScope = 'validate()';
        _log(NS, errScope);

        try {
            this.initClient(config);

            const model = this.client!.getGenerativeModel({ model: config.model });
            const result = await model.generateContent('Hello');

            _inf(NS, 'API key is valid');
            return true;
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            return false;
        }
    }

    /**
     * Refactor code using Gemini API
     */
    public async refactor(
        systemPrompt: string,
        userPrompt: string,
        config: GeminiConfig
    ): Promise<{ content: string; tokensUsed: number }> {
        const errScope = 'refactor()';
        _log(NS, errScope);

        try {
            this.initClient(config);

            const model = this.client!.getGenerativeModel({
                model: config.model,
                systemInstruction: systemPrompt,
            });

            _log(NS, 'Calling Gemini API...');
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                generationConfig: {
                    temperature: config.temperature,
                    topP: config.topP,
                    maxOutputTokens: config.maxOutputTokens,
                },
            });

            const response = result.response;
            const content = response.text();
            const tokensUsed = response.usageMetadata?.totalTokenCount || 0;

            _inf(NS, `Refactoring completed. Tokens used: ${tokensUsed}`);

            return { content, tokensUsed };
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Save API logs
     */
    public async saveLogs(
        logDir: string,
        fileName: string,
        data: {
            systemPrompt: string;
            userPrompt: string;
            response: string;
            tokensUsed: number;
        }
    ): Promise<void> {
        const errScope = 'saveLogs()';
        _log(NS, errScope);

        try {
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const logPath = path.join(logDir, fileName);
            const logContent = JSON.stringify(data, null, 2);

            fs.writeFileSync(logPath, logContent);
            _log(NS, `Logs saved to: ${logPath}`);
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
        }
    }
}

export default GeminiService;
