import { resolve } from 'path';

import { FileManager } from '../fm/file-manager';
import { NoirDependencyConfig } from '../package-config';
import { NoirPackage } from '../package';
import { DependencyResolver } from './dependency-resolver';

/**
 * asd
 */
export class RelativeDependencyResolver implements DependencyResolver {
  #fm: FileManager;

  constructor(fm: FileManager) {
    this.#fm = fm;
  }

  resolveDependency(pkg: NoirPackage, config: NoirDependencyConfig): Promise<NoirPackage | null> {
    if ('path' in config) {
      return Promise.resolve(NoirPackage.new(resolve(pkg.getPackagePath(), config.path), this.#fm));
    } else {
      return Promise.resolve(null);
    }
  }
}
