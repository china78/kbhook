import ffi from '@lwahonen/ffi-napi'
import { Keyboards, SpecialKeysMap } from './constant'
import type { KeyCombine } from './constant'

export class KBHook {
  #globalCallbacks: Array<any> = []
  #keyMaps: {
    [key: string]: KeyCombine
  } = {}
  #keyboards: { [key: string]: boolean } = { ...Keyboards }
  #ffi: any
  #isCapture: Boolean = false
  #captureCallback?: (err: undefined | string, ret: string) => void | undefined = undefined

  constructor(dllPath: string = '../kbhook.dll') {
    try {
      this.#instantiateFFI(dllPath)
      this.#eventLoop()
    } catch (error) {
      console.error('Error initializing FFI:', error)
      this.Destroy()
      throw error
    }
  }

  #instantiateFFI(dllPath: string) {
    try {
      this.#ffi = ffi.Library(dllPath, {
        InstallHook: ['void', []],
        UninstallHook: ['void', []],
        SetCallback: ['void', ['pointer']]
      })

      this.#ffi.InstallHook()
    } catch (error) {
      throw error
    }
  }

  #buildCallback(callback: (type: string, code: string) => void) {
    const ffiCallback = ffi.Callback('void', ['string', 'string'], (type: string, code: string) =>
      callback(type, code)
    )
    this.#globalCallbacks.push(ffiCallback)
    return ffiCallback
  }

  #joinKeyCombine(): string {
    let keyArr: Array<string> = []
    for (const key in this.#keyboards) {
      if (this.#keyboards[key]) {
        const keyName = SpecialKeysMap[key] || key.replace('VK_', '')
        keyArr.push(keyName)
      }
    }

    return keyArr.join('+')
  }

  #matchKeyCombine(): KeyCombine | undefined {
    const keyStr = this.#joinKeyCombine()
    return this.#keyMaps[keyStr]
  }

  #captureKeyCombine(): {
    err: string | undefined
    ret: string
  } {
    const keyStr = this.#joinKeyCombine()

    let err: string | undefined = undefined
    if (this.#keyMaps[keyStr] != void 0) {
      err = '按键冲突'
    }

    return {
      err,
      ret: keyStr
    }
  }

  #eventLoop() {
    this.#ffi.SetCallback(
      this.#buildCallback((type, code) => {
        if (this.#keyboards[code] === void 0) return

        const isKeyDown = type === 'WM_KEYDOWN'
        if (this.#keyboards[code] && isKeyDown) return

        // 如果是按下则会触发组合键判定，抬起则忽略任意操作
        if (this.#isCapture) {
          this.#keyboards[code] = isKeyDown
          if (isKeyDown) {
            const { err, ret } = this.#captureKeyCombine()
            if (this.#captureCallback !== void 0) {
              console.log('captureCallback', err, ret)
              this.#captureCallback(err, ret)
            }
          }
        } else {
          if (isKeyDown) {
            this.#keyboards[code] = isKeyDown
          }

          const kb = this.#matchKeyCombine()
          if (kb !== void 0) {
            console.log('kb', kb)
            if (isKeyDown) {
              kb.focus !== void 0 && kb.focus()
            } else {
              kb.blur !== void 0 && kb.blur()
            }
          }

          if (!isKeyDown) {
            this.#keyboards[code] = isKeyDown
          }
        }
      })
    )
  }

  SetKeyMap(
    keyStr: string,
    focus: Function | undefined = void 0,
    blur: Function | undefined = void 0
  ) {
    this.#keyMaps[keyStr] = {
      focus,
      blur
    }
  }

  UnsetKeyMap(keyStr: string) {
    delete this.#keyMaps[keyStr]
  }

  StartCapture(callback: (err: undefined | string, ret: string) => void | undefined) {
    this.#isCapture = true
    this.#captureCallback = callback
  }

  // 所有按键都不会阻塞，如果有，都将会被 调用
  StopAllCapture() {
    this.#isCapture = false
    this.#captureCallback = void 0
  }

  Destroy() {
    try {
      this.#ffi && this.#ffi.UninstallHook()
      this.#globalCallbacks = []
    } catch (error) {
      console.error('Error disposing resources:', error)
    }
  }
}

module.exports = KBHook
