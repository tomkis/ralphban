import { spawn } from 'child_process';

export interface GitValidationResult {
  valid: boolean;
  errors: string[];
}

function execGit(args: string[], cwd?: string): Promise<{ success: boolean; output: string }> {
  return new Promise((resolve) => {
    const child = spawn('git', args, {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    child.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    child.on('error', () => {
      resolve({ success: false, output: stderr || 'Failed to execute git command' });
    });

    child.on('close', (code) => {
      resolve({ success: code === 0, output: code === 0 ? stdout : stderr });
    });
  });
}

export async function checkIsGitRepo(cwd?: string): Promise<{ valid: boolean; error?: string }> {
  const result = await execGit(['rev-parse', '--git-dir'], cwd);
  if (!result.success) {
    return { valid: false, error: 'Not a git repository' };
  }
  return { valid: true };
}

export async function checkIsCleanWorkingTree(
  cwd?: string
): Promise<{ valid: boolean; error?: string }> {
  const result = await execGit(['status', '--porcelain'], cwd);
  if (!result.success) {
    return { valid: false, error: 'Failed to check git status' };
  }
  if (result.output.trim().length > 0) {
    return { valid: false, error: 'Working tree has uncommitted changes' };
  }
  return { valid: true };
}

export async function validateGitRepository(cwd?: string): Promise<GitValidationResult> {
  const errors: string[] = [];

  const gitRepoCheck = await checkIsGitRepo(cwd);
  if (!gitRepoCheck.valid && gitRepoCheck.error) {
    errors.push(gitRepoCheck.error);
    return { valid: false, errors };
  }

  const cleanCheck = await checkIsCleanWorkingTree(cwd);
  if (!cleanCheck.valid && cleanCheck.error) {
    errors.push(cleanCheck.error);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
