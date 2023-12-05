/// <reference types="electron" />
declare const ffi: any;
declare const path: any;
declare const app: Electron.App;
declare const _keyboards: any, specialKeysMap: any;
declare class KBHook {
    #private;
    constructor(dllPath?: string);
    setKey(keyStr: string, event?: Function | null): boolean | undefined;
    startSetMode(callback: Function | undefined): void;
    stopSetMode(): void;
    destroy(): void;
}
