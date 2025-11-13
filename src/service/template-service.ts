/**
 * `template-service.ts`
 * - template management service
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { $U, _log, _inf, _err } from '../utils/logger';
import { AbstractService } from '../cores/abstract-service';
import { TemplatePreset } from '../cores/types';
import * as fs from 'fs';
import * as path from 'path';

const NS = $U.NS('TMPL', 'magenta');

/**
 * class: `TemplateService`
 */
export class TemplateService extends AbstractService {
    private readonly templatesDir: string;

    public constructor() {
        super('template');
        _log(NS, 'TemplateService()...');

        // Templates directory in the package
        this.templatesDir = path.join(__dirname, '..', 'templates');
    }

    /**
     * say hello()
     */
    public hello = (): string => `template-service:${this.name}`;

    /**
     * Load template preset
     */
    public async load(templateName: string): Promise<TemplatePreset> {
        const errScope = 'load()';
        _log(NS, errScope, templateName);

        try {
            const templatePath = path.join(this.templatesDir, templateName);

            if (!fs.existsSync(templatePath)) {
                throw new Error(`Template not found: ${templateName}`);
            }

            // Load backend preset
            const backendConfigPath = path.join(templatePath, 'backend', 'config.json');
            const backendConfig = JSON.parse(fs.readFileSync(backendConfigPath, 'utf-8'));

            // Load frontend preset
            const frontendConfigPath = path.join(templatePath, 'frontend', 'config.json');
            const frontendConfig = JSON.parse(fs.readFileSync(frontendConfigPath, 'utf-8'));

            _inf(NS, `Template loaded: ${templateName}`);

            return {
                name: templateName,
                description: backendConfig.description || `Template: ${templateName}`,
                fileMap: {
                    backend: backendConfig.fileMap || {},
                    frontend: frontendConfig.fileMap || {},
                },
                outputMap: {
                    backend: backendConfig.outputMap || {},
                    frontend: frontendConfig.outputMap || {},
                },
                optional: [...(backendConfig.optional || []), ...(frontendConfig.optional || [])],
            };
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * List available templates
     */
    public async list(): Promise<string[]> {
        const errScope = 'list()';
        _log(NS, errScope);

        try {
            if (!fs.existsSync(this.templatesDir)) {
                _log(NS, 'Templates directory not found:', this.templatesDir);
                return [];
            }

            const templates = fs.readdirSync(this.templatesDir)
                .filter(name => {
                    const templatePath = path.join(this.templatesDir, name);
                    return fs.statSync(templatePath).isDirectory();
                });

            _inf(NS, `Found ${templates.length} templates`);
            return templates;
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            return [];
        }
    }

    /**
     * Load prompt from template
     */
    public async loadPrompt(templateName: string, promptType: 'backend' | 'frontend'): Promise<{ system: string; user: string }> {
        const errScope = 'loadPrompt()';
        _log(NS, errScope, templateName, promptType);

        try {
            const promptPath = path.join(this.templatesDir, templateName, promptType);

            const systemPath = path.join(promptPath, 'system.md');
            const userPath = path.join(promptPath, 'user.md');

            const system = fs.existsSync(systemPath) ? fs.readFileSync(systemPath, 'utf-8') : '';
            const user = fs.existsSync(userPath) ? fs.readFileSync(userPath, 'utf-8') : '';

            return { system, user };
        } catch (error) {
            _err(NS, `Error in ${errScope}:`, error);
            throw error;
        }
    }

    /**
     * Render prompt with Mustache variables
     */
    public renderPrompt(template: string, variables: Record<string, string>): string {
        let rendered = template;

        // Simple variable replacement (Mustache-style)
        for (const [key, value] of Object.entries(variables)) {
            rendered = rendered.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
        }

        return rendered;
    }
}

export default TemplateService;
