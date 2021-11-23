function getLocaltime() {
    return (new Date()).Format("yyyy-MM-dd hh:mm:ss.S");
};

Date.prototype.Format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

const LogPrefix = () => {
    return `[${getLocaltime()}] [AppController]`;
};

var AppController = function () {
    console.log(`${LogPrefix()} init ${document.getElementsByTagName("title")[0].innerHTML}`);
    this.localMediaStream = null;
    this.localAudioTrack = null;
    this.localVideoTrack = null;
    this.localScreenAudioTrack = null;
    this.localScreenVideoTrack = null;
    this.localUserId = null;
    this.channelId = null;
    this.remoteUsers = new Map();
    this.options = {
        appId: "", //KuaishouTest
        token: ""
    };

    try {
        document.getElementById('appId').value = this.options.appId;
        document.getElementById('token').value = this.options.token;
        let data = localStorage.getItem('appConfig');
        if (data) {
            this.options = JSON.parse(data);
            document.getElementById('appId').value = this.options.appId;
            document.getElementById('token').value = this.options.token;
        }
    } catch (error) { }
    this.isJoined = false;
    this.inited = false;
    this.videoEncoderConfigs = new Map([
        ["vga", {
            width: 640,
            height: 480,
            frameRate: 15,
            bitrateMax: 1000,
            bitrateMin: 100
        }],
        ["qvga", {
            width: 320,
            height: 240,
            frameRate: 15,
            bitrateMax: 200,
            bitrateMin: 50
        }],
        ["hd", {
            width: 1280,
            height: 720,
            frameRate: 15,
            bitrateMax: 1200,
            bitrateMin: 500
        }]]
    );
    document.getElementById("confirmBtn").onclick = this.onChangeAppIdAndToken.bind(this);
    document.getElementById("resetBtn").onclick = this.onResetAppIdAndToken.bind(this);

    this.microphoneSelect = document.getElementById("microphones");
    this.cameraSelect = document.getElementById("cameras");
    this.speakerSelect = document.getElementById("speakers");
    this.remoteUserSelect = document.getElementById("remoteUserId");
    this.mediaTypeSelect = document.getElementById("mediaTypeSel");
    this.videoConfigSelect = document.getElementById("videoConfigSel");
    this.deviceKindSelect = document.getElementById("deviceKindSel");
    this.roleSelect = document.getElementById("roleSel");
    this.streamTypeSel = document.getElementById("streamTypeSel");
    this.beautySelect = document.getElementById("beautySel");


    this.initEngineButton = document.getElementById("initEngine");
    this.openDevicesButton = document.getElementById("openDevices");
    this.closeDevicesButtton = document.getElementById("closeDevices");
    this.joinButton = document.getElementById("join");
    this.leaveButton = document.getElementById("leave");
    this.publishButton = document.getElementById("publish");
    this.unpublishButton = document.getElementById("unpublish");
    this.subscribButton = document.getElementById("subscribe");
    this.unsubscribeButton = document.getElementById("unsubscribe");
    this.getDeviceButton = document.getElementById("getDevice");
    this.getStatsButton = document.getElementById("getStats");
    this.dualStreamButton = document.getElementById("dualStream");
    this.setRemoteVideoStreamTypeButton = document.getElementById("setRemoteVideoStreamType");

    this.microphoneConfirmButton = document.getElementById("microphoneConfirm");
    this.cameraConfirmButton = document.getElementById("cameraConfirm");
    this.speackerConfirmButton = document.getElementById("speakerConfirm");
    this.settingButton = document.getElementById("setting");

    this.microphoneConfirmButton.onclick = this.onMicrophoneConfirmClicked.bind(this);
    this.cameraConfirmButton.onclick = this.onCameraConfirmClicked.bind(this);
    this.speackerConfirmButton.onclick = this.onSpeakerConfirmClicked.bind(this);

    this.settingModal = document.getElementById('settingModal');
    this.closeSpan = document.getElementsByClassName("close")[0];
    this.settingButton.onclick = () => {
        this.settingModal.style.display = "block";
    };
    this.closeSpan.onclick = () => {
        this.settingModal.style.display = "none";
    };
    window.onclick = (event) => {
        if (event.target == this.settingModal) {
            this.settingModal.style.display = "none";
        }
    };

    this.roleSelect.onchange = this.onRoleSelectChanged.bind(this);
    this.beautySelect.onchange = this.onBeautySelectChanged.bind(this);


    this.localUserIdLabel = document.getElementById("localUserId");
    this.localMicrophoneSpan = document.getElementById("localMicrophone");
    this.localCameraSpan = document.getElementById("localCamera")
    this.localMicrophoneSpan.onclick = () => {
        console.log(`${LogPrefix()} localMicrophoneSpan onclick`);
        if (this.localMicrophoneSpan.className === "iconfont icon-microphone_closed overlayMicrophone") {
            this.localMicrophoneSpan.className = "iconfont icon-microphone_opened overlayMicrophone";
            this.localAudioTrack && this.localAudioTrack.setEnabled(true);
            this.writeAryaLog(`userId:${this.localUserId} unmuted audio stream`);
        } else {
            this.localMicrophoneSpan.className = "iconfont icon-microphone_closed overlayMicrophone";
            this.localAudioTrack && this.localAudioTrack.setEnabled(false);
            this.writeAryaLog(`userId:${this.localUserId} muted audio stream`);
        }
    };
    this.localCameraSpan.onclick = () => {
        console.log(`${LogPrefix()} localCameraSpan onclick`);
        if (this.localCameraSpan.className === "iconfont icon-camera_closed overlayCamera") {
            this.localCameraSpan.className = "iconfont icon-camera_opened overlayCamera";
            this.localVideoTrack && this.localVideoTrack.setEnabled(true);
            this.writeAryaLog(`userId:${this.localUserId} unmuted video stream`);
        } else {
            this.localCameraSpan.className = "iconfont icon-camera_closed overlayCamera";
            this.localVideoTrack && this.localVideoTrack.setEnabled(false);
            this.writeAryaLog(`userId:${this.localUserId} muted video stream`);
        }
    };

    this.getStatsButton.onclick = async () => {
        // this.client.getRTCStats();
    };

    this.localUserIdInput = document.getElementById("userId");
    this.channelIdInput = document.getElementById("channelId");



    this.localVideoView = document.getElementById("localVideo");
    this.videoContainer = document.getElementById("videoContainer");

    this.aryaLogText = document.getElementById("aryaLog");
    this.debugInfoText = document.getElementById("debugInfo");

    this.defaultSubscribeCheckBox = document.getElementById("defaultSubscribe");
    this.openApiCheckBox = document.getElementById("openApi");

    this.initEngineButton.onclick = this.onInitEngineClicked.bind(this);
    this.joinButton.onclick = this.onJoinClicked.bind(this);
    this.leaveButton.onclick = this.onLeaveClicked.bind(this);
    this.publishButton.onclick = this.onPublishClicked.bind(this);
    this.unpublishButton.onclick = this.onUnpublishClicked.bind(this);
    this.subscribButton.onclick = this.onSubscribeClicked.bind(this);
    this.unsubscribeButton.onclick = this.onUnsubscribeClicked.bind(this);
    this.getDeviceButton.onclick = this.onGetDeviceClicked.bind(this);
    this.openDevicesButton.onclick = this.onOpenDeviceCliked.bind(this);
    this.closeDevicesButtton.onclick = this.onCloseDeviceClicked.bind(this);
    this.dualStreamButton.onclick = this.onDualStreamClicked.bind(this);
    this.setRemoteVideoStreamTypeButton.onclick = this.onSetRemoteVideoStreamTypeClicked.bind(this);

    this.onUserJoined = this.onUserJoined_.bind(this);
    this.onUserLeft = this.onUserLeft_.bind(this);
    this.onUserPublished = this.onUserPublished_.bind(this);
    this.onUserUnpublish = this.onUserUnpublish_.bind(this);
    this.onConnectionStateChange = this.onConnectionStateChange_.bind(this);
    this.onContentPublish = this.onContentPublish_.bind(this);
    this.onContentUnpublish = this.onContentUnpublish_.bind(this);
    this.onContentKickOff = this.onContentKickedOff_.bind(this);
    this.onTrackEnded = this.onTrackEnded_.bind(this);
    this.writeAryaLog(`init appcontroler done time:${document.getElementsByTagName("title")[0].innerHTML}`);
};

AppController.prototype.showToast = function (msg, duration) {
    var x = document.getElementById("snackbar");
    x.className = "show";
    x.innerHTML = msg;
    setTimeout(function () { x.className = x.className.replace("show", ""); }, duration);
};

AppController.prototype.onInitEngineClicked = async function () {
    console.log(`${LogPrefix()} onInitEngineClicked init engine`);
    if (this.isJoined) {
        this.showToast(`please leave channel when before initing engine because user has joined room`, 2000);
        this.writeAryaLog("fail to init engine");
        return;
    }
    this.writeAryaLog("init engine");
    this.getDevice("all");
    let supportedCodec = await KRTC.getSupportedCodec();
    console.log(`${LogPrefix()} supporedCodec:`, supportedCodec);
    if (Array.isArray(supportedCodec.video) && supportedCodec.video.includes("H264")) {
        this.writeAryaLog("init engine system support 264");
        this.supportH264 = true;
    }
    KRTC.onMicrophoneChanged = (deviceInfo) => {
        this.writeAryaLog(`microphone state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.microphoneSelect, deviceInfo);
    };

    KRTC.onCameraChanged = (deviceInfo) => {
        this.writeAryaLog(`camera state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.cameraSelect, deviceInfo);
    };

    KRTC.onPlaybackDeviceChanged = (deviceInfo) => {
        this.writeAryaLog(`playback state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        this.onDeviceChanged(this.speakerSelect, deviceInfo);
    };

    KRTC.onDefaultSpeakerChanged = (deviceInfo) => {
        this.writeAryaLog(`default speaker state is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        let elementId = `${deviceInfo.device.deviceId}_${deviceInfo.device.kind}`;
        let deviceElement = document.getElementById(elementId);
        if (deviceElement !== null) {
            if (this.speakerSelect.value === "default") {
                this.remoteUsers.forEach(async (remoteUser) => {
                    if (remoteUser.audioTrack !== undefined) {
                        try {
                            await remoteUser.audioTrack.setPlaybackDevice(this.speakerSelect.value);
                            console.log(`${LogPrefix()} onDefaultSpeakerChanged setPlaybackDevice success user:${remoteUser.uid}`);
                        } catch (error) {
                            console.log(`${LogPrefix()} onDefaultSpeakerChanged setPlaybackDevice fail error:${error} user:${remoteUser.uid}`);
                        }
                    }
                });
            }
            deviceElement.value = deviceInfo.device.deviceId;
            deviceElement.innerHTML = deviceInfo.device.label;
        }
    };

    KRTC.onDefaultMicrophoneChanged = async (deviceInfo) => {
        this.writeAryaLog(`default microphone is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        let elementId = `${deviceInfo.device.deviceId}_${deviceInfo.device.kind}`;
        let deviceElement = document.getElementById(elementId);
        if (deviceElement !== null) {
            if (this.microphoneSelect.value === "default") {
                if (this.localAudioTrack) {
                    try {
                        await this.localAudioTrack.setDevice(deviceInfo.device.deviceId);
                        this.writeAryaLog(`set microphone device:${this.microphoneSelect.value} success`);
                    } catch (error) {
                        console.log(`${LogPrefix()} onDefaultMicrophoneChanged setDevice fail error:${error}`);
                    }

                }
            }
            deviceElement.value = deviceInfo.device.deviceId;
            deviceElement.innerHTML = deviceInfo.device.label;
        }
    };

    KRTC.onCommunicationSpeakerChanged = (deviceInfo) => {
        this.writeAryaLog(`communication speaker is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        let elementId = `${deviceInfo.device.deviceId}_${deviceInfo.device.kind}`;
        let deviceElement = document.getElementById(elementId);
        if (deviceElement !== null) {
            deviceElement.value = deviceInfo.device.label;
            deviceElement.innerHTML = deviceInfo.device.label;
        }
    };

    KRTC.onCommunicationMicrophoneChanged = (deviceInfo) => {
        this.writeAryaLog(`communication microphone is changed label:${deviceInfo.device.label} state:${deviceInfo.state}`);
        let elementId = `${deviceInfo.device.deviceId}_${deviceInfo.device.kind}`;
        let deviceElement = document.getElementById(elementId);
        if (deviceElement !== null) {
            deviceElement.value = deviceInfo.device.label;
            deviceElement.innerHTML = deviceInfo.device.label;
        }
    };

    this.client = KRTC.createClient();
    this.inited = true;
};

AppController.prototype.onChangeAppIdAndToken = function () {
    this.options = {
        appId: document.getElementById('appId').value, //KuaishouTest
        token: document.getElementById('token').value
    };
    
    localStorage.setItem('appConfig', JSON.stringify(this.options))
};

AppController.prototype.onResetAppIdAndToken = function () {
    this.options = {
        appId: "", //KuaishouTest
        token: ""
    };
    document.getElementById('appId').value = this.options.appId;
    document.getElementById('token').value = this.options.token;
    localStorage.removeItem('appConfig')
};

AppController.prototype.onOpenDeviceCliked = async function () {
    try {
        await this.openDevice();
    } catch (error) {
        this.writeAryaLog(`open devices fail error:${error}`);
        return;
    }
};

AppController.prototype.onCloseDeviceClicked = function () {
    console.log(`${LogPrefix()} onCloseDeviceClicked`);
    this.closeDevice();
};

AppController.prototype.closeDevice = function () {
    console.log(`${LogPrefix()} close devices start audio:${this.localAudioTrack} video:${this.localVideoTrack}`);
    if (this.localAudioTrack) {
        this.localAudioTrack.close();
        this.localAudioTrack = null;
    }
    if (this.localVideoTrack) {
        this.localVideoTrack.close();
        this.localVideoTrack = null;
    }
    if (this.localScreenVideoTrack) {
        this.removeScreenDisplayElement();
        this.localScreenVideoTrack.close();
        this.localScreenVideoTrack = null;
    }
    this.localCameraSpan.className = "iconfont icon-camera_opened overlayCamera";
    this.localMicrophoneSpan.className = "iconfont icon-microphone_opened overlayMicrophone";
    console.log(`${LogPrefix()} close devices end`);
};

AppController.prototype.onJoinClicked = function () {
    if (!this.inited) {
        this.showToast(`init engine before joining channel`, 2000);
        return;
    }
    if (this.openApiCheckBox.checked) {
        this.client.enbleOpenApi();
    } else {
        this.client.disableOpenApi();
    }
    console.log(`${LogPrefix()} onJoinClicked, "userid:`, this.localUserIdInput.value, "channel id:", this.channelIdInput.value);
    if (this.localUserIdInput.value.length === 0 || this.channelIdInput.value.length === 0) {
        this.showToast(`invaild userId:${this.localUserIdInput.value} or channelId:${this.channelIdInput.value}`, 1000);
        return;
    }
    if (this.isJoined) {
        this.showToast(`user has joined`, 1000);
        return;
    }
    this.localUserId = this.localUserIdInput.value;
    this.channelId = this.channelIdInput.value;
    this.localUserIdLabel.innerHTML = this.localUserId;
    this.client.on("user-published", this.onUserPublished);
    this.client.on("user-unpublished", this.onUserUnpublish);
    this.client.on("user-joined", this.onUserJoined);
    this.client.on("user-left", this.onUserLeft);
    this.client.on("connection-state-change", this.onConnectionStateChange);
    this.client.on("content-published", this.onContentPublish);
    this.client.on("content-unpublished", this.onContentUnpublish);
    this.client.on("content-kicked-off", this.onContentKickOff);
    this.client.join(this.options.appId, this.channelId, this.options.token, this.localUserId).then((uid) => {
        this.isJoined = true;
        this.writeAryaLog(`userId:${this.localUserId} join channel:${this.channelId} success`);
        this.showToast(`${this.localUserId} join channel:${this.channelId} success`, 1000);
    }).catch((err) => {
        this.writeAryaLog(`userId:${this.localUserId} join channel:${this.channelId} fail ${err}`);
        this.showToast(`${this.localUserId} join channel:${this.channelId} fail`, 1000);
    });
};

AppController.prototype.onLeaveClicked = async function () {
    console.log(`${LogPrefix()} OnLeaveClicked", "userid:`, this.localUserId, "channel id:", this.channelId);
    if (this.localUserIdInput.value !== this.localUserId || this.channelId !== this.channelIdInput.value) {
        this.showToast(`invaild userid:${this.localUserIdInput.value} channelId:${this.channelIdInput.value}`, 1000);
        return;
    }
    if (!this.isJoined) {
        this.showToast(`user has not joined`, 1000);
        return;
    }
    try {
        await this.client.leave();
        this.writeAryaLog(`user:${this.localUserId} leave channel:${this.channelId} success`);
        this.showToast(`${this.localUserId} leave channel:${this.channelId} success`, 1000);
    } catch (error) {
        this.writeAryaLog(`user:${this.localUserId} leave channel:${this.channelId} fail`);
        this.showToast(`${this.localUserId} leave channel:${this.channelId} fail`, 1000);
    }
    this.stop();
    this.closeDevice();
    console.log(`${LogPrefix()} OnLeaveClicked end`);
    // this.localUserIdInput.value = "";
    // this.channelIdInput.value = "";
};

AppController.prototype.onConnectionStateChange_ = function (curState, revState, reason) {
    this.writeAryaLog(`onConnectionStateChange curState:${curState} revState:${revState} reason:${reason}`);
    if (curState === "DISCONNECTED" && reason === "UID_BANNED") {
        this.stop();
        this.showToast(`${this.localUserId} is kicked out`, 1000);
    }
};

AppController.prototype.onPublishClicked = async function () {
    console.log(`${LogPrefix()} onPublishClicked`);
    if (!this.isJoined) {
        console.log(`${LogPrefix()} onPublishClicked user is not in channel`);
        this.writeAryaLog(`publish fail because of user is not in channel`);
        this.showToast(`publish fail because user is not in channel`, 1000);
        return;
    }
    if (this.roleSelect.value === "audience") {
        console.warn(`${LogPrefix()} onPublishClicked publish is not allowed when role is the audience`);
        this.writeAryaLog(`fail to publish because user is audience`);
        return;
    }
    let mediaType = this.mediaTypeSelect.value;
    if (!this.supportH264 && (mediaType === "av" || mediaType === "video")) {
        this.writeAryaLog(`publish failed because system can not support h264`);
        this.showToast(`publish fail because system can not support h264`, 1000);
        return;
    }
    let tracks = null;
    try {
        switch (mediaType) {
            case "av":
                await this.openDevice();
                tracks = [this.localAudioTrack, this.localVideoTrack];
                break;
            case "video":
                await this.openDevice();
                tracks = this.localVideoTrack;
                break;
            case "audio":
                await this.openDevice();
                tracks = this.localAudioTrack;
                break;
            case "screen":
                if (this.localScreenVideoTrack) {
                    this.writeAryaLog(`screen has been published`);
                    console.warn(`${LogPrefix()} onPublishClicked screen has been published`);
                    return;
                }
                await this.createScreenTrack();
                tracks = this.localScreenVideoTrack;
                break;
            case "screenWithAudio":
                await this.createScreenTrack();
                tracks = [this.localScreenAudioTrack, this.localScreenVideoTrack];
                break;
        }
    } catch (error) {
        console.warn(`${LogPrefix()} onPublishClicked fail to open device because of error:${error}`);
        this.writeAryaLog(`open devices failed error:${error}`);
        return;
    }
    this.client.publish(tracks).then(() => {
        this.writeAryaLog(`publish ${mediaType} track success`);
    }).catch((error) => this.writeAryaLog(`publish ${mediaType} track fail err:${error}`));
};

AppController.prototype.onUnpublishClicked = function () {
    console.log(`${LogPrefix()} [AppController] onUnpublishClicked`);
    if (!this.isJoined) {
        console.log(`${LogPrefix()} onUnpublishClicked user is not in channel`);
        this.writeAryaLog(`unpublish fail because of user is not in channel`);
        this.showToast(`unpublish fail because of user is not in channel`, 1000);
        return;
    }
    let mediaType = this.mediaTypeSelect.value;
    let tracks = null;
    switch (mediaType) {
        case "av":
            tracks = [this.localAudioTrack, this.localVideoTrack];
            break;
        case "video":
            tracks = this.localVideoTrack;
            break;
        case "audio":
            tracks = this.localAudioTrack;
            break;
        case "screen":
            tracks = this.localScreenVideoTrack;
            this.localScreenVideoTrack && this.localScreenVideoTrack.close();
            break;
        case "screenWithAudio":
            tracks = [this.localScreenAudioTrack, this.localScreenVideoTrack];
            this.localScreenVideoTrack && this.localScreenVideoTrack.close();
            this.localAudioTrack.close();
            break;
    }
    this.client.unpublish(tracks).then(() => {
        this.writeAryaLog(`unpublish ${mediaType} track success`);

    }).catch((err) => this.writeAryaLog(`unpublish ${mediaType} track fail err:${err}`));
    if (mediaType === "screen") {
        this.removeScreenDisplayElement();
        if (this.localScreenVideoTrack) {
            this.localScreenVideoTrack.off("track-ended", this.onTrackEnded);
            this.localScreenVideoTrack = null;
        }
    } else if (mediaType === "screenWithAudio") {
    }
};

AppController.prototype.onSubscribeClicked = function () {
    let uid = this.remoteUserSelect.value;
    let mediaType = this.mediaTypeSelect.value
    console.log(`${LogPrefix()} onSubscribeClicked userId:`, uid, "mediaType:", mediaType);
    this.subScribe_(uid, mediaType);
};

AppController.prototype.subScribe_ = function (uid, mediaType) {
    let remoteUser = this.remoteUsers.get(uid);
    if (remoteUser === undefined) {
        console.log(`${LogPrefix()} subscribe user is not in channel`);
        return;
    }
    if ((mediaType === "audio" && remoteUser.hasAudio) || (mediaType === "video" && remoteUser.hasVideo)) {
        this.client.subscribe(remoteUser, mediaType).then((track) => {
            this.writeAryaLog(`subscribe userId:${remoteUser.uid} mediaType:${mediaType} success`);
            if (mediaType === "audio") {
                track.play();
            } else {
                this.addRemoteVideoTrack(track);
            }
        }).catch(e => console.log(`${LogPrefix()} subscribe userId:${uid} mediaType:${mediaType} error:${e}`));
    } else if (mediaType === "av") {
        this.subScribe_(uid, "audio");
        this.subScribe_(uid, "video");
    } else {
        this.writeAryaLog(`subscribe userId:${remoteUser.uid} mediaType:${mediaType} user does not has ${mediaType}`);
    }
};

AppController.prototype.onUnsubscribeClicked = function () {
    console.log(`${LogPrefix()} onUnSubcribeClicked`);
    let uid = this.remoteUserSelect.value;
    let mediaType = this.mediaTypeSelect.value;
    this.unsubscribe_(uid, mediaType);
};

AppController.prototype.unsubscribe_ = function (uid, mediaType) {
    let remoteUser = this.remoteUsers.get(uid);
    if (remoteUser === undefined) {
        console.log(`${LogPrefix()} subscribe user is not in channel`);
        return;
    }
    if (mediaType === "audio" || mediaType === "video") {
        this.client.unsubscribe(remoteUser, mediaType).then(() => {
            this.writeAryaLog(`unsubscribe userId:${remoteUser.uid} mediaType:${mediaType} success`);
            if (mediaType === "video") {
                this.removeRemoteVideoTrack(uid, "people");
            }
        }).catch((e) => {
            this.writeAryaLog(`unsubscribe userId:${remoteUser.uid} mediaType:${mediaType} fail err:${e}`);
        });
    } else if (mediaType === "av") {
        this.unsubscribe_(uid, "audio");
        this.unsubscribe_(uid, "video");
    }
};

AppController.prototype.onGetDeviceClicked = async function () {
    console.log(`${LogPrefix()} onGetDeviceClicked`);
    this.getDevice(this.deviceKindSelect.value);
};

AppController.prototype.onSpeakerConfirmClicked = async function () {
    if (this.speakerSelect.options.length === 0) {
        this.showToast(`speaker devices is empty`, 2000);
        return;
    }
    let selectedIndex = this.speakerSelect.selectedIndex;
    console.log(`${LogPrefix()} onSpeakerConfirmClicked label:${this.speakerSelect.options[selectedIndex].text}`);
    if (this.speakerSelect.value !== undefined) {
        this.remoteUsers.forEach(async (remoteUser) => {
            if (remoteUser.audioTrack !== undefined) {
                try {
                    await remoteUser.audioTrack.setPlaybackDevice(this.speakerSelect.value);
                    console.log(`${LogPrefix()} onSpeakerConfirmClicked setPlaybackDevice success user:${remoteUser.uid}`);
                } catch (error) {
                    console.log(`${LogPrefix()} onSpeakerConfirmClicked setPlaybackDevice failed error:${error} user:${remoteUser.uid}`);
                }
            }
        });
        if (this.localAudioTrack) {
            try {
                await this.localAudioTrack.setPlaybackDevice(this.speakerSelect.value);
            } catch (error) {
                console.log(`${LogPrefix()} onSpeakerConfirmClicked setPlaybackDevice fail to set playback device for local audio track error:${error}`);
            }
        }
    }
};

AppController.prototype.onMicrophoneConfirmClicked = async function () {
    if (this.microphoneSelect.options.length === 0) {
        this.showToast(`microphone devices is empty`, 2000);
        return;
    }
    let selectedIndex = this.microphoneSelect.selectedIndex;
    console.log(`${LogPrefix()} onMicrophoneConfirmClicked label:${this.microphoneSelect.options[selectedIndex].text}`);
    try {
        if (this.localAudioTrack) {
            await this.localAudioTrack.setDevice(this.microphoneSelect.value);
            // this.localMicrophoneSpan.className = "iconfont icon-microphone_opened overlayMicrophone";
            console.log(`${LogPrefix()} onMicrophoneConfirmClicked setDevice success`);
            this.writeAryaLog(`set microphone device:${this.microphoneSelect.value} success`);
        }
    } catch (error) {
        console.log(`${LogPrefix()} onMicrophoneConfirmClicked setDevice fail error:${error}`);
    }
};

AppController.prototype.onCameraConfirmClicked = async function () {
    if (this.cameraSelect.options.length === 0) {
        this.showToast(`camera devices is empty`, 2000);
        return;
    }
    let selectedIndex = this.cameraSelect.selectedIndex;
    console.log(`${LogPrefix()} onCameraConfirmClicked label:${this.cameraSelect.options[selectedIndex].text}`);
    try {
        if (this.localVideoTrack) {
            await this.localVideoTrack.setDevice(this.cameraSelect.value);
            // this.localCameraSpan.className = "iconfont icon-camera_opened overlayCamera"
            this.writeAryaLog(`set camera device:${this.cameraSelect.value} success`);
            console.log(`${LogPrefix()} onCameraConfirmClicked setDevice success`);
        }
    } catch (error) {
        console.log(`${LogPrefix()} onCameraConfirmClicked setDevice fail to set camera device because of error:${error}`);
    }
};

AppController.prototype.onRoleSelectChanged = async function (event) {
    if (!this.inited) {
        this.showToast(`init engine before set client role`, 2000);
        return;
    }
    console.log(`${LogPrefix()} onRoleConfirmClicked label:${this.roleSelect.value}`);
    try {
        await this.client.setClientRole(this.roleSelect.value);
        this.writeAryaLog(`set role:${this.roleSelect.value} success`);
    } catch (error) {
        console.log(`${LogPrefix()} onRoleConfirmClicked set role fail error:${error}`);
        this.writeAryaLog(`set role fail error:${error}`);
    }
};

AppController.prototype.onBeautySelectChanged = async function (event) {
    if (!this.localVideoTrack) {
        this.showToast(`open camera before set client beatutyEffect`, 2000);
        return;
    }
    var isOn = event.target.value === '1'
    try {
        await this.localVideoTrack.setBeautyEffect(isOn);
        this.writeAryaLog(`${isOn ? 'open' : 'close'} beautyEffect success`);
    } catch (error) {
        this.writeAryaLog(`set beautyEffect error:${error}`);
    }
};


AppController.prototype.getDevice = async function (type) {
    this.removeChilds(this.microphoneSelect);
    this.removeChilds(this.cameraSelect);
    this.removeChilds(this.speakerSelect);
    let devices = [];
    try {
        switch (type) {
            case "all":
                devices = await KRTC.getDevices();
                break;
            case "microphone":
                devices = await KRTC.getMicrophones();
                break;
            case "speaker":
                devices = await KRTC.getPlaybackDevices();
                break;
            case "camera":
                devices = await KRTC.getCameras();
                break;
        }
        console.log(`${LogPrefix()} onGetDeviceClicked`, devices);
        this.writeAryaLog(`get device length:${devices.length}`);
        devices.forEach(device => {
            console.log(`get device`, device);
            this.writeAryaLog(`get device ${device.label} ${device.kind} ${device.deviceId}`);
            let deviceElement = document.createElement("option");
            deviceElement.id = `${device.deviceId}_${device.kind}`;
            deviceElement.value = device.deviceId;
            deviceElement.innerHTML = device.label;//device.deviceId === "default" ? "default": device.label;
            switch (device.kind) {
                case 'audioinput':
                    this.microphoneSelect.appendChild(deviceElement);
                    break;
                case 'videoinput':
                    this.cameraSelect.appendChild(deviceElement);
                    break;
                case 'audiooutput':
                    this.speakerSelect.appendChild(deviceElement);
                    break;
            }
        });
    } catch (error) {
        this.writeAryaLog(`get device fail error:${error}`);
    }
};

AppController.prototype.onUserJoined_ = function (user) {
    this.writeAryaLog("user-joined", user.uid);
    console.log(`${LogPrefix()} user-joined`, user.uid);
    if (this.remoteUsers.get(user.uid) !== undefined) {
        console.log(`${LogPrefix()} user-joined ${user.uid} has joined`);
        return;
    }
    this.remoteUsers.set(user.uid, user);
    this.addRemoteUserElement(user.uid);
};

AppController.prototype.onUserLeft_ = function (user) {
    this.writeAryaLog("user-left", user.uid);
    console.log(`${LogPrefix()} user-left`, user.uid);
    this.remoteUsers.delete(user.uid);
    this.removeRemoteUserElement(user.uid);
    if (user.audioTrack) {
        user.audioTrack.stop();
    }
    if (user.videoTrack) {
        this.removeRemoteVideoTrack(user.uid, "people");
    }
    this.removeRemoteVideoTrack(user.uid, "content");
};

AppController.prototype.onUserPublished_ = function (user, mediaType) {
    this.writeAryaLog("user-published", user.uid, mediaType);
    console.log(`${LogPrefix()} onUserPublished_ userId:`, user.uid, " mediaType:", mediaType);
    let defaultSubscribe = this.defaultSubscribeCheckBox.checked;
    if (defaultSubscribe) {
        this.client.subscribe(user, mediaType).then((track) => {
            this.writeAryaLog(`subscribe userId:${user.uid} mediaType:${mediaType} success`);
            console.log(`${LogPrefix()} onUserPublished_`, track);
            if (mediaType === "audio") {
                track.play();
                const dom = document.getElementById(`microphone_${user.uid}_people`);
                dom && (dom.className = "iconfont icon-microphone_opened overlayMicrophone");
            } else {
                this.addRemoteVideoTrack(track);
            }
        }).catch((error) => {
            this.writeAryaLog(`subscribe errror:${error}`);
        });
    }
};

AppController.prototype.onUserUnpublish_ = function (user, mediaType) {
    this.writeAryaLog("user-unpublish", user.uid, mediaType);
    console.log(`${LogPrefix()} onUserUnpublish userId`, user.uid, " mediaType:", mediaType);
    let defaultSubscribe = this.defaultSubscribeCheckBox.checked;
    if (defaultSubscribe) {
        this.client.unsubscribe(user, mediaType).then(() => {
            this.writeAryaLog(`unsubscribe userId:${user.uid} mediaType:${mediaType} success`);
            if (mediaType === "video") {
                this.removeRemoteVideoTrack(user.uid, "people");
            }
            if (mediaType === "audio") {
                const dom = document.getElementById(`microphone_${user.uid}_people`);
                dom && (dom.className = "iconfont icon-microphone_closed overlayMicrophone");
            }
        }).catch((e) => {
            this.writeAryaLog(`unsubscribe userId:${user.uid} mediaType:${mediaType} fail err:${e}`);
        });
    }
};

AppController.prototype.onContentPublish_ = function (track, mediaType) {
    this.writeAryaLog(`onContentPublish user:${track.getUserId()} mediaType:${mediaType}`);
    console.log(`${LogPrefix()} onContentPublish userId`, track.getUserId(), " mediaType:", mediaType);
    if (mediaType === "audio") {
        track.play();
    } else {
        this.addRemoteVideoTrack(track);
    }
};

AppController.prototype.onContentUnpublish_ = function (userId, mediaType) {
    this.writeAryaLog(`onContentUnpublish mediaType:${mediaType}`);
    console.log(`${LogPrefix()} onContentUnpublish userId:`, userId, " mediaType:", mediaType);
    if (mediaType === "video") {
        this.removeRemoteVideoTrack(userId, "content");
    }
};

AppController.prototype.onContentKickedOff_ = function () {
    this.writeAryaLog(`onContentKickedOff`);
    console.log(`${LogPrefix()} onContentKickedOff`, this.localScreenVideoTrack);
    if (this.localScreenAudioTrack) {
        this.localScreenAudioTrack.close();
        this.localScreenAudioTrack = null;
    }
    if (this.localScreenVideoTrack) {
        this.removeScreenDisplayElement();
        this.localScreenVideoTrack.close();
        this.localScreenVideoTrack = null;
    }
};

AppController.prototype.onTrackEnded_ = async function (mediaType, sourceType, trackId) {
    console.log(`${LogPrefix()} onTrackEnded mediaType:${mediaType} sourceType:${sourceType} trackId:${trackId}`);
    if (mediaType === 'video' && sourceType === "content") {
        if (this.localScreenVideoTrack) {
            try {
                await this.client.unpublish(this.localScreenVideoTrack);
            } catch (error) {
                console.log(`${LogPrefix()} onTrackEnded fail to unpublish track`);
            }
            this.removeScreenDisplayElement();
            this.localScreenVideoTrack.off("track-ended", this.onTrackEnded);
            this.localScreenVideoTrack.close();
            this.localScreenVideoTrack = null;
        }
    }
};

AppController.prototype.addRemoteVideoTrack = function (videoTrack) {
    console.log(`${LogPrefix()} addRemoteVideoTrack`, videoTrack);
    if (!videoTrack) {
        return;
    }
    let userId = videoTrack.getUserId();
    let sourceType = videoTrack.getSourceType();
    let idSuffix = `${userId}_${sourceType}`;
    console.log(`${LogPrefix()} addRemoteStream streamId`, userId);
    let videoView = document.getElementById("videoWrapper_" + idSuffix);
    if (videoView === null) {
        videoView = document.createElement("div");
        videoView.style = "margin: 5px; position: relative;";
        videoView.className = "videoSize";
        videoView.id = "videoWrapper_" + idSuffix;
        this.videoContainer.appendChild(videoView);

        let remoteUserIdElement = document.createElement("label");
        remoteUserIdElement.id = "remoteUser_" + idSuffix;
        remoteUserIdElement.innerHTML = idSuffix;
        remoteUserIdElement.className = "overlayUserId";
        videoView.appendChild(remoteUserIdElement);

        let remoteMicrophone = document.createElement("span");
        remoteMicrophone.id = "microphone_" + idSuffix;
        remoteMicrophone.className = "iconfont icon-microphone_opened overlayMicrophone";
        remoteMicrophone.onclick = () => {
            console.log(`${LogPrefix()} microphone click`, userId);
            let remoteUser = this.remoteUsers.get(userId);
            if (remoteMicrophone.className === "iconfont icon-microphone_closed overlayMicrophone") {
                remoteMicrophone.className = "iconfont icon-microphone_opened overlayMicrophone";
                if (remoteUser !== undefined) {
                    let audioTrack = sourceType === "people" ? remoteUser.audioTrack : remoteUser.contentAudioTrack;
                    audioTrack && audioTrack.play();
                    this.writeAryaLog(`userId:${userId} switch audioTrack to play`);
                }
            } else {
                remoteMicrophone.className = "iconfont icon-microphone_closed overlayMicrophone";
                if (remoteUser !== undefined) {
                    let audioTrack = sourceType === "people" ? remoteUser.audioTrack : remoteUser.contentAudioTrack;
                    audioTrack && remoteUser.audioTrack.stop();
                    this.writeAryaLog(`userId:${userId} switch audioTrack to stop`);
                }
            }
        };
        videoView.appendChild(remoteMicrophone);

        let remoteVideoElement = document.createElement("div");
        remoteVideoElement.id = "video_" + idSuffix;
        remoteVideoElement.style = 'background: rgba(0, 0, 0, 0.5); overflow: hidden;';
        remoteVideoElement.className = "videoSize";
        videoView.appendChild(remoteVideoElement);

        let fit = sourceType === "people" ? "cover" : "contain";
        let controls = sourceType === "people" ? false : true;
        let remoteCamera = document.createElement("span");
        remoteCamera.id = "camera_" + idSuffix;
        remoteCamera.className = "iconfont icon-camera_opened overlayCamera";
        remoteCamera.onclick = () => {
            console.log(`${LogPrefix()} camera click`, userId);
            let remoteUser = this.remoteUsers.get(userId);
            if (remoteCamera.className === "iconfont icon-camera_opened overlayCamera") {
                remoteCamera.className = "iconfont icon-camera_closed overlayCamera";
                if (remoteUser !== undefined) {
                    let videoTrack = sourceType === "people" ? remoteUser.videoTrack : remoteUser.contentVideoTrack;
                    videoTrack && videoTrack.stop();
                    this.writeAryaLog(`userId:${userId} switch videoTrack to stop`);
                }
            } else {
                remoteCamera.className = "iconfont icon-camera_opened overlayCamera";
                if (remoteUser !== undefined) {
                    let videoTrack = sourceType === "people" ? remoteUser.videoTrack : remoteUser.contentVideoTrack;
                    videoTrack && videoTrack.play(remoteVideoElement, { mirror: false, fit: fit, controls: controls });
                    this.writeAryaLog(`userId:${userId} switch videoTrack to play`);
                }
            }
        };
        videoView.appendChild(remoteCamera);

        try {
            videoTrack.play(remoteVideoElement, { mirror: false, fit: fit, controls: controls });
        } catch (error) {
            this.writeAryaLog(`play errror:${error}`);
        }
    }
};

AppController.prototype.removeRemoteVideoTrack = function (userId, sourceType) {
    console.log(`${LogPrefix()} removeRemoteVideoTrack userId:`, userId);
    let idSuffix = `${userId}_${sourceType}`;
    let videoView = document.getElementById("videoWrapper_" + idSuffix);
    if (videoView !== null) {
        while (videoView.firstChild) {
            videoView.firstChild.remove();
        }
        this.videoContainer.removeChild(videoView);
    }
};

AppController.prototype.addScreenDisplayElement = function () {
    console.log(`${LogPrefix()} addScreenDisplayElement`, this.localScreenVideoTrack);
    if (this.localScreenVideoTrack) {
        let videoView = document.createElement("div");
        videoView.style = "margin: 5px; position: relative;";
        videoView.className = "videoSize";
        let idSuffix = `${this.localUserId}_screen`;
        videoView.id = "videoWrapper_" + idSuffix;
        this.videoContainer.appendChild(videoView);
        let userIdElement = document.createElement("label");
        userIdElement.id = "user_" + idSuffix;
        userIdElement.innerHTML = idSuffix;
        userIdElement.className = "overlayUserId";
        videoView.appendChild(userIdElement);

        let microphoneElement = document.createElement("span");
        microphoneElement.id = "microphone_" + idSuffix;
        microphoneElement.className = "iconfont icon-microphone_opened overlayMicrophone";
        microphoneElement.onclick = () => {
            console.log(`${LogPrefix()} microphone click`, localUserId);
            if (microphoneElement.className === "iconfont icon-microphone_closed overlayMicrophone") {
                microphoneElement.className = "iconfont icon-microphone_opened overlayMicrophone";
                if (this.localScreenAudioTrack) {
                    this.localScreenAudioTrack.setEnabled(true)
                }
            } else {
                microphoneElement.className = "iconfont icon-microphone_closed overlayMicrophone";
                if (this.localScreenAudioTrack) {
                    this.localScreenAudioTrack.setEnabled(false);
                }
            }
        };
        videoView.appendChild(microphoneElement);

        let videoElement = document.createElement("div");
        videoElement.id = "video_" + idSuffix;
        videoElement.style = 'background: rgba(0, 0, 0, 0.5); overflow: hidden;';
        videoElement.className = "videoSize";
        videoView.appendChild(videoElement);

        let cameraElement = document.createElement("span");
        cameraElement.id = "camera_" + idSuffix;
        cameraElement.className = "iconfont icon-camera_opened overlayCamera";
        cameraElement.onclick = () => {
            console.log(`${LogPrefix()} camera click`, userId);
            if (cameraElement.className === "iconfont icon-camera_opened overlayCamera") {
                cameraElement.className = "iconfont icon-camera_closed overlayCamera";
                if (this.localScreenVideoTrack) {
                    this.localScreenVideoTrack.setEnabled(false);
                    this.writeAryaLog(`userId:${userId} switch localScreenVideoTrack to disable`);
                }
            } else {
                cameraElement.className = "iconfont icon-camera_opened overlayCamera";
                if (this.localScreenVideoTrack) {
                    this.localScreenVideoTrack.setEnabled(true);
                    this.writeAryaLog(`userId:${userId} switch localScreenVideoTrack to enable`);
                }
            }
        };
        videoView.appendChild(cameraElement);
        try {
            this.localScreenVideoTrack.play(videoElement, { mirror: false });
        } catch (error) {
            this.writeAryaLog(`play error:${error}`);
        }
    }
};

AppController.prototype.removeScreenDisplayElement = function () {
    console.log(`${LogPrefix()} removeScreenDisplayElement userId:`, this.localUserId);
    let idSuffix = `${this.localUserId}_screen`;
    let videoView = document.getElementById("videoWrapper_" + idSuffix);
    if (videoView !== null) {
        while (videoView.firstChild) {
            videoView.firstChild.remove();
        }
        this.videoContainer.removeChild(videoView);
    }
};

AppController.prototype.addRemoteUserElement = function (uid) {
    let element = document.getElementById("user_" + uid);
    if (element === null) {
        element = document.createElement("option");
        element.id = "user_" + uid;
        element.innerHTML = uid;
        element.value = uid;
        this.remoteUserSelect.appendChild(element);
    }
}

AppController.prototype.removeRemoteUserElement = function (uid) {
    let element = document.getElementById("user_" + uid);
    if (element !== null) {
        this.remoteUserSelect.removeChild(element);
    }
};

AppController.prototype.stop = function () {
    this.client.off("user-published", this.onUserPublished);
    this.client.off("user-unpublished", this.onUserUnpublish);
    this.client.off("user-joined", this.onUserJoined);
    this.client.off("user-left", this.onUserLeft);
    this.client.off("connection-state-change", this.onConnectionStateChange);
    this.client.off("content-published", this.onContentPublish);
    this.client.off("content-unpublished", this.onContentUnpublish);
    if (this.localAudioTrack && this.localAudioTrack.isPlaying) {
        this.localAudioTrack.close();
    }
    if (this.localVideoTrack && this.localVideoTrack.isPlaying) {
        this.localVideoTrack.close();
    }
    this.remoteUsers.forEach((user, userId) => {
        this.removeRemoteVideoTrack(userId, "people");
        this.removeRemoteVideoTrack(userId, "content");
        this.removeRemoteUserElement(user.uid);
    });
    this.remoteUsers.clear();
    this.isJoined = false;
};

AppController.prototype.openDevice = async function () {
    console.log(`${LogPrefix()} open devices, camera:${this.cameraSelect.value} microphone:${this.microphoneSelect.value}`);
    let videoEncoderConfig = this.videoEncoderConfigs.get(this.videoConfigSelect.value);
    let videoConfig = {
        encoderConfig: videoEncoderConfig,
        deviceId: this.cameraSelect.value
    };
    let audioConfig = {
        deviceId: this.microphoneSelect.value,
        AEC: true,
        ANS: true,
        AGC: true,
    };
    console.log(`${LogPrefix()} open devices videoConfig:`, videoConfig, " audioConfig:", audioConfig);
    try {
        if (this.localAudioTrack === null && this.localVideoTrack === null) {
            [this.localAudioTrack, this.localVideoTrack] = await KRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
            // this.localAudioTrack.play();
            this.localVideoTrack.play(this.localVideoView, { mirror: true });
            this.beautySelect.removeAttribute('disabled')
        } else {
            if (this.localAudioTrack === null) {
                this.localAudioTrack = await KRTC.createMicrophoneAudioTrack(audioConfig);
                // this.localAudioTrack.play();
            }

            if (this.localVideoTrack === null) {
                this.localVideoTrack = await KRTC.createCameraVideoTrack(videoConfig);
                this.localVideoTrack.play(this.localVideoView, { mirror: true });
                this.beautySelect.removeAttribute('disabled')
            }
        }
    } catch (error) {
        console.log(`${LogPrefix()} openDevice error`);
        throw error;
    }
};

AppController.prototype.createScreenTrack = async function () {
    if (this.localScreenVideoTrack) {
        throw "screen track has been created";
    }
    let videoEncodeConfig = {
        width: 1920,
        height: 1080,
        frameRate: 5,
        bitrateMax: 2000,
        bitrateMin: 200
    };
    try {
        let mediaType = this.mediaTypeSelect.value;
        if (mediaType === 'screen') {
            this.localScreenVideoTrack = await KRTC.createScreenVideoTrack({ encoderConfig: videoEncodeConfig, optimizationMode: "detail" }, false);
            // this.localScreenVideoTrack =  await KRTC.createScreenVideoTrack({encoderConfig:videoEncodeConfig}, false);
            this.localScreenVideoTrack.on("track-ended", this.onTrackEnded);
        } else if (mediaType === "screenWithAudio") {
            [this.localAudioTrack, this.localScreenVideoTrack] = await KRTC.createScreenVideoTrack({ encoderConfig: videoEncodeConfig }, true);
            this.localScreenVideoTrack.on("track-ended", this.onTrackEnded);
        }
        this.addScreenDisplayElement();
    } catch (error) {
        console.log(`${LogPrefix()} createScreenTrack error:${error}`);
    }
};

AppController.prototype.hasElement = function (id) {
    return document.getElementById(id) !== null;
};

AppController.prototype.writeAryaLog = function (...text) {
    this.aryaLogText.value += `[${getLocaltime()}] ` + JSON.stringify(text) + '\n';
    this.aryaLogText.scrollTop = this.aryaLogText.scrollHeight;
};

AppController.prototype.writeDebugInfo = function (info) {

};

AppController.prototype.removeChilds = function (element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
};

AppController.prototype.onDeviceChanged = function (element, deviceInfo) {
    console.log(`${LogPrefix()} onDeviceChanged label:${deviceInfo.device.label} kind:${deviceInfo.device.kind} state:${deviceInfo.state}`);
    let elementId = `${deviceInfo.device.deviceId}_${deviceInfo.device.kind}`;
    let deviceElement = document.getElementById(elementId);
    if (deviceElement === null) {
        deviceElement = document.createElement("option");
        deviceElement.id = elementId;
        deviceElement.value = deviceInfo.device.deviceId;
        deviceElement.innerHTML = deviceInfo.device.label;//deviceInfo.device.deviceId === "default" ? "default": deviceInfo.device.label;
        element.appendChild(deviceElement);
    } else {
        element.removeChild(deviceElement);
    }
};

AppController.prototype.onDualStreamClicked = function () {
    console.log(`${LogPrefix()} onDualStreamClicked enable:${this.dualStreamButton.innerHTML === "enableDual"}`);
    if (!this.inited) {
        this.writeAryaLog(`can't set dual stream before initing engine`);
        console.log(`${LogPrefix()} onDualStreamClicked can't set dual stream before initing engine`);
        return;
    }
    if (this.dualStreamButton.innerHTML === "enableDual") {
        this.dualStreamButton.innerHTML = "disableDual";
        this.client.setLowStreamParameter({ width: 360, height: 240, frameRate: 8, bitrateMax: 200 });
        this.client.enableDualStream();
    } else {
        this.dualStreamButton.innerHTML = "enableDual";
        this.client.disableDualStream();
    }
};

AppController.prototype.onSetRemoteVideoStreamTypeClicked = async function () {
    console.log(`${LogPrefix()} onSetRemoteStreamTypeClicked user:${this.remoteUserSelect.value} type:${this.streamTypeSel.value}`);
    if (this.remoteUserSelect.value === "") {
        this.writeAryaLog(`fail to set remote stream type because of invalid userId`);
        console.log(`${LogPrefix()} onSetRemoteStreamTypeClicked fail to set remote stream type`);
        return;
    }
    try {
        await this.client.setRemoteVideoStreamType(this.remoteUserSelect.value, this.streamTypeSel.value);
        this.writeAryaLog(`set video stream type:${this.streamTypeSel.value} of ${this.remoteUserSelect.value} success`);
    } catch (error) {
        this.writeAryaLog(`fail to set remote stream type because of error:${error}`);
        console.log(`${LogPrefix()} onSetRemoteStreamTypeClicked fail to set remote stream type error:${error}`);
    }
};