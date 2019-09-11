// pages/soundControl/soundControl.js
//微信同声传译
var plugin = requirePlugin("WechatSI")
let manager = plugin.getRecordRecognitionManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    soundList:[],      //声明控制语句的列表
    socketMsgQueue:[],     //声明发送语句列表
    getSocketQueue:[],    //声明接收的信息
    socketOpen:false,    //声明socket的打开状态
    showTextButton:false,    //声明文本控制
    soundStatus:false,    //声明监听状态
  },

  /**
   * 连接websocket
   */
  getWebsocket:function(){
    wx.connectSocket({
      //url: 'ws://127.0.0.1:8898',
      url: 'ws://192.168.137.1:8898',
      header: {
        'content-type': 'application/json'
      },
      success:(res)=>{
        console.log("websocket连接成功")  
        console.log(res)
        
      },
      fail:(err)=>{
        console.log("websocket连接失败")
        console.log(err)
      }
    })
  },

  /**
   * 发送信息
   */
  sendMessage:function(){
    //获取data中的socketOpen
    let socketOpen = this.data.socketOpen;

    //获取socketMsgQueue
    let socketMsgQueue = this.data.socketMsgQueue;

    //socketOpen为true时，进行发送数据
    if (socketOpen){
      //遍历数组进行数据发送
      for (let i = 0; i < socketMsgQueue.length; i++){
        wx.sendSocketMessage({
          data: socketMsgQueue[i]
        })
      }

      //在发完信息后，将存储的信息清空
      this.setData({
        socketMsgQueue:[]
      })
    }
  },

  /**
   * 获取信息
   */
  theText:function(e){
    let textValue = e.detail.value

    console.log(textValue)

    //获取data中的soundList
    let soundList = this.data.soundList;

    let socketMsgQueue = this.data.socketMsgQueue;

    //将结果加入到数组中
    soundList.push(textValue)
    socketMsgQueue.push(textValue)
  },


  /**
   * 录入声音识别
   */
  getSound:function(){
    //获取监听状态
    let soundStatus = this.data.soundStatus

    if (soundStatus === false){
      manager.start({ duration: 60000, lang: "zh_CN" })
      this.setData({
        soundStatus:true
      })
    }
    else{
      manager.stop()
      this.setData({
        soundStatus: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //在页面加载时触发连接websocket
    this.getWebsocket();

    //监听websocket的状态
    //打开websocket
    wx.onSocketOpen((res) => {
      console.log("websocket的状态:")
      console.log(res)

      //将socketOpen设为true
      this.setData({
        socketOpen:true
      })
      console.log("socketOpen:" + this.data.socketOpen);
    })

    //接受服务端的信息
    wx.onSocketMessage((res)=>{
      console.log("接收到服务器端的信息")
      console.log(res)

      let getSocketQueue = this.data.getSocketQueue


      //console.log(typeof res.data);
      //console.log(res.data)
      console.log(JSON.parse(res.data))

      getSocketQueue.push(JSON.parse(res.data))
      
      this.setData({
        getSocketQueue: getSocketQueue
      })

    })



    //监控微信同声传译
    manager.onRecognize = function (res) {
      console.log("current result", res.result)
    }
    manager.onStop = (res) =>{
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)
      
      //获取data中的soundList
      let soundList = this.data.soundList;

      let socketMsgQueue = this.data.socketMsgQueue;
      
      //将结果加入到数组中
      soundList.push(res.result)
      socketMsgQueue.push(res.result)

      //向服务器发送数据
      this.sendMessage()

    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res.msg)
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