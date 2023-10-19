import { NoirDependencyConfig } from '../package-config';
import { NoirPackage } from '../package';

/**
 * asd
 */
export interface DependencyResolver {
  /**
   * asd
   * @param pkg - asd
   * @param dep - asd
   */
  resolveDependency(pkg: NoirPackage, dep: NoirDependencyConfig): Promise<NoirPackage | null>;
}
