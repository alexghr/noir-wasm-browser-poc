// Shim module to force the use of the CJS build of source-resolver, the same build used by noir_wasm
type SourceResolver = {
  initializeResolver: (resolver: (source_id: string) => string) => void;
};

type NoirWasm = {
  compile: (entrypoint: string, contract: boolean, deps: string[]) => Promise<any>;
};

import * as sourceResolver from "@noir-lang/source-resolver";
import * as noirWasm from "@noir-lang/noir_wasm";

// const sourceResolver: SourceResolver = require('@noir-lang/source-resolver');
// const noirWasm: NoirWasm = require('@noir-lang/noir_wasm');

export const initializeResolver = sourceResolver.initializeResolver;
export const initWasm = noirWasm.default;
export const compile = noirWasm.compile;
