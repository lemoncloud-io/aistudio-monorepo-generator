/**
 * `cmd-list.ts`
 * - list command implementation
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { AbstractCommand } from '../cores/abstract-command';
import { TemplateService } from '../service/template-service';
import { $U, _log } from '../utils/logger';
import chalk from 'chalk';

const NS = $U.NS('list', 'cyan');

/**
 * class: `ListCommand`
 */
export class ListCommand extends AbstractCommand {
    public constructor(private readonly templateService: TemplateService) {
        super('list');
        _log(NS, 'ListCommand()...');
    }

    public async execute(options: any): Promise<void> {
        const errScope = 'execute()';
        _log(NS, errScope, options);

        try {
            const type = options.type;

            if (type === 'templates') {
                console.log(chalk.cyan('\n📋 Available templates:\n'));

                const templates = await this.templateService.list();

                if (templates.length === 0) {
                    console.log(chalk.yellow('   No templates found\n'));
                } else {
                    templates.forEach(template => {
                        console.log(chalk.white(`   • ${template}`));
                    });
                    console.log('');
                }

            } else if (type === 'presets') {
                console.log(chalk.cyan('\n📋 Available presets:\n'));
                console.log(chalk.white('   • default   - Standard monorepo with backend & frontend'));
                console.log(chalk.white('   • minimal   - Minimal setup'));
                console.log(chalk.white('   • serverless - Serverless backend with Lambda\n'));

            } else {
                console.log(chalk.red('\n❌ Unknown type:', type));
                console.log(chalk.white('   Valid types: templates, presets\n'));
            }

        } catch (error) {
            this.handleError(error as Error);
        }
    }
}

export default ListCommand;
