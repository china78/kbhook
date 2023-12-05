const ffi = require('@lwahonen/ffi-napi');
const { _keyboards, specialKeysMap } = require('./constant');
global.sharedObject = {
  globalCallbacks: []
}
const keyMaps = {}
const keyboards = { ..._keyboards }

const kbhookLib = ffi.Library('C:\\Users\\yuzhe\\Desktop\\kbsdk\\kbhook.dll', {
  InstallHook: ['void', []],
  UninstallHook: ['void', []],
  SetCallback: ['void', ['pointer']]
})
const setKeyMap = (keyStr, cb = null) => {
  if (cb == null) {
    return delete keyMaps[keyStr]
  }
  keyMaps[keyStr] = cb
}

const matchKeyCombine = () => {
  let keyArr = []

  for (const key in keyboards) {
    if (keyboards[key]) {
      const keyName = specialKeysMap[key] || key.replace("VK_", "");
      keyArr.push(keyName);
    }
  }

  const keyStr = keyArr.join("+")
  if (keyMaps[keyStr] && typeof keyMaps[keyStr] == "function") {
    keyMaps[keyStr]()
  }
}

kbhookLib.InstallHook()
kbhookLib.SetCallback(
  buildCallback((type, code) => {
    if (keyboards[code] === void 0) return;
    const isKeyDown = type === 'WM_KEYDOWN'; // WM_SYSKEYDOWN 还有个这个类别
    if (!keyboards[code] || !isKeyDown) {
      keyboards[code] = isKeyDown;
      console.log(type, code)
      matchKeyCombine();
    }
  })
)

setKeyMap("Z", () => {
  console.log("trigger Z")
})

setKeyMap("Ctrl+A", () => {
  console.log("ctrl+a trigger")
})

setKeyMap("Ctrl+Shift+L", () => {
  console.log('trigger Ctrl+Shift+L')
})

function buildCallback(callback) {
  const ffiCallback = ffi.Callback(
    'void', 
    ['string', 'string'], 
    (type, code) => callback(type, code)
  )
  global.sharedObject.globalCallbacks.push(ffiCallback)
  return ffiCallback
}

setInterval(() => {}, 1e3);