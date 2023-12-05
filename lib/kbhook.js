"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _KBHook_instances, _KBHook_globalCallbacks, _KBHook_keyMaps, _KBHook_keyboards, _KBHook_ffi, _KBHook_isSetting, _KBHook_settingCallback, _KBHook_monitorKeyboard, _KBHook_buildCallback, _KBHook_initFFI, _KBHook_joinKeyCombine, _KBHook_workMode, _KBHook_settingMode;
const ffi = require('@lwahonen/ffi-napi');
const path = require('path');
const { app } = require('electron'); // 引入 electron 的 app 模块
const { _keyboards, specialKeysMap } = require('../src/constant.js');
class KBHook {
    constructor(dllPath = '../kbhook.dll') {
        _KBHook_instances.add(this);
        _KBHook_globalCallbacks.set(this, []);
        _KBHook_keyMaps.set(this, {});
        _KBHook_keyboards.set(this, Object.assign({}, _keyboards));
        _KBHook_ffi.set(this, void 0);
        _KBHook_isSetting.set(this, false);
        _KBHook_settingCallback.set(this, undefined);
        try {
            __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_initFFI).call(this, dllPath);
            __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_monitorKeyboard).call(this);
        }
        catch (error) {
            console.error('Error initializing FFI:', error);
            this.destroy();
            throw error;
        }
    }
    setKey(keyStr, event = null) {
        if (event === null) {
            return delete __classPrivateFieldGet(this, _KBHook_keyMaps, "f")[keyStr];
        }
        __classPrivateFieldGet(this, _KBHook_keyMaps, "f")[keyStr] = event;
    }
    startSetMode(callback) {
        __classPrivateFieldSet(this, _KBHook_isSetting, true, "f");
        __classPrivateFieldSet(this, _KBHook_settingCallback, callback, "f");
    }
    stopSetMode() {
        __classPrivateFieldSet(this, _KBHook_isSetting, false, "f");
        __classPrivateFieldSet(this, _KBHook_settingCallback, void 0, "f");
    }
    destroy() {
        try {
            __classPrivateFieldGet(this, _KBHook_ffi, "f") && __classPrivateFieldGet(this, _KBHook_ffi, "f").UninstallHook();
            __classPrivateFieldGet(this, _KBHook_globalCallbacks, "f").length = 0;
        }
        catch (error) {
            console.error('Error disposing resources:', error);
        }
    }
}
_KBHook_globalCallbacks = new WeakMap(), _KBHook_keyMaps = new WeakMap(), _KBHook_keyboards = new WeakMap(), _KBHook_ffi = new WeakMap(), _KBHook_isSetting = new WeakMap(), _KBHook_settingCallback = new WeakMap(), _KBHook_instances = new WeakSet(), _KBHook_monitorKeyboard = function _KBHook_monitorKeyboard() {
    __classPrivateFieldGet(this, _KBHook_ffi, "f").SetCallback(__classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_buildCallback).call(this, (type, code) => {
        if (__classPrivateFieldGet(this, _KBHook_keyboards, "f")[code] === void 0)
            return;
        const isKeyDown = type === 'WM_KEYDOWN';
        __classPrivateFieldGet(this, _KBHook_keyboards, "f")[code] = isKeyDown;
        // 如果是按下则会触发组合键判定，抬起则忽略任意操作
        if (isKeyDown) {
            if (!__classPrivateFieldGet(this, _KBHook_isSetting, "f")) {
                const cb = __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_workMode).call(this);
                console.log(type, code);
                console.log(cb);
                cb !== void 0 && cb();
            }
            else {
                const { err, ret } = __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_settingMode).call(this);
                __classPrivateFieldGet(this, _KBHook_settingCallback, "f") !== void 0 && __classPrivateFieldGet(this, _KBHook_settingCallback, "f").call(this, err, ret);
            }
        }
    }));
}, _KBHook_buildCallback = function _KBHook_buildCallback(callback) {
    const ffiCallback = ffi.Callback('void', ['string', 'string'], (type, code) => callback(type, code));
    __classPrivateFieldGet(this, _KBHook_globalCallbacks, "f").push(ffiCallback);
    return ffiCallback;
}, _KBHook_initFFI = function _KBHook_initFFI(dllPath) {
    try {
        __classPrivateFieldSet(this, _KBHook_ffi, ffi.Library(dllPath, {
            InstallHook: ['void', []],
            UninstallHook: ['void', []],
            SetCallback: ['void', ['pointer']]
        }), "f");
        __classPrivateFieldGet(this, _KBHook_ffi, "f").InstallHook();
    }
    catch (error) {
        throw error;
    }
}, _KBHook_joinKeyCombine = function _KBHook_joinKeyCombine() {
    let keyArr = [];
    for (const key in __classPrivateFieldGet(this, _KBHook_keyboards, "f")) {
        if (__classPrivateFieldGet(this, _KBHook_keyboards, "f")[key]) {
            const keyName = specialKeysMap[key] || key.replace("VK_", "");
            keyArr.push(keyName);
        }
    }
    return keyArr.join('+');
}, _KBHook_workMode = function _KBHook_workMode() {
    const keyStr = __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_joinKeyCombine).call(this);
    return __classPrivateFieldGet(this, _KBHook_keyMaps, "f")[keyStr];
}, _KBHook_settingMode = function _KBHook_settingMode() {
    const keyStr = __classPrivateFieldGet(this, _KBHook_instances, "m", _KBHook_joinKeyCombine).call(this);
    if (__classPrivateFieldGet(this, _KBHook_keyMaps, "f")[keyStr] == void 0) {
        return {
            err: false,
            ret: keyStr
        };
    }
    else {
        return {
            err: true,
            ret: "按键冲突"
        };
    }
};
module.exports = KBHook;
