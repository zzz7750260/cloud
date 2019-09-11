// pages/chineseArticle/chineseArticle.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

//引入播放插件
var innerAudioContext = wx.createInnerAudioContext()

//引入录音插件
let voiceRecorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    theId:null,   //声明文章的Id
    articleInfo:null,   //声明文章信息
    voice:null,      //声明播放音频
    followStatus:false,   //声明播放状态
    yourVoice:null,      //声明录音
    downloadRecordList:null   //声明是否有下载过的记录
  },

  //获取文章内容
  getArticle:function(id){
    //初始化数据库
    const db = wx.cloud.database()

    db.collection('chineseArticles').doc(id).get({
      success: (res) =>{
       // console.log(res.data)
        
        //将信息存储到articleInfo中
        this.setData({
          articleInfo: res.data
        })

        console.log(this.data.articleInfo)

        //触发是否已经下载过的信息
        this.getDownloadRecord()
      }
    })
  },


  /**
   * 播放音频
   */
  playVoice:function(){
    //获取文章内容
    let article = this.data.articleInfo.article

    plugin.textToSpeech({
      lang: "zh_CN",
      tts: true,
      content: article,
      success: (res) =>{
        console.log("succ tts", res.filename)

        //将返回的音频存放到全局
        this.setData({
          voice: res.filename
        })

        innerAudioContext.src = this.data.voice
        innerAudioContext.play()
        
      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

  /**
   * 点击跟读
   */
  followRead:function(){
    let openid = wx.getStorageSync('openid')
    if (openid) {
      const options = {
        duration: 60000,
        sampleRate: 44100,
        numberOfChannels: 1,
        encodeBitRate: 192000,
        format: 'mp3',
        frameSize: 50
      }
      if (this.data.followStatus === false) {
        voiceRecorderManager.start(options)
        this.setData({
          followStatus: true
        })
      }
      else {
        voiceRecorderManager.stop()
        this.setData({
          followStatus: false
        })
      }
    }
    else{
      wx.showToast({
        title: '该功能需要登陆',
        icon: 'loading',
        duration: 2000
      })
    }
  },


  /**
   * 播放你的录音
   */
  playYourVoice:function(){
    console.log("正在播放：" + this.data.yourVoice)
    innerAudioContext.src = this.data.yourVoice
    innerAudioContext.play()
  },

/**
 * 下载跟读
 */
  downloadYourVoice: function () {
    let yourVoice = this.data.yourVoice
    //正则查找替换成http，为了保证手机端能进行
    let patt = /^[a-zA-Z]+\:\/\//i

    //查找
    let text = yourVoice.replace(patt,"http://")
    
    console.log("正则替换后:"+ text)

    /*wx.downloadFile({
      url: text, //仅为示例，并非真实的资源
      success:(res)=>{
        console.log(res)
        // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
        if (res.statusCode === 200) {

          innerAudioContext.src = res.tempFilePath
          innerAudioContext.play()

        }
      }
    })*/

    //获取downloadRecordList，检测该录音是否存在
    let downloadRecordList = this.data.downloadRecordList

    //获取下载日期
    let theTime = this.setNowDate()

    //获取该文章信息
    let articleInfo = this.data.articleInfo

    
     
    //直接wx.saveFile文件下载
    wx.saveFile({
      tempFilePath: yourVoice,
      success:(res) =>{
        console.log(res)
        const savedFilePath = res.savedFilePath
        
        //初始化数据库
        const db = wx.cloud.database()

        //如果不存在，就添加记录，如果存在就更新记录
        if (downloadRecordList.length <=0){
          //不存在进行存储
          db.collection('recordDownloads').add({
            // data 字段表示需新增的 JSON 数据
            data: {
              title: articleInfo.title,
              time: theTime,
              due: new Date(),
              author: articleInfo.author,
              savedFilePath: res.savedFilePath
            },
            success: (res) =>{
              console.log("添加成功")
              // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
              console.log(res)
            }
          })
        }
        else{
          //存在进行更新
          db.collection('recordDownloads').doc(downloadRecordList[0]._id).update({
            // data 传入需要局部更新的数据
            data: {
              title: articleInfo.title,
              time: theTime,
              due: new Date(),
              author: articleInfo.author,
              savedFilePath: res.savedFilePath
            },
            success:(res) =>{
              console.log("更改成功")
              console.log(res)
            },
            fail: (err)=>{
              console.log(err)
            }
          })
          
          //删除原本地文件
          wx.removeSavedFile({
            filePath: downloadRecordList[0].savedFilePath,
            success:(res)=>{
              console.log("本地文件" + downloadRecordList[0]._savedFilePath+"删除成功")
              console.log(res)
            },
            complete:(res)=>{
              console.log(res)
            }
          })

        }
      }
    }) 
  },

  /**
   * 获取下载的列表
   */
  getDownloadYourVoice:function(){
    wx.getSavedFileList({
      success(res) {
        console.log(res.fileList)     

      }
    })
  },

  /**
   * 获取是否已经下载信息
   */
  getDownloadRecord:function(){

    //获取文章信息
    let articleInfo = this.data.articleInfo
    console.log(articleInfo)

    //检测是否存在
    const db = wx.cloud.database()

    db.collection('recordDownloads').where({
      // gt 方法用于指定一个 "大于" 条件，此处 _.gt(30) 是一个 "大于 30" 的条件
      title: articleInfo.title,
      author: articleInfo.author
    })
      .get({
        success: (res) => {
          console.log(res.data)
          this.setData({
            downloadRecordList: res.data
          })
        }
      })
  },

  /**
* 当前日期设置
* return year-month-day
*/
  setNowDate: function () {
    //获取年月日
    var myDate = new Date();
    var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var month = myDate.getMonth() + 1;       //获取当前月份(1-12)
    var day = myDate.getDate();        //获取当前日(1-31)
    //获取完整年月日
    var newDay = year + "-" + month + "-" + day;
    return newDay
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    
    //将对应的id存储到data的theId中
    //this.setData({
    //  theId: options.id
    //})

    this.getArticle(options.id)



    //监听播放状态
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    //监听录音状态
    voiceRecorderManager.onStart(() => {
      console.log('recorder start')
    })
    voiceRecorderManager.onPause(() => {
      console.log('recorder pause')
    })
    voiceRecorderManager.onStop((res) => {
      console.log('recorder stop', res)
      const { tempFilePath } = res
      //将录音存储到yourVoice中
      this.setData({
        yourVoice: res.tempFilePath
      })

      console.log(this.data.yourVoice)
    })
    voiceRecorderManager.onFrameRecorded((res) => {
      const { frameBuffer } = res
      console.log('frameBuffer.byteLength', frameBuffer.byteLength)
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