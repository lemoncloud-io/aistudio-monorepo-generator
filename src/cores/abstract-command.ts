/**
 * `abstract-command.ts`
 * - abstract base class for commands
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { _err } from '../utils/logger';

/**
 * abstract class: `AbstractCommand`
 */
export abstract class AbstractCommand {
    protected constructor(protected readonly name: string) {}

    /**
     * execute command
     */
    public abstract execute(options: any): Promise<void>;

    /**
     * handle error
     */
    protected handleError(error: Error | any): never {
        const message = error instanceof Error ? error.message : String(error);
        _err(this.name, 'Error:', message);
        process.exit(1);
    }
}
