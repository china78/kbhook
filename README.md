# kbhook SDK

kbhook 是一个用于监听和处理键盘快捷键的 JavaScript SDK。它允许你轻松定义自定义快捷键并为其分配回调函数。

## 安装

使用 npm 安装 kbhook

```bash
npm install kbhook
```

使用 yarn 安装 kbhook

```bash
yarn add kbhook
```

# 快速开始
以下是如何在您的项目中使用 kbhook 的简单示例：

```bash
const KBHook = require('kbhook');

const kbHook = new KBHook();

// 设置快捷键 Ctrl+Shift+L
kbHook.setKey('Ctrl+Shift+L', () => {
  console.log('Ctrl+Shift+L 快捷键被触发');
});

// 设置快捷键 Alt+A
kbHook.setKey('Alt+A', () => {
  console.log('Alt+A 快捷键被触发');
});

// 捕获 Ctrl+Q
kbHook.startCapture('Ctrl+Q', (err, key) => {
  err ? console.log('快捷键重复-Ctrl+Q: ', err) : console.log('key: ', key)
})

// 捕获 Ctrl+Alt+Q
kbHook.startCapture('Ctrl+Alt+Q', (err, key) => {
  err ? console.log('快捷键重复-Ctrl+Alt+Q: ', err) : console.log('key: ', key)
})

// 当不再需要快捷键功能时，清理资源
kbHook.dispose();
```
# API 参考

```bash
setKey(keyStr, callback)
设置一个快捷键及其回调函数。

keyStr (String): 快捷键的字符串表示，例如 'Ctrl+Shift+L'。
callback (Function: (err: Error | null, ret?:string) => void): 当快捷键被触发时执行的回调函数。如果传入 null 将取消该快捷键的监听。
```

```bash
startSetMode(key, callback)
开始捕获指定快捷键的操作。

key (String): 指定要捕获的快捷键字符串，例如 'Ctrl+Shift+L'。
callback (Function): 一个回调函数，接收错误对象和消息字符串。
```

```bash
destroy()
清理资源并停止所有快捷键的监听。
```

# 注意事项
请确保你有适当的权限来安装和使用依赖的原生模块。在某些情况下，可能需要管理员权限来成功安装。

# 开源许可
此项目采用 MIT 许可证，您可以在项目的 LICENSE 文件中查看许可信息。

# 贡献
欢迎开源社区的贡献和意见。如果您想贡献代码，请遵循项目的贡献指南。