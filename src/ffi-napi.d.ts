declare module '@lwahonen/ffi-napi' {
  
  export class Library {
    constructor(dllPath: string, methods: Record<string, any[]>);
    InstallHook(): void;
    UninstallHook(): void;
    SetCallback(callbackPointer: Pointer): void;
  }
  
  export type Callback = (...args: any[]) => void;
  export type Pointer = Buffer | number;
}
