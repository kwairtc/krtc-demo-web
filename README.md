# KRTC Web SDK

## 简介

`KRTC Web SDK` 是快手实时音视频通讯解决方案的 Web 端 SDK，它是通过 HTML 网页加载的 JavaScript 库。开发者可以使用 KRTC Web SDK 提供的 API 建立连接，控制实时音视频通话或者直播服务。

KRTC Web SDK 支持市面上主流浏览器。chrome、safari、Edge、firefox

#### krtc能力检测
[krtc能力检测](https://web-sdk.kuaishou.com/krtc/webrtc/demo/krtc/index.html)

## 示例项目（demo）

| 特性     | 示例项目位置 |
| -------- | ------------ |
| 视频通话 | `base-js`  |


### 如何运行示例项目
- 你必须使用 SDK 支持的浏览器运行示例项目。关于支持的浏览器列表参考 

1. 导航至 `base-js` 。
   - 通过RTC控制台获取`appId`和`token`。
   - demo中配置`appId`、`Token`。
   - 页面输入`uid`和`channelId`。
   - 按步骤操作 `init` ---> `join` ----> `publish`,即可开启摄像头，发布本地媒体流。 
   - 远端用户同样操作，只要`channelId`一致，`uid`唯一即可。远端用户加入频道会默认订阅频道内其他用户的媒体流。

2. 具体 SDK 调用参考API文档，也可参考demo。


## 安装

1. 将 `sdk/krtc-js-sdk.js` 复制到您的项目中。

使用方法：

- 在项目工程安装包后，通过 `import KRTC from 'krtc-js-sdk.js'`;  引入该文件。
- 也可以通过 `<script src="[完整路径]/krtc-js-sdk.js"></scirpt>` 加载使用。



