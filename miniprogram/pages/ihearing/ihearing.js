// pages/ihearing/ihearing.js
//引入智聆口语评测插件
var plugin = requirePlugin("ihearing-eval")
let manager = plugin.getRecordRecognitionManager()

//引入同声同译
var voicePlugin = requirePlugin("WechatSI")

//引入音频播放软件
const innerAudioContext = wx.createInnerAudioContext()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    selectMode:'word',    //声明选择的是单词还是句子
    voiceStatus:false,    //声明录音状态
    inputValue:null,      //声明检查的单词
    translateValue:null,  //声明声音合成返回的路径
    voiceAccuracy:0,      //声明声音的准确度
    voiceFluency: 0,      //声明声音的流畅度
    voiceCompletion: 0,   //声明声音的完成度
  },

  /**
   * 选择单词或者句子模式
   */
  radioChange:function(e){
    //选择的值
    console.log('radio发生change事件，携带value值为：', e.detail.value);
    
    //将值赋予全局变量selectMode中
    this.setData({
      selectMode: e.detail.value
    })
  },

  /**
   * 输入需要检查的单词
   */
  bindKeyInput:function(e){
    console.log("输入的单词为:"+ e.detail.value)
    
    //正则表达式判断
    let valueReg = /^[a-zA-Z\s]+$/;
    let judgeValue = valueReg.test(e.detail.value)

    console.log(judgeValue);

    if (judgeValue === false){
      wx.showToast({
        title: '输入的必须为英文字母',
        icon: 'error',
        duration: 2000
      })
    }
    else{
      this.setData({
        inputValue: e.detail.value
      })
    }
  },

  /**
   * 开始进行评测
   */
  hearing:function(){
    //获取测试输入的单词inputValue
    let inputValue = this.data.inputValue

    //获取选择的模式selectMode
    let selectMode = this.data.selectMode

    if(this.data.voiceStatus === false){
      manager.start({
        content: inputValue,
        evalMode: selectMode,
        scoreCoeff: 1.0,
      })

      this.setData({
        voiceStatus:true 
      })
    }  
    else{
      manager.stop()
      this.setData({
        voiceStatus: false
      })
    } 
  },


  /**
   * 同声同译语音合成
   */
  hearingTranslate:function(){
    //获取需要合成的值
    let inputValue = this.data.inputValue

    voicePlugin.textToSpeech({
      lang: "en_US",
      tts: true,
      content: inputValue,
      success: (res)=>{
        console.log("succ tts", res.filename)
        
        //将返回值存储到全局变量translateValue中
        this.setData({
          translateValue: res.filename
        })

        //播放声音合成
        this.playTranslateVoice();
      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

   /**
   * 播放合成的声音
   */
  playTranslateVoice:function(){
    let translateValue = this.data.translateValue;
    innerAudioContext.src = translateValue;
    innerAudioContext.play()
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //智聆口语评测监控状态
    manager.onStop = (res) =>{
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)

      //将结果存储到对应的值中
      this.setData({
        voiceAccuracy: res.result.pron_accuracy,      //声明声音的准确度
        voiceFluency: res.result.pron_fluency,        //声明声音的流畅度
        voiceCompletion: res.result.pron_completion,     //声明声音的完成度
      })
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
    }

    //音频播放监控
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