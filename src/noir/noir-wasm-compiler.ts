import { join } from 'path';

import { NoirDependencyManager } from './dep/dependency-manager';
import { GithubZipDependency as GithubCodeArchiveDependencyResolver } from './dep/github-zip-dependency';
import { InMemoryFileManager } from './fm/in-memory-file-manager';
import { NoirPackage } from './package';
import { initWasm, compile, initializeResolver } from './source-resolver';

/**
 * Noir Package Compiler
 */
export class NoirWasmContractCompiler {
  #projectPath: string;
  #log = (...args: any[]) => console.debug(...args);
  public constructor(projectPath: string) {
    this.#projectPath = projectPath;
  }

  /**
   * Compiles the project.
   */
  public async compile(): Promise<any[]> {
    // const cacheRoot = process.env.XDG_CACHE_HOME ?? join(process.env.HOME ?? '', '.cache');
    // const fileManager = new OnDiskFileManager(join(cacheRoot, 'noir_wasm'));
    const toml = await fetch(join(this.#projectPath, 'Nargo.toml')).then((res) => res.blob()).then((blob) => blob.arrayBuffer());
    const main = await fetch(join(this.#projectPath, 'src', 'main.nr')).then((res) => res.blob()).then((blob) => blob.arrayBuffer());

    const fileManager = new InMemoryFileManager({
      [join(this.#projectPath, 'Nargo.toml')]: new Uint8Array(toml),
      [join(this.#projectPath, 'src', 'main.nr')]: new Uint8Array(main)
    });

    const noirPackage = NoirPackage.new(this.#projectPath, fileManager);
    if (noirPackage.getType() !== 'contract') {
      throw new Error('This is not a contract project');
    }

    this.#log(`Compiling contract at ${noirPackage.getEntryPointPath()}`);

    // const dependencyResolver = new NoirDependencyResolver(fileManager);
    const dependencyManager = new NoirDependencyManager([
      // new RelativeDependencyResolver(fileManager),
      new GithubCodeArchiveDependencyResolver(fileManager),
    ]);

    await dependencyManager.recursivelyResolveDependencies(noirPackage);

    this.#log(`Dependencies: ${dependencyManager.getPackageNames().join(', ')}`);

    initializeResolver((sourceId: any) => {
      try {
        const libFile = dependencyManager.findFile(sourceId);
        const file = fileManager.readFileSync(libFile ?? sourceId, 'utf-8');
        console.log({ libFile, sourceId, found: !!file })
        return file;
      } catch (err) {
        return '';
      }
    });

    try {
      /* eslint-disable camelcase */
      await Promise.resolve(initWasm());
      const contract = await compile(noirPackage.getEntryPointPath(), true, dependencyManager.getPackageNames());
      /* eslint-enable camelcase */
      return [{ contract }];
    } catch (err) {
      this.#log('Error compiling contract', {
        err: (err as any).message,
        stack: (err as any).stack,
        diag: (err as any).diagnostics,
      });

      throw err;
    }
  }
}
