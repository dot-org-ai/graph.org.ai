#!/usr/bin/env node
import { Command } from 'commander';

const program = new Command();

program
  .name('mdxai')
  .description('AI-driven content generation and enrichment for MDX')
  .version('0.0.1');

program
  .command('generate')
  .description('Generate new content')
  .action(async () => {
    console.log('Generating content... (Not implemented)');
  });

program
  .command('enrich')
  .description('Enrich existing data')
  .action(async () => {
    console.log('Enriching data... (Not implemented)');
  });

program.parse();
