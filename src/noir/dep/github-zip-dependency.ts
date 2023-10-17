import { join, sep } from 'path';
import { unzip } from 'unzipit';

import { FileManager } from '../fm/file-manager';
import { NoirDependencyConfig, NoirGitDependencyConfig } from '../package-config';
import { NoirPackage } from '../package';
import { DependencyResolver } from './dependency-resolver';

/**
 * asd
 */
export class GithubZipDependency implements DependencyResolver {
  #fm: FileManager;
  #log = (...args: any[]) => console.debug(...args);

  constructor(fm: FileManager) {
    this.#fm = fm;
  }

  /**
   * asd
   * @param _pkg - asd
   * @param dep - asd
   * @returns asd
   */
  async resolveDependency(_pkg: NoirPackage, dep: NoirDependencyConfig): Promise<NoirPackage | null> {
    if ('git' in dep && dep.git.startsWith('https://github.com')) {
      const path = await this.#fetchRemoteDependency(dep);
      return NoirPackage.new(path, this.#fm);
    }

    return null;
  }

  async #fetchTarFromGithub(dependency: Pick<NoirGitDependencyConfig, 'git' | 'tag'>): Promise<string> {
    // TODO support actual git hosts
    // TODO git authentication
    if (!dependency.git.startsWith('https://github.com')) {
      throw new Error('Only github dependencies are supported');
    }

    const url = new URL(`${dependency.git}/archive/${dependency.tag ?? 'HEAD'}.zip`);
    // const url = new URL('https://codeload.github.com/AztecProtocol/aztec-packages/zip/refs/heads/master');
    const localArchivePath = join('archives', url.pathname.replaceAll('/', '_'));

    // TODO should check signature before accepting any file
    if (this.#fm.hasEntrySync(localArchivePath)) {
      this.#log('using cached archive', { url: url.href, path: localArchivePath });
      return localArchivePath;
    }

    const response = await fetch(`/github-mirror?archive=${encodeURIComponent(url.href)}`, {
      method: 'GET',
    });

    if (!response.ok || !response.body) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
    }

    await this.#fm.writeFile(localArchivePath, response.body);
    return localArchivePath;
  }

  async #fetchRemoteDependency(dependency: NoirGitDependencyConfig): Promise<string> {
    const archivePath = await this.#fetchTarFromGithub(dependency);
    const libPath = await this.#extractTar(dependency, archivePath);
    return libPath;
  }

  async #extractTar(dependency: NoirGitDependencyConfig, archivePath: string): Promise<string> {
    const gitUrl = new URL(dependency.git);
    const extractLocation = join('libs', gitUrl.pathname.replaceAll('/', '_') + '@' + (dependency.tag ?? 'HEAD'));
    const packagePath = join(extractLocation, dependency.directory ?? '');

    // TODO check contents before reusing old results
    if (this.#fm.hasEntrySync(packagePath)) {
      return packagePath;
    }

    const { entries } = await unzip(this.#fm.readFileSync(archivePath, 'binary'));

    for (const entry of Object.values(entries)) {
      if (entry.isDirectory) {
        continue;
      }

      const name = stripSegments(entry.name, 1);
      if (dependency.directory && !name.startsWith(dependency.directory)) {
        continue;
      }
      const path = join(extractLocation, name);
      await this.#fm.writeFile(path, (await entry.blob()).stream());
    }

    return packagePath;
  }
}

/**
 * Strips the first n segments from a path
 */
function stripSegments(path: string, count: number): string {
  const segments = path.split(sep).filter(Boolean);
  return segments.slice(count).join(sep);
}
