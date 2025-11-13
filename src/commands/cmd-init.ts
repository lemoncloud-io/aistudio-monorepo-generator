/**
 * `cmd-init.ts`
 * - init command implementation
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { AbstractCommand } from '../cores/abstract-command';
import { ConfigService } from '../service/config-service';
import { TemplateService } from '../service/template-service';
import { $U, _log, _inf } from '../utils/logger';
import chalk from 'chalk';

const NS = $U.NS('init', 'blue');

/**
 * class: `InitCommand`
 */
export class InitCommand extends AbstractCommand {
    public constructor(
        private readonly configService: ConfigService,
        private readonly templateService: TemplateService
    ) {
        super('init');
        _log(NS, 'InitCommand()...');
    }

    public async execute(options: any): Promise<void> {
        const errScope = 'execute()';
        _log(NS, errScope, options);

        try {
            console.log(chalk.cyan('\n📝 Initializing configuration...\n'));

            // Initialize config file
            await this.configService.init(options);

            console.log(chalk.green('✅ Configuration file created: .mono-gen.json\n'));
            console.log(chalk.white('   Edit the file to customize your settings'));
            console.log(chalk.white('   Then run: mono-gen generate --config .mono-gen.json\n'));

        } catch (error) {
            this.handleError(error as Error);
        }
    }
}

export default InitCommand;
