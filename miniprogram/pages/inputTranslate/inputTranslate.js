// pages/inputTranslate/inputTranslate.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

//声明音频播放api
const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    translateMode:'englishMode',    //声明翻译的模式
    originValue:null,               //声明源头的值
    targetValue:null,               //声明目标的值
  },

  /**
   * 选择翻译模式
   */
  radioChange:function(e){
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    //将翻译模式存入translateMode
    this.setData({
      translateMode: e.detail.value
    })

  },

  /**
   * 输入需要翻译的值
   */
  bindTextAreaInput:function(e){
    let reg
    console.log(e.detail.value)

    //根据不同模式选择不同的正则
    //选择英文模式
    if (this.data.translateMode ==="englishMode"){
      //正则匹配只能是英文和空格
      reg = /^[a-zA-Z\s]+$/

      if (reg.test(e.detail.value) === false){
        wx.showToast({
          title: '必须为英文',
          icon: 'loading',
          duration: 2000
        })
      }
      else{
        //将值传入originValue
        this.setData({
          originValue: e.detail.value
        })

        //进行音译中englishTochinese
        this.englishTochinese()
      }
    }

    //中译英模式
    if (this.data.translateMode === "chineseMode"){
      //将值传入originValue
      this.setData({
        originValue: e.detail.value
      })

      this.chineseToEnglish()
    }
  },

  /**
   * 英译中
   */
  englishTochinese:function(){
    //获取originValue 
    let originValue = this.data.originValue;

    plugin.translate({
      lfrom: "en_US",
      lto: "zh_CN",
      content: originValue,
      success: (res) => {
        if (res.retcode == 0) {
          console.log("result", res.result) 
          //将结果存入targetValue
          this.setData({
            targetValue: res.result
          })
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
  chineseToEnglish: function () {
    //获取originValue 
    let originValue = this.data.originValue;

    plugin.translate({
      lfrom: "zh_CN", 
      lto: "en_US",
      content: originValue,
      success: (res) => {
        if (res.retcode == 0) {
          console.log("result", res.result)
          //将结果存入targetValue
          this.setData({
            targetValue: res.result
          })
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
   * 播放源
   */
  playOrigin:function(){
    //获取选择模式
    let translateMode = this.data.translateMode

    //获取源声音
    let originValue = this.data.originValue

    //根据不同的模式来选择不同的翻译
    
    //英语模式
    if (this.data.translateMode === "englishMode"){
      plugin.textToSpeech({
        lang: "en_US",
        tts: true,
        content: originValue,
        success: function (res) {
          console.log("succ tts", res.filename)
          //播放源声音
          innerAudioContext.src = res.filename;
          innerAudioContext.play();
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
    }
    if (this.data.translateMode === "chineseMode") {
      plugin.textToSpeech({
        lang: "zh_CN",
        tts: true,
        content: originValue,
        success: function (res) {
          console.log("succ tts", res.filename)
          //播放源声音
          innerAudioContext.src = res.filename;
          innerAudioContext.play();
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
    }
  },

  /**
   * 播放目标
   */
  playTarget:function(){
    //获取翻译结果值targetValue
    let targetValue = this.data.targetValue;

    //获取翻译模式
    let translateMode = this.data.translateMode

    //如果为englishMode模式时，防御的结果就为中文
    if (translateMode === "englishMode"){
      plugin.textToSpeech({
        lang: "zh_CN",
        tts: true,
        content: targetValue,
        success: function (res) {
          console.log("succ tts", res.filename)
          //播放源声音
          innerAudioContext.src = res.filename;
          innerAudioContext.play();
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
    }
    //如果translateMode 为chineseMode时,翻译结果为英文
    if (translateMode === "chineseMode"){
      plugin.textToSpeech({
        lang: "en_US",
        tts: true,
        content: targetValue,
        success: function (res) {
          console.log("succ tts", res.filename)
          //播放源声音
          innerAudioContext.src = res.filename;
          innerAudioContext.play();
        },
        fail: function (res) {
          console.log("fail tts", res)
        }
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //监听音频播放状态
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