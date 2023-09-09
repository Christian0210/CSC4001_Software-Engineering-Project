var util = require('utils/util')
const MD5 = require('utils/md5.js')
const app = getApp()
const host = app.globalData.host
var emojis = app.globalData.emojis
const that = this;


Page({
  data: {
    messages: [],
    isSpeech: false,
    scrollHeight: 0,
    toView: '',
    windowHeight: 0,
    windowWidth: 0,
    pxToRpx: 2,
    msg: '',
    emotionBox: false,
    emotions: [],
    speechText: '按住 说话',
    changeImageUrl: '/images/voice.png',
    speechIcon: '/images/speech0.png',
    defaultSpeechIcon: '/images/speech0.png',
    emotionIcon: '/images/emotion.png',
    playingSpeech: ''
  },
  chooseEmotion(e) {
    this.setData({
      msg: this.data.msg + '[' + e.target.dataset.name + ']',
    })
  },
  sendMessage(e) {
    this.setData({
      msg: e.detail.value,
    })
  },
  onLoad() {
    wx.showToast({
      title: '( •̀ᄇ• ́)ﻭ✧来跟我聊天吧 ❤️',
      icon: 'none',
    })
    
    let emotions = []
    for (let i = 0; i < emojis.length; i++) {
      emotions.push({
        src: '/emoji/' + util.getEmojiEn(emojis[i]) + '.png',
        id: i,
        name: emojis[i]
      })
    }
    this.setData({
      emotions: emotions
    })
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          windowHeight: res.windowHeight,
          pxToRpx: 750 / res.screenWidth,
          scrollHeight: (res.windowHeight - 50) * 750 / res.screenWidth
        })
      }
    })

    // The following part is for the chatboot API //
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    // 如果cusid(设备识别码)不存在或者长度小于20,，则重新生成。
    var cusid = app.globalData.NLPCusid;
    if (cusid == null || cusid.length < 20){
      this.setCusid();
    }
    this.sayHello()
  },
  // cusid生成函数
  setCusid:function(){
    // 大小写字母和数字
    var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    // 生成30位随机字符串
    var cusidLength = 30,cusid = '';
    for(var i = 0; i < cusidLength; i++){
      var oneStr = str.charAt(Math.floor(Math.random() * str.length));
      cusid += oneStr;
    }
    app.globalData.NLPCusid = cusid;
    console.log("[Console log]:New cusid:" + cusid);
  },
  onShareAppMessage: function () {
    return {
      title: '伙伴小Q',
      path: '/pages/index/index'
    }
  },
  emotionBtn() {
    if (this.data.emotionBox) {
      this.setData({
        emotionBox: false,
        scrollHeight: (this.data.windowHeight - 50) * this.data.pxToRpx
      })
    } else {
      this.setData({
        emotionBox: true,
        scrollHeight: (this.data.windowHeight - 285) * this.data.pxToRpx
      })
      if (this.data.isSpeech) {
        this.setData({
          isSpeech: false,
          changeImageUrl:  '/images/voice.png'
        });
      }
    }
  }, 
  changeType: function () {
    if (this.data.isSpeech) {
      this.setData({
        isSpeech: false,
        changeImageUrl:  '/images/voice.png'
      });
    } else {
      this.setData({
        isSpeech: true,
        changeImageUrl:  '/images/keyinput.png',
        emotionBox: false,
        scrollHeight: (this.data.windowHeight - 50) * this.data.pxToRpx
      });
    }
  },
  
  // 调用语义接口
  sendChat: function (e) {
    let word = e.detail.value.ask_word ? e.detail.value.ask_word : e.detail.value;
    that.addChat(word, 'r');
    that.setData({
      askWord: '',
      sendButtDisable: true,
    });
    // 请求函数
    that.sendRequest(word);
  },
  helloContent: function(content) {
    let msg = content
    let contents = util.getContents(msg)
    let id = 'id_' + Date.parse(new Date()) / 1000;
    // let data = { id: id, contents: contents, me: false, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: false } // this one checks if the user has authorized the miniprogram with his/her profile
    
    let data = { id: id, contents: contents, me: false, avatar: "../../images/mascot.png", speech: false }
    let messages = this.data.messages
    messages.push(data)
    this.setData({
      messages: messages,
      msg: ''
    })
    this.setData({
      toView: id
    })
    console.log(contents[0].text)
  },
  sayHello: function (){
    this.helloContent("你背单词的样子真好看！！")
    this.helloContent("记得吃晚饭噢~")
    // this.helloContent("你背单词的样子真好看！！")
  },
  // 处理语义（拿到回答）
  NLIProcess: function(res){
    var nlires = JSON.parse(res);
    var nliArray = nlires.data.nli;
    if(nliArray.length == 0){
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    var answer = nliArray[0].desc_obj.result;
    if(answer == null){
      wx.showToast({
        title: '返回数据有误！',
      })
      return;
    }
    console.log("----------NLIProcess----------")
    console.log(nlires)
    console.log(nliArray)
    console.log(answer)
    console.log(typeof(answer))
    

    let msg = answer.replace(/欧拉蜜/g, "Habiter")
    let contents = util.getContents(msg)
    let id = 'id_' + Date.parse(new Date()) / 1000;
    // let data = { id: id, contents: contents, me: false, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: false } // this one checks if the user has authorized the miniprogram with his/her profile
    
    let data = { id: id, contents: contents, me: false, avatar: "../../images/mascot.png", speech: false }
    let messages = this.data.messages
    messages.push(data)
    this.setData({
      messages: messages,
      msg: ''
    })
    this.setData({
      toView: id
    })
    console.log(contents[0].text)


    return;
  },
  // 发送网络请求
  sendRequest(corpus){                // send
    var that = this
    console.log("sendRequest")
    this.NLIRequest(corpus, {         // establish connection
      'success': function (res) {
        if (res.status == "error") {
          wx.showToast({
            title: '返回数据有误！',
          })
          
          return;
        }
        
        that.NLIProcess(res);         // process the result if connection successful
      },
      'fail': function (res) {
        wx.showToast({
          title: '请求失败！',
        })

        return;
      }
    }); 
  },
  NLIRequest:function(corpus,arg) { // corpus是要发送的对话；arg是回调方法
    // appkey
    var appkey = app.globalData.NLPAppkey;
    // appsecret
    var appSecret = app.globalData.NLPAppSecret;
    var api = "nli";  // cannot use seg, has to use nli. The official website is a p of s
    var timestamp = new Date().getTime();
    // MD5签名
    var sign = MD5.md5(appSecret + "api=" + api + "appkey=" + appkey + "timestamp=" + timestamp + appSecret);
    var rqJson = { "data": { "input_type": 1, "text": corpus }, "data_type": "stt" };
    var rq = JSON.stringify(rqJson);
    var nliUrl = app.globalData.NLPUrl;
    // cusid是用来实现上下文的，可以自己随意定义内容，要够长够随机
    var cusid = app.globalData.NLPCusid;
    console.log("[Console log]:NLIRequest(),URL:" + nliUrl);
    wx.request({
      url: nliUrl,
      data: {
        appkey: appkey,
        api: api,
        timestamp: timestamp,
        sign: sign,
        rq: rq,
        cusid: cusid,
      },
      header: { 'content-type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      success: function (res) {
        var resData = res.data;
        console.log("[Console log]:NLIRequest() success...");
        console.log("[Console log]:Result:");
        console.log(resData);
        var nli = JSON.stringify(resData);
        // 回调函数，解析数据
        typeof arg.success == "function" && arg.success(nli);
      },
      fail: function (res) {
        console.log("[Console log]:NLIRequest() failed...");
        console.error("[Console log]:Error Message:" + res.errMsg);
        typeof arg.fail == "function" && arg.fail();
      },
      complete: function () {
        console.log("[Console log]:NLIRequest() complete...");
        typeof arg.complete == "function" && arg.complete();
      }
    })
  },
  send: function () {
    var theMsg = this.data.msg
    let msg = theMsg.replace(/Habiter/g, "欧拉蜜")
    let contents = util.getContents(msg)
    let id = 'id_' + Date.parse(new Date()) / 1000;
    let data = { id: id, contents: contents, me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: false }
    let messages = this.data.messages
    messages.push(data)
    this.setData({
      messages: messages,
      msg: ''
    })
    this.setData({
      toView: id
    })
    console.log(contents[0].text)
    
    this.sendRequest(contents[0].text)
  },

  startRecord: function () {
    var that = this;
    this.setData({
      speechText: '松开 发送'
    })
    var seconds = 0;
    var interval = setInterval(function () {
      seconds++
    }, 1000);
    wx.startRecord({
      success: function (res) {
        clearInterval(interval);
        var tempFilePath = res.tempFilePath
        seconds = seconds == 0 ? 1 : seconds;
        let id = 'id_' + Date.parse(new Date()) / 1000;
        let data = { id: id, me: true, avatar: wx.getStorageSync('userInfo').avatarUrl, speech: true, seconds: seconds, filePath: tempFilePath }
        let messages = that.data.messages
        messages.push(data)
        that.setData({
          messages: messages
        });
        that.setData({
          toView: id
        })
        let nickName = wx.getStorageSync('userInfo').nickName;
        if (!nickName) nickName = 'null';
        wx.uploadFile({
          url: host + '/wx/uploadSilk',
          filePath: tempFilePath,
          name: 'file',
          formData: {
            'userid': wx.getStorageSync('openid'),
            'username': wx.getStorageSync('userInfo').nickName
          },
          success: function (res) {
            let resData = JSON.parse(res.data);
            if (resData.code == 102) {
              let answer = resData.text;
              let contents = util.getContents(answer)
              let id = 'id_' + Date.parse(new Date()) / 1000;
              let data = { id: id, contents: contents, me: false, avatar:   '/images/robot.jpg', speech: false }
              let messages = that.data.messages
              messages.push(data)
              that.setData({
                messages: messages
              })
              that.setData({
                toView: id
              })
            } else if (resData.code == 101) {
              var isFirst = true;
              wx.playBackgroundAudio({
                dataUrl: host + '/static/' + resData.text
              });
              wx.onBackgroundAudioPlay(function () {
                wx.getBackgroundAudioPlayerState({
                  success: function (res) {
                    if (!isFirst) {
                      return;
                    }
                    isFirst = false;
                    let duration = res.duration;
                    wx.stopBackgroundAudio();
                    let id = 'id_' + Date.parse(new Date()) / 1000;
                    let data = { id: id, me: false, avatar:   '/images/robot.jpg', speech: true, seconds: duration == 0 ? 1 : duration, filePath: host + '/static/' + resData.text }
                    let messages = that.data.messages
                    messages.push(data)
                    that.setData({
                      messages: messages
                    });
                    that.setData({
                      toView: id
                    })
                  }
                })
              });
            }
          },
          fail: function (err) {
            console.log(err)
          }
        })
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },
  stopRecord: function () {
    this.setData({
      speechText: '按住 说话'
    })
    wx.stopRecord();
  },
  playSpeech: function (event) {
    var that = this;
    var filePath = event.currentTarget.dataset.filepath;
    that.setData({
      playingSpeech: filePath
    });
    var num = 1;
    var interval = setInterval(function () {
      that.setData({
        speechIcon: '/images/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playVoice({
      filePath: filePath,
      complete: function () {
        clearInterval(interval);
        that.setData({
          speechIcon: '/images/speech0.png',
          playingSpeech: ''
        });
      }
    })
  },
  playRobotSpeech: function (event) {
    var that = this;
    var filePath = event.currentTarget.dataset.filepath;
    that.setData({
      playingSpeech: filePath
    });
    var num = 1;
    var interval = setInterval(function () {
      that.setData({
        speechIcon: '/images/speech' + num % 3 + '.png'
      });
      num++;
    }, 500);
    wx.playBackgroundAudio({
      dataUrl: filePath
    });
    wx.onBackgroundAudioStop(function () {
      clearInterval(interval);
      that.setData({
        speechIcon: '/images/speech0.png',
        playingSpeech: ''
      });
    })
  }
})

