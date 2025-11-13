/**
 * `logger.ts`
 * - Logging utility with colors
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import chalk from 'chalk';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type Color = 'red' | 'green' | 'yellow' | 'blue' | 'magenta' | 'cyan' | 'white' | 'gray';

export class Logger {
    private level: LogLevel;

    constructor(level: LogLevel = 'info') {
        this.level = level;
    }

    /**
     * Create namespaced logger
     */
    public NS(namespace: string, color: Color = 'cyan'): string {
        const colorFn = chalk[color] || chalk.cyan;
        return colorFn(`[${namespace}]`);
    }

    /**
     * Log message
     */
    public log(namespace: string, ...args: any[]): void {
        if (this.shouldLog('debug')) {
            console.log(namespace, ...args);
        }
    }

    /**
     * Info message
     */
    public info(namespace: string, ...args: any[]): void {
        if (this.shouldLog('info')) {
            console.log(chalk.blue(namespace), ...args);
        }
    }

    /**
     * Warning message
     */
    public warn(namespace: string, ...args: any[]): void {
        if (this.shouldLog('warn')) {
            console.warn(chalk.yellow(namespace), ...args);
        }
    }

    /**
     * Error message
     */
    public error(namespace: string, ...args: any[]): void {
        if (this.shouldLog('error')) {
            console.error(chalk.red(namespace), ...args);
        }
    }

    /**
     * Success message
     */
    public success(namespace: string, ...args: any[]): void {
        console.log(chalk.green(namespace), ...args);
    }

    private shouldLog(level: LogLevel): boolean {
        const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.level);
    }

    public setLevel(level: LogLevel): void {
        this.level = level;
    }
}

// Singleton instance
export const $logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');

// Convenience exports
export const $U = {
    NS: (namespace: string, color: Color = 'cyan') => $logger.NS(namespace, color),
};

export const _log = (...args: any[]) => $logger.log(args[0], ...args.slice(1));
export const _inf = (...args: any[]) => $logger.info(args[0], ...args.slice(1));
export const _war = (...args: any[]) => $logger.warn(args[0], ...args.slice(1));
export const _err = (...args: any[]) => $logger.error(args[0], ...args.slice(1));
export const _suc = (...args: any[]) => $logger.success(args[0], ...args.slice(1));
