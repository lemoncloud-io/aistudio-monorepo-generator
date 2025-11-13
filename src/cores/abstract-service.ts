/**
 * `abstract-service.ts`
 * - abstract base class for services
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */

/**
 * abstract class: `AbstractService`
 */
export abstract class AbstractService {
    protected constructor(protected readonly name: string) {}

    /**
     * say hello
     */
    public abstract hello(): string;
}
