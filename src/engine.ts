/**
 * `engine.ts`
 * - main engine to initialize services and commands
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { $U } from './utils/logger';

// Import Services
import GeneratorService from './service/generator-service';
import ConfigService from './service/config-service';
import TemplateService from './service/template-service';
import GeminiService from './service/gemini-service';

// Import Commands
import GenerateCommand from './commands/cmd-generate';
import InitCommand from './commands/cmd-init';
import ValidateCommand from './commands/cmd-validate';
import ListCommand from './commands/cmd-list';

const NS = $U.NS('engine', 'cyan');

// Initialize services
const configService = new ConfigService();
const templateService = new TemplateService();
const geminiService = new GeminiService();
const generatorService = new GeneratorService(
    configService,
    templateService,
    geminiService
);

// Create command instances with service injection
const generateCmd = new GenerateCommand(generatorService);
const initCmd = new InitCommand(configService, templateService);
const validateCmd = new ValidateCommand(configService, geminiService);
const listCmd = new ListCommand(templateService);

console.log(NS, 'Engine initialized...');

// Export engine instance
export const $engine = {
    // Services
    generatorService,
    configService,
    templateService,
    geminiService,

    // Commands
    generateCmd,
    initCmd,
    validateCmd,
    listCmd,
};

export default $engine;
