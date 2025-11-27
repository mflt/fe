#!/usr/bin/env bun
/**
 *
 * Usage: 
 * bun --env-file=../.env --env-file=../.env.local run ./sops-agekey.env-cmd-wrapper.ts
 * then
 * "test-w-wrapper": "pnpm -sw sops-wrapper -- --orig_cwd=$PWD --aux_opt_name=provider.wallet --aux_opt_value=<(sops -d --input-type binary --output-type binary solana-id.json.sops) -- anchor test",
 * which calls
 * "sops-wrapper": "pnpm -s --filter @repo/scripts run with-sops-wrapper"
 * which calls
 * "with-sops-wrapper": "bun --env-file=../.env run ./sops-agekey.env-cmd-wrapper.ts"
 *
 * Requires: sops and age CLIs installed.
 *
 */

import os from 'os';
import { spawn, $ } from 'bun';
import { parseArgs, type ParseArgsConfig } from 'util'
import * as path from 'path';

const argsOptions: ParseArgsConfig["options"] = {

  // explicitly pass the original cwd if you want
  orig_cwd: { type: "string" },
  // Example: allow overriding child cwd via --cwd <path>
  cwd: { type: "string" },
  // Example: dry-run to just print what would be executed
  "dry-run": { type: "boolean" },
  aux_opt_name: { type: "string" }, // --aux_opt_name <name>
  aux_opt_value: { type: "string" } // --aux_opt_value <value>
};

const parsedArgs = parseArgs({
  args: process.argv.slice(2),
  argsOptions,
  allowPositionals: true,
  tokens: true,
  strict: false, // tolerate unknown flags and forward them after `--`
});


if (os.platform() === 'linux') {
  const pgrep = await $`pgrep -f gnome-keyring-daemon`;
  if (pgrep.exitCode !== 0) {
    await $`gnome-keyring-daemon --start --components=secrets --daemonize >/dev/null 2>&1`;
    // @TODO implement timeout
  }
}

async function main () {

  // Compute/collect any dynamic vars here
  const dynamicEnv: Record<string, string> = {
  };

  const peroProjectId = process.env.REPO_PROJECT_ID ??= 'sops-age-key';

  if (os.platform() === 'darwin') {
    dynamicEnv.SOPS_AGE_KEY_CMD = `security find-generic-password -s sops -a ${peroProjectId} -w`;
  } else {
    dynamicEnv.SOPS_AGE_KEY_CMD = `secret-tool lookup service sops account ${peroProjectId}`;
  }

  console.log(`sops wrapper: SOPS_AGE_KEY_CMD=${dynamicEnv.SOPS_AGE_KEY_CMD}`);

  const withEnv = { ...process.env, ...dynamicEnv } as Record<string, string>;


  // Everything after `--` is the command to run.
  // if `--` wasn't provided, we fallback to all positionals.
  const tokens = parsedArgs.tokens ?? [];
  const terminatorIndex = tokens.findIndex((t) => t.kind === "option-terminator");

  const cmdAfterTerminator =
    terminatorIndex >= 0
      ? tokens
          .slice(terminatorIndex + 1)
          .filter((t) => t.kind === "positional")
          .map((t) => String(t.value))
      : parsedArgs.positionals;

  if (cmdAfterTerminator.length === 0) {
    
    console.error(
      "Usage: pnpm run wrapper -- [wrapper-flags...] -- <command> [args...]\n" +
      "Examples:\n" +
      "  pnpm -s --filter repo-root-scripts run wrapper -- --aux_opt_name provider.wallet \\\n" +
      "    --aux_opt_value <(sops -d --input-type binary --output-type binary solana-id.json.sops) \\\n" +
      "    -- anchor test\n"
    );
    process.exit(1);
  }


  /**
  * Figure out the correct working directory:
  * 1) --orig_cwd flag (explicit, wins)
  * 2) ORIG_CWD environment variable (if you exported it before calling pnpm)
  * 3) INIT_CWD (when the package manager provides it)
  * 4) fallback: process.cwd() (the scripts package dir)
  */
  const argOrig = parsedArgs.values.orig_cwd as string | undefined;
  const envOrig = process.env.ORIG_CWD;
  const initCwd = process.env.INIT_CWD;

  const sourceCwdRaw = argOrig ?? envOrig ?? initCwd ?? process.cwd();
  const sourceCwd = path.resolve(sourceCwdRaw);

  // If the user also gave --cwd, resolve it against the sourceCwd
  const requestedCwd = parsedArgs.values.cwd as string | undefined;
  const userCommandCwd = requestedCwd
    ? path.resolve(sourceCwd, requestedCwd)
    : sourceCwd;

  // Prepare optional aux option injection
  const auxName = parsedArgs.values.aux_opt_name as string | undefined;
  const auxValue = parsedArgs.values.aux_opt_value as string | undefined;

  let cmd = cmdAfterTerminator.slice();
  if (auxName && auxValue) {
    const needle = `--${auxName}`;
    const alreadyPresent = cmd.some(
      (a) => a === needle || a.startsWith(`${needle}=`),
    );
    if (!alreadyPresent) {
      // Append at the end as two separate argv entries: ["--name", "value"]
      // (This preserves spaces in the value as a single argument.)
      cmd.push(needle, auxValue);
    }
  }

  // Optional dry-run
  if (parsedArgs.values["dry-run"]) {
    const shQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
    console.error(
      `[dry-run] would spawn (cwd=${userCommandCwd}):\n  ${cmd.map(shQuote).join(" ")}`
    );
    process.exit(0);
  }

  console.log('@P: ', userCommandCwd)

  const userCommand = spawn({
    cmd,
    env: withEnv,
    cwd: userCommandCwd,
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });

  const exitCode = await userCommand.exited;
  process.exit(exitCode);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
