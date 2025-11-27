#!/usr/bin/env bun
/**
 * SOPS Age Key installation into the OS secret store
 *
 * This script collects an Age secret key for SOPS operations and stores it securely
 * using Bun's secrets API (v1.3).
 *
 * Usage: bun run sops-agekey.init.ts [--project-id <id>]
 *
 * Requires: age CLI installed for key generation option.
 *
 */

import * as prompt from '@clack/prompts';
import { secrets, $ } from 'bun';
import { parseArgs } from 'util';

const { values: argsEys } = parseArgs({
  args: process.argv.slice(2),
  options: {
    'project-id': {
      type: 'string',
      short: 'p',
    },
  },
});

const projectId = argsEys['project-id'] || process.env.REPO_PROJECT_ID
const secretName = (projectId ?  projectId + '.' : 'sops-') + 'age-key';

prompt.intro(`🔐 SOPS Age Key Setup, for secret named '${secretName}' (in service 'sops')`);

function validateAgeKey (
  value: string|undefined
): string|undefined {
  if (!value) return `No key provided`;
  const key = value.toUpperCase();
  if (!key.startsWith('AGE-SECRET-KEY-1')) {
    return 'Invalid Age key: Must start with "AGE-SECRET-KEY-1"';
  }
  const suffix = key.slice('AGE-SECRET-KEY-1'.length);
  const bech32Regex = /^[QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L]+$/; // Uppercase Bech32 charset

  if (suffix.length !== 58 || !bech32Regex.test(suffix)) {
    return 'Invalid Age key: Must be exactly 58 Bech32 characters after prefix (uppercase QPZRY9X8GF2TVDW0S3JN54KHCE6MUA7L)';
  }
  return undefined;
}

async function getExistingKey(): Promise<string | null> {
  try {
    return await secrets.get({ service: 'sops', name: secretName });
  } catch {
    return null;
  }
}

async function storeKey(key: string) {
  await secrets.set({ service: 'sops', name: secretName, value: key });
}

async function main() {
  // Display the project context if project-id was provided
  if (projectId) {
    prompt.note(`Using project ID: ${projectId}`, 'Project Context');
  }

  try {
    await $`age --version`.quiet(); // quiet to suppress output
  } catch {
    prompt.note('Warning: "age" CLI not detected. Generation option will fail. Install via brew/apt/etc.', 'Dependency Check');
  }

  const action = await prompt.select({
    message: 'How would you like to provide the Age secret key?',
    options: [
      { value: 'generate', label: 'Generate a new keypair' },
      { value: 'manual', label: 'Enter manually' },
      { value: 'file', label: 'Load from file' },
    ],
    initialValue: 'generate' as const,
  });

  if (prompt.isCancel(action)) {
    prompt.cancel('Operation cancelled.');
    process.exit(0);
  }

  let key: string = '';

  if (action === 'generate') {
    const spinner = prompt.spinner();
    spinner.start('Generating new Age keypair...');

    try {
      const result = await $`age-keygen`.nothrow(); // nothrow to handle non-zero exit gracefully
      if (result.exitCode !== 0) {
        throw new Error(result.stderr.toString().trim() || 'Unknown error');
      }
      // Combine stdout and stderr as age-keygen may print to both
      const fullOutput = result.stdout.toString() + '\n' + result.stderr.toString();
      const lines = fullOutput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      
      // Find the secret key line (starts with AGE-SECRET-KEY-1)
      const secretLine = lines.find(l => l.startsWith('AGE-SECRET-KEY-1'));
      if (!secretLine) {
        throw new Error('Could not parse secret key from age-keygen output');
      }
      key = secretLine;
      
      // Find the public key (starts with 'age1')
      const publicKeyLine = lines.find(l => l.startsWith('age1'));
      const publicKey = publicKeyLine || '';

      const validationResult = validateAgeKey(key);
      if (validationResult) {
        spinner.stop('Generation failed.');
        prompt.outro(`Generated key did not pass validation: ${validationResult}`);
        process.exit(1);
      }

      spinner.stop('Keypair generated.');

      prompt.note(`Public key (save this for SOPS config, e.g., .sops.yaml):\n${publicKey}`, 'Important');

      const shouldStore = await prompt.confirm({ message: `Generated key (starts with AGE-SECRET-KEY-1...). Store it?` });
      if (prompt.isCancel(shouldStore) || !shouldStore) {
        prompt.cancel('Operation cancelled.');
        process.exit(0);
      }
    } catch (error) {
      spinner.stop('Generation failed.');
      prompt.outro(`Failed to generate key: ${(error as Error).message}. Ensure 'age' CLI is installed.`);
      process.exit(1);
    }
  } else 
    if (action === 'manual') {
      key = await prompt.text({
        message: 'Paste your AGE secret key (AGE-SECRET-KEY-1...)',
        validate: validateAgeKey,
        placeholder: "AGE-SECRET-KEY-1QD5F5F0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV5G0YGV",
      }) as string;

      if (prompt.isCancel(key)) {
        prompt.cancel('Operation cancelled.');
        process.exit(0);
      }
  } else 
    if (action === 'file') {
      const filePath = await prompt.text({ message: 'Path to Age key file:' }) as string;

      if (prompt.isCancel(filePath)) {
        prompt.cancel('Operation cancelled.');
        process.exit(0);
      }
      try {
        key = (await Bun.file(filePath).text()).trim();
        if (validateAgeKey(key) !== undefined) {
          throw new Error('Invalid key in file');
        }
      } catch (error) {
        prompt.outro(`Failed to read file: ${(error as Error).message}`);
        process.exit(1);
      }
  }

  // Check if exists
  const existing = await getExistingKey();
  if (existing) {
    const overwrite = await prompt.confirm({
      message: 'An Age key is already stored. Overwrite it?',
      initialValue: false,
    });

    if (prompt.isCancel(overwrite)) {
      prompt.cancel('Operation cancelled.');
      process.exit(0);
    }

    if (!overwrite) {
      prompt.outro('Setup cancelled.');
      process.exit(0);
    }
  }

  try {
    await storeKey(key);
    const stored = await getExistingKey();
    if (!stored || stored.length !== key.length) {
      throw new Error('Verification failed: Key not stored correctly.');
    }
    prompt.outro(`✅ Age secret key stored and verified securely in Bun secrets as "${secretName}".`);
  } catch (error) {
    prompt.outro(`❌ Failed to store key: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) {
  main().catch(console.error);
}