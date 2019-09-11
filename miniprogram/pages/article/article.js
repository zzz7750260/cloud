// pages/article/article.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

//引入音频api
const innerAudioContext = wx.createInnerAudioContext()

//引入智聆口语评测
var speedPlugin = requirePlugin("ihearing-eval")
let manager = speedPlugin.getRecordRecognitionManager()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleInfo:[],      //声明获取的文章信息
    articleId:null,      //声明传递过来的文章id
    speakStatus:false,   //声明跟读的标识
    returnResult:null,   //声明返回的结果
    voiceValue:null,     //声明录音存储
    imgPath:null,        //声明图片的地址
    fileId:null,         //声明fileId,
    total:0,             //声明现在总分数
    returnTotal:0,       //声明返回的总分数
    returnRecord:null,   //声明返回的结果
    resultTotal:0,       //声明跟读的最高分
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取链接传递过来的参数
    console.log(options)
    
    //将id传递到articleId中
    this.setData({
      articleId: options.id
    })

    //查找该id对应的文章信息
    this.getArticleInfo()

    //查找用户对应的记录
    this.getRecord()

    //监听音频播放
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    //监听跟读状态
    manager.onStop = (res) => {
      console.log("record file path", res.tempFilePath)
      console.log("result", res.result)

      //计算测试的最高分
      let resultTotal = res.result.pron_accuracy + res.result.pron_completion + res.result.pron_fluency

      //将返回的结果存储到returnResult中
      //将声音的结果存储到voiceValue中
      this.setData({
        returnResult: res.result,
        voiceValue: res.tempFilePath,
        resultTotal: resultTotal
      })

      //跟读结束时触发保存记录
      this.saveRecord()
    }
    manager.onStart = function (res) {
      console.log("成功开始录音识别", res)
    }
    manager.onError = function (res) {
      console.error("error msg", res)
    }
  },

  /**
   * 根据id获取文章的对应信息
   */
  getArticleInfo:function(){
    //连接云数据库
    const db = wx.cloud.database()
    
    db.collection('articles').doc(this.data.articleId).get({
      success:(res) =>{
        // res.data 包含该记录的数据
        console.log(res.data)

        //将文章信息的结果存储到articleInfo中
        this.setData({
          articleInfo: res.data,
          fileId: res.data.fileID
        })

        //触发根据fildId获取图片临时链接的请求
        //如果存在fileId就进行触发
        if (res.data.fileID){
          this.getImgPath()
        }
      }
    })
  },

  /**
   * 获取openid对应的文章id的值
   */
  getRecord: function () {
    //通过Storage获取用户的openId
    let openId = wx.getStorageSync('openid');
    //获取articleId
    let articleId = this.data.articleId

    //连接数据库
    const db = wx.cloud.database()
    db.collection('records').where({
      _openid: openId,
      articleId: articleId
    })
      .get({
        success: (res) =>{
          console.log("用户记录")
          console.log(res.data)
          //如果返回值有数据，就将返回的结果存储到returnRecord中
          if (res.data){
            this.setData({
              returnRecord: res.data
            })
          }
        }
      })

  },


  /**
   * 将文章中的englishContent进行转换成语音
   */
  speedEnglish:function(){
    //获取英文的内容
    let englishContent = this.data.articleInfo.englishContent;
    plugin.textToSpeech({
      lang: "en_US",
      tts: true,
      content: englishContent,
      success: function (res) {
        console.log("succ tts", res.filename)
        //获取播放的地址
        innerAudioContext.src = res.filename
        innerAudioContext.play()

      },
      fail: function (res) {
        console.log("fail tts", res)
      }
    })
  },

  /**
   * 跟读
   */
  followSpeak:function(){
    //从手机缓存中获取openid
    let openid = wx.getStorageSync('openid')

    if (openid){
      //获取需要跟读的内容englishContent
      let englishContent = this.data.articleInfo.englishContent;
      console.log(englishContent)

      if (this.data.speakStatus === false) {
        manager.start({
          content: englishContent,
          evalMode: 'sentence',
          scoreCoeff: 1.0,
        })

        //将speakStatus的状态改为true
        this.setData({
          speakStatus: true
        })
      }
      else {
        manager.stop()
        //将speakStatus的状态改为true
        this.setData({
          speakStatus: false
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
   * 播放跟读
   */
  playVoice:function(){
    //获取录音的播放地址
    let voiceValue = this.data.voiceValue
    //获取播放的地址
    innerAudioContext.src = voiceValue
    innerAudioContext.play()    

  },

  /**
   * 根据fileID获取图片地址
   */
  getImgPath:function(){
    //获取fileId 
    let fileId = this.data.fileId
    wx.cloud.getTempFileURL({
      fileList: [
        {
          fileID: fileId,
          maxAge: 60 * 60 * 24, // one hour
        }
      ],
      success: res => {
        // get temp file URL
        console.log(res.fileList)

        //将图片链接存储到imgPath中
        this.setData({
          imgPath: res.fileList[0].tempFileURL
        })
        
      },
      fail: err => {
        // handle error
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
   * 保存记录
   */
  saveRecord:function(){
    //获取返回的测试结果
    let returnResult = this.data.returnResult

    //获取返回的记录
    let returnRecord = this.data.returnRecord

    //获取文章的英文内容
    let englishContent = this.data.articleInfo.englishContent;

    //获取文章的id
    let articleId = this.data.articleId

    //通过Storage获取用户的openId
    let openId = wx.getStorageSync('openid');

    //获取记录的时间
    let theDue = this.setNowDate()

    //如果存在返回结果时
    //离开页面的时候提示是否保存数据
    if (returnResult) {
      //检查是否存在返回的returnRecord结果，如果没有就提示是否进行数据提交
      //计算returnResult得到的总结果
      let totalValue = returnResult.pron_accuracy + returnResult.pron_completion + returnResult.pron_fluency

      //判断是否存在返回结果
      if (returnRecord.length == 0) {
        //如果不存在就提示更新信息,返回为空时
        wx.showModal({
          title: '提示',
          content: '是否将评测的信息提交',
          success: (res) => {
            if (res.confirm) {
              console.log('用户点击确定')
              //向数据库提交record的数据
              //如果不存在returnRecord，就进行提交，如果存在，就进行更改
              //连接数据库
              const db = wx.cloud.database()
              db.collection('records').add({
                // data 字段表示需新增的 JSON 数据
                data: {
                  // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                  articleId: articleId,
                  englishContent: englishContent,
                  totalValue: totalValue,
                  time: new Date(),
                  due: theDue,
                  resultValue: returnResult
                },
                success: function (res) {
                  // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                  console.log(res)
                }
              })

            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
      else{
        //如果有记录，就与之前的总分进行比较，如果大于之前的总分，就弹出是否要进行分数更改
        console.log(totalValue)
        console.log(returnRecord[0].totalValue)
        if (totalValue > returnRecord[0].totalValue){
          wx.showModal({
            title: '超过记录',
            content: '是否将评测的分数替换',
            success: (res) => {
              if (res.confirm) {
                console.log('用户点击确定')
                //向数据库提交record的数据
                //如果不存在returnRecord，就进行提交，如果存在，就进行更改
                //连接数据库
                const db = wx.cloud.database()
                const _ = db.command
                //更改对应record的_id的值
                db.collection('records').doc(returnRecord[0]._id).update({
                  // data 字段表示需新增的 JSON 数据
                  data: {
                    // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
                    totalValue: totalValue,
                    time: new Date(),
                    due: theDue,
                    resultValue: returnResult
                  },
                  success:(res) => {
                    // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
                    console.log(res)
                  }
                })

              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })        
        }
      }
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