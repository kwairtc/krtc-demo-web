# KRTC Web SDK

## 简介

[KRTC Web SDK](/krtc/webrtc/doc/zh-cn/index.html) 是快手实时音视频通讯解决方案的 Web 端 SDK，它是通过 HTML 网页加载的 JavaScript 库。开发者可以使用 KRTC Web SDK 提供的 API 建立连接，控制实时音视频通话或者直播服务。

KRTC Web SDK 支持市面上主流浏览器，详情参考：[浏览器支持情况](browser.html)。

#### krtc能力检测
[krtc能力检测](https://arya.staging.kuaishou.com/krtc/index.html)

## 安装

使用 npm:
```
$ npm install krtc-js-sdk --save
```

使用 yarn:
```
$ yarn add krtc-js-sdk
```

手动下载 sdk 包：

1. 下载 [webrtc_latest.zip](krtc/webrtc/download/webrtc_latest.zip)。
2. 将 `js/krtc.js` 复制到您的项目中。

## 使用

参考下述两个教程，可快速跑通 Demo 及了解如何使用 SDK 实现基础音视频通话功能。

- [快速跑通 Demo](basic-get-started-with-demo.html)
- [基础音视频通话](basic-video-call.html)

## API 概要

详细 API 文档可参考：[KRTC Web SDK API 文档](/krtc/webrtc/doc/zh-cn/index.html)

- [KRTC]() 是整个 SDK 的主入口，提供创建客户端对象 Client 和创建本地流对象 LocalStream 的方法，以及浏览器兼容性检测，日志等级及日志上传控制。
- [Client]() 客户端对象，提供实时音视频通话的核心能力，包括进房 [join()]() 及退房 [leave()]()，发布本地流 [publish()]() 及停止发布本地流 [unpublish()]()，订阅远端流 [subscribe()]() 及取消订阅远端流 [unsubscribe()]()。
- [Stream]() 音视频流对象，包括本地流 [LocalStream]() 和远端流 [RemoteStream]() 对象。Stream 对象中的方法为本地流及远端流通用方法。
  - 本地流 LocalStream 通过 [KRTC.createStream]() 创建，
  - 远端流 RemoteStream 通过监听 [Client.on('stream-added')]() 事件获得。

## 目录结构

```
├── README.md
├── package.json
├── krtc.js // npm 包入口文件
├── krtc.esm.js // 基于 es 模块的 sdk 包
└── krtc.umd.js // 基于 umd 模块的 sdk 包
```

## 模块说明

**krtc.js**

npm 包入口文件，umd 模块类型，包含 ES6 语法，以及所有依赖包。使用方法：
- 在项目工程安装包后，通过 `import KRTC from 'krtc-js-sdk'`;  引入该文件。
- 也可以通过 `<script src="[完整路径]/krtc.js"></scirpt>` 加载使用。

**krtc.esm.js**

ES Modules 类型，包含 ES6 语法，以及所有依赖包。体积小，不支持 ES6 的浏览器无法使用。可参考 [ES6 兼容性](https://caniuse.com/?search=ES6)。


使用方法：
- 在项目工程安装包后，通过 `import KRTC from 'krtc-js-sdk/krtc.esm.js'`;  引入该文件。

**krtc.umd.js**

umd 模块类型，ES5 语法，体积大，但兼容性更好。



使用方法：

- 在项目工程安装包后，通过 `import KRTC from 'krtc-js-sdk/krtc.umd.js'`;  引入该文件。
- 也可以通过 `<script src="[完整路径]/krtc.umd.js"></scirpt>` 加载使用。


## ChangeLog

- [变更日志]()
