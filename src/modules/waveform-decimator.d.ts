// TypeScript bindings for emscripten-generated code.  Automatically generated at compile time.
declare namespace RuntimeExports {
    const HEAPF32: any;
    const HEAPF64: any;
    const HEAP_DATA_VIEW: any;
    const HEAP8: any;
    const HEAPU8: any;
    const HEAP16: any;
    const HEAPU16: any;
    const HEAP32: any;
    const HEAPU32: any;
    const HEAP64: any;
    const HEAPU64: any;
}
interface WasmModule {
  _malloc(_0: number): number;
  _free(_0: number): void;
}

interface EmbindModule {
  generateDecimatedSampleData(_0: number, _1: number, _2: number): any;
  releaseDecimatedSampleData(_0: number): void;
}

export type MainModule = WasmModule & typeof RuntimeExports & EmbindModule;
export default function MainModuleFactory (options?: unknown): Promise<MainModule>;
