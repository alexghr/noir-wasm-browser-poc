import { join } from 'path';

import { NoirDependencyConfig } from '../package-config';
import { NoirPackage } from '../package';
import { DependencyResolver } from './dependency-resolver';

/**
 * Noir Dependency Resolver
 */
export class NoirDependencyManager {
  dependencies = new Map<string, NoirPackage>();
  #log = (...args: any[]) => console.debug(...args);
  #resolvers: readonly DependencyResolver[];

  constructor(resolver: readonly DependencyResolver[] = []) {
    this.#resolvers = resolver;
  }

  /**
   * Resolves dependencies for a package.
   * @param noirPackage - The package to resolve dependencies for
   */
  public async recursivelyResolveDependencies(noirPackage: NoirPackage): Promise<void> {
    for (const [name, config] of Object.entries(noirPackage.getDependencies())) {
      // TODO what happens if more than one package has the same name but different versions?
      if (this.dependencies.has(name)) {
        this.#log(`skipping already resolved dependency ${name}`);
        continue;
      }

      const dependency = await this.#resolveDep(noirPackage, config);
      if (dependency.getType() !== 'lib') {
        this.#log(`Non-library package ${name}`, config);
        throw new Error(`Dependency ${name} is not a library`);
      }

      this.dependencies.set(name, dependency);

      await this.recursivelyResolveDependencies(dependency);
    }
  }

  async #resolveDep(pkg: NoirPackage, config: NoirDependencyConfig) {
    let dep: NoirPackage | null = null;
    for (const resolver of this.#resolvers) {
      dep = await resolver.resolveDependency(pkg, config);
      if (dep) {
        break;
      }
    }

    if (!dep) {
      throw new Error('Dependency not resolved');
    }

    return dep;
  }

  /**
   * Gets the names of the crates in this dependency list
   */
  public getPackageNames() {
    return [...this.dependencies.keys()];
  }

  /**
   * Looks up a dependency
   * @param sourceId - The source being resolved
   * @returns The path to the resolved file
   */
  public findFile(sourceId: string): string | null {
    const [lib, ...path] = sourceId.split('/').filter(x => x);
    const pkg = this.dependencies.get(lib);
    if (pkg) {
      return join(pkg.getSrcPath(), ...path);
    } else {
      return null;
    }
  }
}
