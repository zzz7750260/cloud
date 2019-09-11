// pages/chineseArticleAdd/chineseArticleAdd.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    theTitle:null,    //声明标题
    theArticle:null,  //声明文章内容
    theAuthor:null,   //声明作者
    theFileID:null,   //声明临时得到的file路径
  },

   /**
   * 获取title
   */
  getTitle:function(e){
    let title = e.detail.value
    this.setData({
      theTitle: title
    })

    console.log(this.data.theTitle)
  },

   /**
   * 获取内容
   */
  getArticle:function(e){
    let article = e.detail.value
    this.setData({
      theArticle: article
    })

    console.log(this.data.theArticle)
  },

   /**
   * 获取作者
   */
  getAuthor:function(e){
    let author = e.detail.value;
    this.setData({
      theAuthor:author
    })
  },

   /**
   * 获取图片信息
   */
  getImg:function(){
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) =>{

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]

        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            this.setData({
              theFileID: res.fileID
            })

            console.log(this.data.theFileID)

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
      fail: e => {
        console.error(e)
      }
    })
  },

  /**
   * 提交文件
   */
  postArticle:function(){
    //生成时间
    let theTime = this.setNowDate();
    
    //获取title
    let title = this.data.theTitle

    //获取内容
    let article = this.data.theArticle

    //获取author
    let author = this.data.theAuthor

    //获取fileId
    let fileId = this.data.theFileID

    //数据库初始化
    const db = wx.cloud.database()

    //将数据提交到数据库
    db.collection('chineseArticles').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        title: title,
        due: new Date(),
        time: theTime,
        article: article,
        author: author,
        fileId: fileId,
      },
      success: function (res) {
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail:(err)=> {
        console.log(err)
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