// pages/music/music.js
//引入同声同译
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()

//声明音乐播放控件
const innerAudioContext = wx.createInnerAudioContext()

//声明app
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    voiceStatus:false,   //声明录音的状态
    voiceValue:null,   //声明录音的值
    musicList:null,    //声明音乐列表
    musicSelect:null,    //音乐选中标识
    musicPlayStatus:false,    //音乐播放状态
    musicPlayId:null,     //声明正在播放的音乐id
    playMode:'auto',    //声明音乐选择的播放模式  
    musicName:null,       //声明播放的音乐名称
    musicSinger:null,     //声明播放音乐的演唱者
    webNav:0,             //声明webNav
    musicInfo:null,       //声明音乐信息 
  },

  /**
   * 获取录音并进行搜索
   */
  getVoice:function(){
    console.log("点击")
    console.log(this.data.voiceStatus)
    if (this.data.voiceStatus === false){
      //如果voiceStatus为false就开始录制声音
      manager.start({ duration: 30000, lang: "zh_CN" })
      //将voiceStatus的状态改为true
      this.setData({
        voiceStatus:true
      })
    }
    else{
      manager.stop();
      //将voiceStatus的状态改为true
      this.setData({
        voiceStatus: false
      })
    }
  },

   /**
   * 向后端获取音乐列表
   */
  getMusicList:function(){
    //获取搜索的值
    let voiceValue = this.data.voiceValue;

    //将后端发出音乐请求
    wx.request({
      url: 'https://v1.itooi.cn/kuwo/search', //仅为示例，并非真实的接口地址
      data: {
        keyword: voiceValue,
        type: 'song',
        pageSize: 100,
        page:0,
        format:1
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success:(res) =>{
        //console.log(res.data)
        
        //将值传到musicList中
        this.setData({
          musicList: res.data.data
        })

        //console.log(this.data.musicList)

        //当选择的模式为自动播放时，触发autoPlayMode
        if (this.data.playMode === 'auto'){
          this.autoPlayMode(this.data.musicList)       
        }

      }
    })
  },

  /**
   * 音乐播放
   */
  playMusic:function(e){
    //获取data中的值
    let url = e.currentTarget.dataset.url; 
    let id = e.currentTarget.dataset.id;
    let name = e.currentTarget.dataset.name;
    let singer = e.currentTarget.dataset.singer;

    innerAudioContext.src = url;


    //判断单曲播放的歌曲id是否与存储的歌曲id相同，如果相同证明是同一首歌

    if (id === this.data.musicPlayId){
      if (this.data.musicPlayStatus === false) {
        innerAudioContext.play();
        this.setData({
          musicPlayStatus: true
        })
      }
      else {
        innerAudioContext.pause();
        this.setData({
          musicPlayStatus: false
        })
      }
    }
    else{
      innerAudioContext.play();
      
      //将正在播放的id赋予musicPlayId,同时将name和singer赋予musicName,musicSinger
      this.setData({
        musicPlayId: id,
        musicName:name,
        musicSinger:singer,
      })
    }
  },

  //播放模式选择
  radioChange:function(e){
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    
    //将选择模式存入playMode中
    this.setData({
      playMode: e.detail.value
    })
  },

  //自动播放模式
  //arr为传入歌曲的数组
  autoPlayMode:function(arr){
    let songLength = arr.length
    
    //根据长度随机选择一个数组中的歌曲进行播放
    let randList = Math.floor(Math.random() * songLength);

    //获取随机选择的数组
    let selectArr = arr[randList]

    console.log(selectArr)

    //将对应的信息进行存储
    this.setData({
      musicPlayId:selectArr['id'],
      musicName:selectArr['name'],
      musicSinger: selectArr['singer']
    })

    innerAudioContext.src = selectArr['url']
    
    //进行歌曲播放
    if(this.data.webNav === 2){
      innerAudioContext.play();
    }

    //获取歌曲的信息
    this.getMusicInfo()
  },

   /**
   * 获取音乐详情
   */
  getMusicInfo(){
    //获取播放音乐的id
    let musicPlayId = this.data.musicPlayId;
    
    //根据musicPlayId获取对应的音乐信息
    wx.request({
      url: 'https://v1.itooi.cn/kuwo/song', //仅为示例，并非真实的接口地址
      data: {
        id: musicPlayId
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        //console.log(res.data)

        //将值传到musicInfo中
        this.setData({
          musicInfo: res.data.data
        })

      }
    })   

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var plugin = requirePlugin("WechatSI")
    let manager = plugin.getRecordRecognitionManager()
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop =  (res) => {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)
      //在录音停止后，将结果赋予voiceValue
      this.setData({
        voiceValue: res.result
      })

      //向后端发出音乐列表的请求
      this.getMusicList()
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
    }

    //音乐播放
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })

    innerAudioContext.onStop(() => {
      console.log('停止播放')
    })

    innerAudioContext.onPause(() => {
      console.log('暂停播放')
    })

    innerAudioContext.onEnded(() => {
      console.log('自然播放结束')
      //自然播放结束后，将播放状态重新改为false，保证下首能正常播放
      this.setData({
        musicPlayStatus: false
      })
    })

    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })


    //赋值于webNav
    this.setData({
      webNav: app.globalData.webNav
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