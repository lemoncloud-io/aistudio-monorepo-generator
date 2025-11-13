/**
 * `cmd-generate.ts`
 * - generate command implementation
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { AbstractCommand } from '../cores/abstract-command';
import { GeneratorService } from '../service/generator-service';
import { GenerateOptions } from '../cores/types';
import { $U, _log, _inf, _suc } from '../utils/logger';
import chalk from 'chalk';

const NS = $U.NS('generate', 'green');

/**
 * class: `GenerateCommand`
 */
export class GenerateCommand extends AbstractCommand {
    public constructor(private readonly service: GeneratorService) {
        super('generate');
        _log(NS, 'GenerateCommand()...');
    }

    public async execute(options: GenerateOptions): Promise<void> {
        const errScope = 'execute()';
        _log(NS, errScope, options);

        try {
            console.log(chalk.cyan('\n🚀 AIStudio Monorepo Generator\n'));

            if (options.dryRun) {
                _inf(NS, chalk.yellow('⚠ DRY RUN MODE - No files will be created'));
            }

            // Execute generation
            const result = await this.service.generate(options);

            // Output results
            console.log(chalk.green('\n✅ Generation completed successfully!\n'));
            console.log(chalk.white('   Files processed:'), chalk.cyan(result.filesProcessed.toString()));
            console.log(chalk.white('   Tokens used:'), chalk.cyan(result.tokensUsed.toString()));

            if (result.dryRun) {
                console.log(chalk.yellow('\n   This was a dry run - no files were actually created\n'));
            } else {
                console.log(chalk.green('\n   Your monorepo is ready! 🎉\n'));
            }

        } catch (error) {
            this.handleError(error as Error);
        }
    }
}

export default GenerateCommand;
