// pages/translate/translate.js
//引入同声同译插件
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()

//引入音频播放
const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chineseVoiceStatus:false,    //声明中文的录入状态
    englishVoiceStatus:false,    //声明英文的录入状态
    chineseStatus:false,         //声明是否在进行中文翻译
    englishStatus:false,         //声明是否在进行英文翻译
    chineseValue:null,           //声明获得的中文录音值
    englishValue:null,           //声明获得的英文录音值
    voiceValue:null,             //声明获取的录音的值
    translateResult:null,        //声明翻译结果
    translateValue:'zh_CN',      //翻译语系选择
    speechValue:null,            //声明合成后结果的路径
  },

  /**
   * 英语翻译成中文
   */
  englishToChinese:function(){
    if(this.data.englishVoiceStatus === false){
      manager.start({ duration: 30000, lang: "en_US" })

      //将englishVoiceStatus和englishStatus同时设为true
      //将englishVoiceStatus和englishStatus同时设为true,将translateValue改为en_US
      this.setData({
        englishVoiceStatus: true,
        englishStatus: true,
        translateValue: 'en_US'
      })      
    }
    else{
      manager.stop()
      // 将englishVoiceStatus设为false
      this.setData({
        englishVoiceStatus: false,
      })     
  
    }
  },

  /**
 * 中文翻译成英文
 */
  chineseToEnglish: function () {
    if (this.data.chineseVoiceStatus === false) {
      manager.start({ duration: 30000, lang: "zh_CN" })

      //将englishVoiceStatus和englishStatus同时设为true
      //将englishVoiceStatus和englishStatus同时设为true,将translateValue改为en_US
      this.setData({
        chineseVoiceStatus: true,
        chineseStatus: true,
        translateValue: 'zh_CN'
      })
    }
    else {
      manager.stop()
      // 将englishVoiceStatus设为false
      this.setData({
        chineseVoiceStatus: false,
      })
    }
  },


  /**
   * 英译中
   */
  englishToChineseFunc: function () {
    //获取传入的录音值voiceValue
    let voiceValue = this.data.voiceValue;

    plugin.translate({
      lfrom: "en_US",
      lto: "zh_CN",
      content: voiceValue,
      success: (res) => {
        if (res.retcode == 0) {
          console.log("result", res.result)

          //将翻译结果存入translateResult中
          this.setData({
            translateResul: res.result
          })

          //英译中合成中文音频
          this.chineseToSpeech()

        } else {
          console.warn("翻译失败", res)
        }
      },
      fail: function (res) {
        console.log("网络失败", res)
      }
    })
  },

  /**
   * 中译英
   */
  chineseToEnglishFunc: function () {
    //获取传入的录音值voiceValue
    let voiceValue = this.data.voiceValue;

    plugin.translate({
      lfrom: "zh_CN",
      lto: "en_US",
      content: voiceValue,
      success: (res) => {
        if (res.retcode == 0) {
          console.log("result", res.result)

          //将翻译结果存入translateResult中
          this.setData({
            translateResul: res.result
          })

          //中译英合成英文音频
          this.englishToSpeech()

        } else {
          console.warn("翻译失败", res)
        }
      },
      fail: function (res) {
        console.log("网络失败", res)
      }
    })
  },

   /**
   * 中文的声音合成
   */
  chineseToSpeech:function(){
    //获取翻译后的结果
    let translateResul = this.data.translateResul;

    plugin.textToSpeech({
      lang: "zh_CN",
      tts: true,
      content: translateResul,
      success:  (res) =>{
        console.log("succ tts", res.filename)
        //将声音合成的结果存储到speechValue中
        this.setData({
          speechValue: res.filename
        })
        
      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

  /**
   * 英文的声音合成
   */
  englishToSpeech:function(){
    //获取翻译后的结果
    let translateResul = this.data.translateResul;

    plugin.textToSpeech({
      lang: "en_US",
      tts: true,
      content: translateResul,
      success: (res) => {
        console.log("succ tts", res.filename)
        //将声音合成的结果存储到speechValue中
        this.setData({
          speechValue: res.filename
        })

      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })   
  },

  /**
   * 播放合成的音频
   */
  playTranslate:function(){
    //获取已经合成的音频
    let speechValue = this.data.speechValue;
    innerAudioContext.src = speechValue;
    innerAudioContext.play()
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //监听录音的状态
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop = (res) => {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)

      //当录音结束时，将值存入到voiceValue
      this.setData({
        voiceValue: res.result
      })

      //根据录音语系translateValue来选择翻译方法
      if(this.data.translateValue === "zh_CN"){
        this.chineseToEnglishFunc();
      }
      if (this.data.translateValue === "en_US"){
        this.englishToChineseFunc();
      }
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
    }

    //音频监控
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})