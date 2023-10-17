'use client';

import {NoirWasmContractCompiler} from "@/noir/noir-wasm-compiler";
import {FC, useEffect, useRef, useState} from "react";

const Compile: FC = () => {
  const [artifact, setArtifact] = useState<object | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const compiler = useRef<NoirWasmContractCompiler | null>(null);

  useEffect(() => {
    if (compiler.current) {
      return;
    }
    compiler.current = new NoirWasmContractCompiler("/contract")
  }, []);

  const handleClick = () => {
    setLoading(true);
    compiler.current?.compile().then((artifact) => {
      setLoading(false);
      setArtifact(artifact);
    });
  };

  return (
    <div>
      <h1>Compile result</h1>
      <button onClick={handleClick}>Compile</button>
      {artifact && <pre>{JSON.stringify(artifact, null, 2)}</pre>}
      {!artifact && loading && <p>Compiling...</p>}
      {!artifact && !loading && <p>Press the button to start the compilation process</p>}
    </div>
  );
};

export default Compile;
