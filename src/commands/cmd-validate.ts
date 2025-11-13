/**
 * `cmd-validate.ts`
 * - validate command implementation
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { AbstractCommand } from '../cores/abstract-command';
import { ConfigService } from '../service/config-service';
import { GeminiService } from '../service/gemini-service';
import { $U, _log, _inf, _err } from '../utils/logger';
import chalk from 'chalk';

const NS = $U.NS('validate', 'yellow');

/**
 * class: `ValidateCommand`
 */
export class ValidateCommand extends AbstractCommand {
    public constructor(
        private readonly configService: ConfigService,
        private readonly geminiService: GeminiService
    ) {
        super('validate');
        _log(NS, 'ValidateCommand()...');
    }

    public async execute(options: any): Promise<void> {
        const errScope = 'execute()';
        _log(NS, errScope, options);

        try {
            console.log(chalk.cyan('\n🔍 Validating environment...\n'));

            // Check configuration
            console.log(chalk.white('   Checking configuration...'));
            const config = await this.configService.load({});
            console.log(chalk.green('   ✓ Configuration is valid'));

            // Check API key if requested
            if (options.checkApi) {
                console.log(chalk.white('   Checking Gemini API key...'));

                if (!config.gemini.apiKey) {
                    console.log(chalk.red('   ✗ GEMINI_API_KEY not set'));
                    throw new Error('GEMINI_API_KEY environment variable is required');
                }

                const isValid = await this.geminiService.validate(config.gemini);

                if (isValid) {
                    console.log(chalk.green('   ✓ API key is valid'));
                } else {
                    console.log(chalk.red('   ✗ API key is invalid'));
                    throw new Error('Invalid API key');
                }
            }

            console.log(chalk.green('\n✅ Validation passed!\n'));

        } catch (error) {
            this.handleError(error as Error);
        }
    }
}

export default ValidateCommand;
