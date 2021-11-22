# KRTC Web SDK

## 简介

`KRTC Web SDK` 是快手实时音视频通讯解决方案的 Web 端 SDK，它是通过 HTML 网页加载的 JavaScript 库。开发者可以使用 KRTC Web SDK 提供的 API 建立连接，控制实时音视频通话或者直播服务。

KRTC Web SDK 支持市面上主流浏览器。chrome、safari、Edge、firefox

#### krtc能力检测
[krtc能力检测](https://web-sdk.kuaishou.com/krtc/webrtc/demo/krtc/index.html)

## 安装

1. 将 `sdk/krtc-js-sdk.js` 复制到您的项目中。

## API 概要

详细 API 文档可参考：[KRTC Web SDK API 文档](/krtc/webrtc/doc/zh-cn/index.html)

- [KRTC]() 是整个 SDK 的主入口，提供创建客户端对象 Client 和创建本地流对象 LocalStream 的方法，以及浏览器兼容性检测，日志等级及日志上传控制。
- [Client]() 客户端对象，提供实时音视频通话的核心能力，包括进房 [join()]() 及退房 [leave()]()，发布本地流 [publish()]() 及停止发布本地流 [unpublish()]()，订阅远端流 [subscribe()]() 及取消订阅远端流 [unsubscribe()]()。
- [Stream]() 音视频流对象，包括本地流 [LocalStream]() 和远端流 [RemoteStream]() 对象。Stream 对象中的方法为本地流及远端流通用方法。
  - 本地流 LocalStream 通过 [KRTC.createStream]() 创建，
  - 远端流 RemoteStream 通过监听 [Client.on('stream-added')]() 事件获得。

## 模块说明

使用方法：

- 在项目工程安装包后，通过 `import KRTC from 'krtc-js-sdk.js'`;  引入该文件。
- 也可以通过 `<script src="[完整路径]/krtc-js-sdk.js"></scirpt>` 加载使用。


## ChangeLog

- [变更日志]()
