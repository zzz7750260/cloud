// pages/wordsArticle/wordsArticle.js
//引入微信同声传译
var rplugin = requirePlugin("WechatSI")

//引入智聆口语评测
var plugin = requirePlugin("ihearing-eval")
let manager = plugin.getRecordRecognitionManager()

//声明语音播放API
const innerAudioContext = wx.createInnerAudioContext()


Page({
  /**
   * 页面的初始数据
   */
  data: {
    wordArticleId:0,      //声明获取的Id
    wordInfo:null,        //获取word的信息
    returnVoice:null,     //声明传回来的声音合成
    temIdx:0,             //声明临时idx
    resultValue:null,     //声明返回结果
    tempFilePath:null,    //声明评测录音
    hearingStatus:false,  //声明评测的播放状态
  },

  /**
   * 获取word的信息
   */
  getWordInfo:function(){
    //获取wordArticleId
    let wordArticleId = this.data.wordArticleId

    const db = wx.cloud.database()
    db.collection('words').doc(wordArticleId).get({
      success: (res) =>{
        // res.data 包含该记录的数据
        console.log(res.data)

        //将信息存入wordInfo
        this.setData({
          wordInfo: res.data
        })
      }
    })
  },

  /**
   * 获取播放语音地址
   */
  getWordUrl:function(e){
    //获取data中的centent
    let centent = e.currentTarget.dataset.centent

    rplugin.textToSpeech({
      lang: "en_US",
      tts: true,
      content: centent,
      success: (res) =>{
        console.log("succ tts", res.filename)     

        //将声音合成的地址存储到returnVoice中
        this.setData({
          returnVoice: res.filename
        })

        //播放语音
        this.playWordUrl()

      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

  /**
   * 获取播放语音地址
   */
  playWordUrl:function(){
    //获取临时播放地址
    let returnVoice = this.data.returnVoice
    innerAudioContext.src = returnVoice
    innerAudioContext.play()
  },

  /**
   * 触发智聆口语评测
   */
  playHearing:function(e){
    //获取idx
    let idx = e.currentTarget.dataset.idx

    //将idx存入temIdx
    this.setData({
      temIdx: idx
    })

    //获取centent
    let centent = e.currentTarget.dataset.centent

    //获取hearingStatus的状态
    let hearingStatus = this.data.hearingStatus
    
    console.log("hearingStatus的状态：" + hearingStatus)

    if (hearingStatus === false){
      manager.start({
        content: centent,
        evalMode: 'word',
        scoreCoeff: 1.0,
        duration: 10000
      })
      //将hearingStatus改为true
      this.setData({
        hearingStatus:true
      })     
    }
    else{
      manager.stop()
      //将hearingStatus改为false
      this.setData({
        hearingStatus: false
      })    
    }

  },

   /**
   * 播放评测录音
   */
  playVoice:function(e){
    //获取data中的voice
    let voice = e.currentTarget.dataset.voice
    innerAudioContext.src = voice
    innerAudioContext.play()    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    //将id存储到wordArticleId中
    this.setData({
      wordArticleId: options.id
    })

    //获取wordInfo
    this.getWordInfo()

    //监听语音播放
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    //监听智聆口语评测
    manager.onStop = (res) => {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)

      //获取wordInfo中的wordArray和temIdx
      let wordInfo = this.data.wordInfo
      let temIdx = this.data.temIdx

      //将结果传到对应数组中
      wordInfo.wordArray[temIdx]['hearing'] = res.result

      //将嗓音也存储到对应的数组中
      wordInfo.wordArray[temIdx]['voice'] = res.tempFilePath

      //将结果存储
      //hearingStatus改为false
      this.setData({
        resultValue: res.result,
        tempFilePath: res.tempFilePath,
        wordInfo: wordInfo,
        hearingStatus:false
      })
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res)
    }
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