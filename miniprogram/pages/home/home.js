// pages/home/home.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    englishValue:null,    //声明英文的输入值
    chineseValue:null,    //声明中文的输入值
    translateValue:null,  //声明翻译的结果
    fromValue:null,       //声明来源的值
    imgPath:null,         //声明图片存储的路径
    temImgPath:null,      //声明临时的图片存储路径
  },

  /**
   * 英文输入
   */
  englishInput:function(e){
    console.log(e.detail.value)   
    //将值传到englishValue中
    this.setData({
      englishValue:e.detail.value
    })

    //进行英文翻译
    this.englishToChinese()
  },

  /**
   * 英文翻译成中文
   */
  englishToChinese:function(){
    //获取输入的englishValue
    let englishValue = this.data.englishValue

    plugin.translate({
      lfrom: "en_US",
      lto: "zh_CN",
      content: englishValue,
      success:(res) => {
        if (res.retcode == 0) {
          console.log("result", res.result)

          //将值传到translateValue中
          this.setData({
            translateValue:res.result
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
   * 翻译输入
   */
  chineseInput:function(e){
    console.log(e.detail.value)
    //将结果存储到chineseValue中
    this.setData({
      chineseValue:e.detail.value
    })
  },

   /**
   * 来源输入
   */
  fromInput:function(e){
    console.log(e.detail.value)
    this.setData({
      fromValue: e.detail.value
    })
  },

  /**
   * 当前日期设置
   * return year-month-day
   */
  setNowDate:function(){
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
   * 文章提交
   */
  postArticle:function(){
    //引入数据库
    const db = wx.cloud.database()

    console.log("获取imgPath:" + this.data.imgPath)
    console.log("获取date:" + this.setNowDate())

    
    //向数据库插入数据
    db.collection('articles').add({
      data:{
        englishContent:this.data.englishValue,
        chineseContent:this.data.chineseValue,
        theTranslate:this.data.translateValue,
        fromValue:this.data.fromValue,
        due: new Date(),
        time: this.setNowDate(),
        //图片的fileID
        fileID: this.data.imgPath
      },
      success:(res)=>{
        console.log(res)
      },
      fail:(err)=>{
        console.log(err)
      }
    })

  },


/**
 * 提交图片
 */
  chooseImg:function(){
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) =>{
        console.log(res)
        
        //将图片路径存储到临时的图片路径中temImgPath
        this.setData({
          temImgPath: res.tempFilePaths[0]
        })

      },
      fail: e => {
        console.error(e)
      }
    })

  },

  /**
   * 生命周期函数--监听页面加载
   */
  postImg:function(){
    wx.showLoading({
      title: '上传中',
    })

    //获取临时的图片地址
    const filePath = this.data.temImgPath
      
    // 上传图片
    const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
    wx.cloud.uploadFile({
      cloudPath,
      filePath,
      success: res => {
        //将得到的fileID存储到imgPath中
        this.setData({
          imgPath: res.fileID
        })

        console.log("上传imgPath:" + this.data.imgPath)

        console.log('[上传文件] 成功：', res)

        console.log(cloudPath);
        console.log(filePath)
        app.globalData.fileID = res.fileID
        app.globalData.cloudPath = cloudPath
        app.globalData.imagePath = filePath

      },
      fail: e => {
        console.error('[上传文件] 失败：', e)
        wx.showToast({
          icon: 'none',
          title: '上传失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
         
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let app = getApp();
    //查询是否将userInfo的信息传到全局变量中
    //console.log(app.globalData.userInfo);

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