// pages/list/list.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleList:null,       //声明获取的文章列表
    getTemPath:null,        //声明临时获取的图片地址
    thePage:0,                 //声明当前的页面
    theLimit:20,               //声明默认条数为20(云开发查询最大条数为20))
  },

  /**
   * 获取每日一句的列表
   */
  getlish:function(){

    //连接数据库
    const db = wx.cloud.database()
    db.collection('articles').orderBy('time', 'desc')
      .get()
      .then((res)=>{
          console.log(res)

          //新建临时的数组获取返回的结果
          let temPath = res.data
          //let newPath
          //遍历数组，通过fileId 回去临时的图片路径，并重新组装数组
          //  newPath = temPath.filter(item => { // item为数组当前的元素
            //this.getImgPath(item.fileID)
            //console.log(this.data.getTemPath)
            //由于有异步请求，所以进行延迟处理

            //用async/await等待promise的完成
            
          //    console.log(this.getImgPath(item.fileID))
          //   item['imgUrl'] = this.data.getTemPath
             
          //    return item      
          //})
          
          //将返回的文章列表结果存储到articleList中
          this.setData({
            articleList: temPath
          })
        }
      )
      .catch(console.error)
  },

  /**
   * 根据fileId获取临时的图片url
   */
  getImgPath:function (fileID) {
    let thePath 
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: fileID,
        maxAge: 60 * 60 * 24, // one hour
      }]
    }).then((res) =>{
      // get temp file URL
      console.log(res.fileList)

      //将链接存储到getTemPath中
      thePath = res.fileList[0].tempFileURL
      
      this.setData({
        getTemPath: thePath
      })

      return thePath
     
    }).catch((error) =>{
      // handle error
    })

    //console.log(this.data.getTemPath

  },

  /**
   * 页面的增加
   */
  incList:function(){
    //获取当前页面
    let thePage = this.data.thePage
    
    //获取页面条数
    let theLimit = this.data.theLimit

    //将页面数增加并保存
    thePage = thePage + 1;
    this.setData({
      thePage: thePage
    });

    //获取articleList
    let articleList = this.data.articleList;

    //声明跳转(页面*页面条数)
    let theSkip = thePage * theLimit
    
    //获取对应的数组，并与原来的articleList进行concat()拼接
    const db = wx.cloud.database()
    db.collection('articles').orderBy('time', 'desc')
      .skip(theSkip) // 跳过结果集中的前 theSkip 条，从第 theSkip+1 条开始返回
      .limit(theLimit) // 限制返回数量为 theLimit 条
      .get()
      .then(res => {
        console.log("结果")
        console.log(res.data)

        //将结果与原数组拼接
        articleList = articleList.concat(res.data)

        //保存articleList结果
        this.setData({
          articleList: articleList
        })

      })
      .catch(err => {
        console.error(err)
      })

  },
  
  /**
   * 页面跳转
   */
  navigateToFun: function (e) {
    //获取data中的url
    let url = e.currentTarget.dataset.url;

    //判断是否已经登陆，如果没有登陆就不能进行跳转

    //从Storage中获取openid
    let openid = wx.getStorageSync('openid');

    //如果openid不存在需要点击进行登陆
    if (!openid) {
      wx.showToast({
        title: '需要登陆',
        icon: 'loading',
        duration: 2000
      })
    }
    else {
      //页面跳转
      wx.navigateTo({
        url: url,
      })
    }
  },

  //页面跳转2
  navigateToPage: function (e) {
    //获取data中的url
    let url = e.currentTarget.dataset.url;
    //页面跳转
    wx.navigateTo({
      url: url,
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //getlish加载
    this.getlish()
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
    //到底时触发页面数量增加
    this.incList()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})