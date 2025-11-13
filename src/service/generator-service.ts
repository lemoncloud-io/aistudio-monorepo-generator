/**
 * `generator-service.ts`
 * - main generator service for monorepo transformation
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { $U, _log, _inf, _err } from '../utils/logger';
import { AbstractService } from '../cores/abstract-service';
import { ConfigService } from './config-service';
import { TemplateService } from './template-service';
import { GeminiService } from './gemini-service';
import { GenerateOptions, GeneratorConfig, RefactorResult } from '../cores/types';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const NS = $U.NS('GEN', 'green');

/**
 * class: `GeneratorService`
 */
export class GeneratorService extends AbstractService {
    public constructor(
        private readonly configService: ConfigService,
        private readonly templateService: TemplateService,
        private readonly geminiService: GeminiService
    ) {
        super('generator');
        _log(NS, 'GeneratorService()...');
    }

    /**
     * say hello()
     */
    public hello = (): string => `generator-service:${this.name}`;

    /**
     * Main generate method
     */
    public async generate(options: GenerateOptions): Promise<RefactorResult> {
        const errScope = 'generate()';
        _log(NS, errScope);

        try {
            // 1. Load and validate config
            const config = await this.configService.load(options);
            _inf(NS, '✓ Configuration loaded');

            // 2. Download from S3 or use local input
            const inputPath = await this.prepareInput(config);
            _inf(NS, '✓ Input prepared:', inputPath);

            // 3. Clone template repository
            const outputPath = await this.cloneTemplate(config);
            _inf(NS, '✓ Template cloned:', outputPath);

            // 4. Extract and organize files
            await this.extractFiles(inputPath, outputPath);
            _inf(NS, '✓ Files extracted and organized');

            // 5. Refactor backend (if not skipped)
            let backendTokens = 0;
            if (!config.skipRefactor) {
                backendTokens = await this.refactorBackend(outputPath, config);
                _inf(NS, '✓ Backend refactored');
            } else {
                _inf(NS, '⊘ Backend refactoring skipped');
            }

            // 6. Refactor frontend (if not skipped)
            let frontendTokens = 0;
            if (!config.skipRefactor) {
                frontendTokens = await this.refactorFrontend(outputPath, config);
                _inf(NS, '✓ Frontend refactored');
            } else {
                _inf(NS, '⊘ Frontend refactoring skipped');
            }

            // 7. Finalize and package
            if (!config.dryRun) {
                await this.finalize(outputPath, config);
                _inf(NS, '✓ Project finalized');
            }

            return {
                success: true,
                filesProcessed: 0, // TODO: count files
                tokensUsed: backendTokens + frontendTokens,
                dryRun: config.dryRun,
            };
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Prepare input (download from S3 or use local file)
     */
    private async prepareInput(config: GeneratorConfig): Promise<string> {
        const errScope = 'prepareInput()';
        _log(NS, errScope);

        if (config.inputPath.startsWith('s3://')) {
            // Download from S3
            _log(NS, 'Downloading from S3:', config.inputPath);
            const tempDir = path.join(process.cwd(), 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            const fileName = path.basename(config.inputPath);
            const localPath = path.join(tempDir, fileName);

            try {
                execSync(`aws s3 cp ${config.inputPath} ${localPath}`, {
                    stdio: 'pipe',
                    env: process.env,
                });
                return localPath;
            } catch (error) {
                _err(NS, 'Failed to download from S3:', error);
                throw error;
            }
        } else {
            // Use local file
            if (!fs.existsSync(config.inputPath)) {
                throw new Error(`Input file not found: ${config.inputPath}`);
            }
            return config.inputPath;
        }
    }

    /**
     * Clone monorepo template from GitHub
     */
    private async cloneTemplate(config: GeneratorConfig): Promise<string> {
        const errScope = 'cloneTemplate()';
        _log(NS, errScope);

        const templateRepo = process.env.GITHUB_TEMPLATE_REPO ||
            'https://github.com/lemoncloud-io/codes-monorepo-template.git';
        const branch = 'feat/split-service';
        const outputPath = path.resolve(config.outputPath);

        // Remove existing directory if it exists
        if (fs.existsSync(outputPath)) {
            _log(NS, 'Removing existing output directory:', outputPath);
            fs.rmSync(outputPath, { recursive: true, force: true });
        }

        try {
            _log(NS, `Cloning ${templateRepo} (branch: ${branch})...`);
            execSync(`git clone --branch ${branch} --single-branch ${templateRepo} ${outputPath}`, {
                stdio: 'pipe',
            });
            return outputPath;
        } catch (error) {
            _err(NS, 'Failed to clone template:', error);
            throw error;
        }
    }

    /**
     * Extract ZIP and organize files
     */
    private async extractFiles(inputPath: string, outputPath: string): Promise<void> {
        const errScope = 'extractFiles()';
        _log(NS, errScope);

        const sampleDir = path.join(outputPath, 'sample');

        // Create sample directory if it doesn't exist
        if (!fs.existsSync(sampleDir)) {
            fs.mkdirSync(sampleDir, { recursive: true });
        }

        // Extract ZIP file
        const fileName = path.basename(inputPath, '.zip');
        try {
            execSync(`unzip -q ${inputPath} -d ${sampleDir}`, {
                stdio: 'pipe',
            });
            _log(NS, 'ZIP extracted to:', sampleDir);

            // Check if we need to wrap flat files
            const extractedContents = fs.readdirSync(sampleDir);
            const dirs = extractedContents.filter(name =>
                fs.statSync(path.join(sampleDir, name)).isDirectory()
            );

            if (dirs.length !== 1 || extractedContents.length > 1) {
                // Wrap into a single directory
                const wrapDir = path.join(sampleDir, fileName);
                if (!fs.existsSync(wrapDir)) {
                    fs.mkdirSync(wrapDir);
                }

                extractedContents.forEach(item => {
                    if (item !== fileName) {
                        const src = path.join(sampleDir, item);
                        const dest = path.join(wrapDir, item);
                        fs.renameSync(src, dest);
                    }
                });
            }
        } catch (error) {
            _err(NS, 'Failed to extract files:', error);
            throw error;
        }
    }

    /**
     * Refactor backend code
     */
    private async refactorBackend(outputPath: string, config: GeneratorConfig): Promise<number> {
        const errScope = 'refactorBackend()';
        _log(NS, errScope);

        try {
            // Load backend prompt
            const prompts = await this.templateService.loadPrompt(config.template, 'backend');

            // Read backend files
            const backendDir = path.join(outputPath, 'apps', 'backend', 'src');
            const serviceFile = path.join(backendDir, 'services', 'geminiService.ts');

            if (!fs.existsSync(serviceFile)) {
                _log(NS, 'Backend service file not found, skipping refactoring');
                return 0;
            }

            const serviceCode = fs.readFileSync(serviceFile, 'utf-8');

            // Build user prompt with file contents
            const userPrompt = this.templateService.renderPrompt(prompts.user, {
                serviceCode,
            });

            // Call Gemini API
            const result = await this.geminiService.refactor(
                prompts.system,
                userPrompt,
                config.gemini
            );

            // Save refactored code
            if (!config.dryRun) {
                // Parse and save refactored files
                this.parseAndSaveRefactoredCode(result.content, backendDir);
            }

            // Save logs if configured
            if (config.logging.saveLogs) {
                await this.geminiService.saveLogs(
                    config.logging.logDir,
                    'backend-refactor.log',
                    {
                        systemPrompt: prompts.system,
                        userPrompt,
                        response: result.content,
                        tokensUsed: result.tokensUsed,
                    }
                );
            }

            return result.tokensUsed;
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Refactor frontend code
     */
    private async refactorFrontend(outputPath: string, config: GeneratorConfig): Promise<number> {
        const errScope = 'refactorFrontend()';
        _log(NS, errScope);

        try {
            // Load frontend prompt
            const prompts = await this.templateService.loadPrompt(config.template, 'frontend');

            // Read frontend files
            const frontendDir = path.join(outputPath, 'apps', 'frontend', 'src');
            const serviceFile = path.join(frontendDir, 'services', 'geminiService.ts');

            if (!fs.existsSync(serviceFile)) {
                _log(NS, 'Frontend service file not found, skipping refactoring');
                return 0;
            }

            const serviceCode = fs.readFileSync(serviceFile, 'utf-8');

            // Build user prompt
            const userPrompt = this.templateService.renderPrompt(prompts.user, {
                serviceCode,
            });

            // Call Gemini API
            const result = await this.geminiService.refactor(
                prompts.system,
                userPrompt,
                config.gemini
            );

            // Save refactored code
            if (!config.dryRun) {
                this.parseAndSaveRefactoredCode(result.content, frontendDir);
            }

            // Save logs if configured
            if (config.logging.saveLogs) {
                await this.geminiService.saveLogs(
                    config.logging.logDir,
                    'frontend-refactor.log',
                    {
                        systemPrompt: prompts.system,
                        userPrompt,
                        response: result.content,
                        tokensUsed: result.tokensUsed,
                    }
                );
            }

            return result.tokensUsed;
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Parse and save refactored code from Gemini response
     */
    private parseAndSaveRefactoredCode(content: string, outputDir: string): void {
        const errScope = 'parseAndSaveRefactoredCode()';
        _log(NS, errScope);

        // Parse code blocks from markdown
        const codeBlockRegex = /```(\w+)?\s*\n([\s\S]*?)```/g;
        let match;

        while ((match = codeBlockRegex.exec(content)) !== null) {
            const language = match[1] || 'typescript';
            const code = match[2];

            // Try to detect filename from comments
            const filenameMatch = code.match(/\/\/\s*(.+\.(ts|tsx|js|jsx))/);
            if (filenameMatch) {
                const filename = filenameMatch[1].trim();
                const filePath = path.join(outputDir, filename);

                // Create directory if needed
                const dir = path.dirname(filePath);
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                fs.writeFileSync(filePath, code.trim());
                _log(NS, 'Saved refactored file:', filePath);
            }
        }
    }

    /**
     * Finalize project (install dependencies, etc.)
     */
    private async finalize(outputPath: string, config: GeneratorConfig): Promise<void> {
        const errScope = 'finalize()';
        _log(NS, errScope);

        _inf(NS, 'Monorepo generated successfully!');
        _inf(NS, 'Output:', outputPath);
    }
}

export default GeneratorService;
