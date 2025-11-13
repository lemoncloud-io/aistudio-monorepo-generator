#!/usr/bin/env node
/**
 * `cli.ts`
 * - CLI entry point with Commander.js
 *
 * @author      LemonCloud
 * @date        2025-11-13
 *
 * @copyright (C) 2025 LemonCloud Co Ltd. - All Rights Reserved.
 */
import { Command } from 'commander';
import { config } from 'dotenv';
import { $logger } from './utils/logger';

// Load environment variables
config();

// Get version from package.json
const version = require('../package.json').version;

const program = new Command();

program
    .name('mono-gen')
    .description('Transform Google AIStudio React apps into production-ready monorepo')
    .version(version)
    .option('--hello', 'Say hello');

// Generate command
program
    .command('generate')
    .description('Transform AIStudio app to monorepo')
    .option('-i, --input <path>', 'Input ZIP file path')
    .option('-o, --output <path>', 'Output directory')
    .option('-s, --s3 <uri>', 'Download from S3 URI')
    .option('-t, --template <name>', 'Template to use (default|minimal|serverless)', 'default')
    .option('--dry-run', 'Preview without creating files')
    .option('--skip-refactor', 'Skip AI refactoring')
    .option('--log-level <level>', 'Log level (debug|info|warn|error)', 'info')
    .option('--interactive', 'Interactive mode')
    .action(async (options) => {
        try {
            // Set log level
            $logger.setLevel(options.logLevel || 'info');

            // Lazy load engine to avoid initialization overhead
            const { $engine } = require('./engine');
            await $engine.generateCmd.execute(options);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// Init command
program
    .command('init')
    .description('Initialize configuration file')
    .option('--interactive', 'Interactive mode')
    .option('-t, --template <name>', 'Template preset')
    .action(async (options) => {
        try {
            const { $engine } = require('./engine');
            await $engine.initCmd.execute(options);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// Validate command
program
    .command('validate')
    .description('Validate environment and configuration')
    .option('--check-api', 'Check API key validity')
    .option('--check-template', 'Validate templates')
    .action(async (options) => {
        try {
            const { $engine } = require('./engine');
            await $engine.validateCmd.execute(options);
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// List command
program
    .command('list <type>')
    .description('List available templates or presets')
    .action(async (type, options) => {
        try {
            const { $engine } = require('./engine');
            await $engine.listCmd.execute({ type, ...options });
        } catch (error) {
            console.error('Error:', error instanceof Error ? error.message : error);
            process.exit(1);
        }
    });

// Check for --hello before parsing (to handle it without command)
if (process.argv.includes('--hello')) {
    console.log('hello');
    process.exit(0);
}

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
}
