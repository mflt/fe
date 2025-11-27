#!/usr/bin/env bun
/**
 * SOPS SOPS_AGE_KEY_CMD definition loading with the proper project name
 * taken from REPO_PROJECT_ID
 * see .env in root
 *
 * This script collects an Age secret key for SOPS operations and stores it securely
 * using Bun's secrets API (v1.3).
 *
 * Usage: 
 * to set the SOPS_AGE_KEY_CMD in the peer shell:
 * bun --env-file=../../.env run ./sops-agekey.env-cmd.ts
 * to make it persistant in the outter shell
 * source <(bun --env-file=../../.env run ./sops-agekey.env-cmd.ts)
 * 
 * Requires: sops and age CLIs installed.
 *
 */

import os from 'os'
import { $ } from 'bun'
import { parseArgs, type ParseArgsConfig } from 'util'
import * as path from 'path'

const argsOptions: ParseArgsConfig["options"] = {
  'project-id': {
    type: 'string',
    short: 'p',
  },
  // explicitly pass the original cwd if you want
  orig_cwd: { type: "string" },
}

const { values: argsEys } = parseArgs({
  args: process.argv.slice(2),
  argsOptions,
  allowPositionals: true,
  tokens: true,
  strict: false, // tolerate unknown flags and forward them after `--`
});


if (os.platform() === 'linux') {
  const pgrep = await $`pgrep -f gnome-keyring-daemon >/dev/null`
  if (pgrep.exitCode !== 0) {
    await $`gnome-keyring-daemon --start --components=secrets --daemonize >/dev/null 2>&1`
    // @TODO implement timeout
  }
}

async function main () {

  const projectId = argsEys['project-id'] || process.env.REPO_PROJECT_ID
  const secretName = (projectId ?  projectId + '.' : 'sops-') + 'age-key';

  if (os.platform() === 'darwin') {
    process.env.SOPS_AGE_KEY_CMD = `security find-generic-password -s sops -a ${secretName} -w`
  } else {
    process.env.SOPS_AGE_KEY_CMD = `secret-tool lookup service sops account ${secretName}`
  }

  // console.log(`SOPS AGE key cmd setter: ${await $`echo $SOPS_AGE_KEY_CMD`.text()}`)
  console.log(`export SOPS_AGE_KEY_CMD='${process.env.SOPS_AGE_KEY_CMD}'`)
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
