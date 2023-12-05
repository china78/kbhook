const KBHook = require('./src/kbhook');
// const ScHook = require('schook')
module.exports = KBHook;

// const scHook = new ScHook();
// scHook.setKey('Ctrl+Alt+Q', () => {
//   console.log('Shortcut Ctrl+Alt+Q pressed! ------>');
//   // recorder.dispose();
// });

// scHook.setKey('A', () => {
//   console.log('trigger A')
// })

// scHook.startCapture('Ctrl+Q', (err, key) => {
//   err ? console.log('快捷键重复-Ctrl+Q: ', err) : console.log('key: ', key)
// })

// scHook.startCapture('Ctrl+Alt+Q', (err, key) => {
//   err ? console.log('快捷键重复-Ctrl+Alt+Q: ', err) : console.log('key: ', key)
// })