import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateGitHubSnapshot, type GitHubSnapshot } from '../lib/github';

export function loadBuildGitHubSnapshot(): GitHubSnapshot | null {
  const targetPath = resolve(
    process.cwd(),
    process.env.GITHUB_SNAPSHOT_PATH || 'src/data/github-snapshot.json',
  );
  if (!existsSync(targetPath)) {
    return null;
  }
  try {
    const rawText = readFileSync(targetPath, 'utf8');
    const parsed: unknown = JSON.parse(rawText);
    return validateGitHubSnapshot(parsed);
  } catch {
    return null;
  }
}
