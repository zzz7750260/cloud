// pages/chineseArticleList/chineseArticleList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    articleList: null,   //声明文章列表
  },

  //获取文章列表
  getArticleList: function () {
    //初始化数据库
    const db = wx.cloud.database()

    db.collection('chineseArticles')
      .get()
      .then(res => {
        console.log(res.data)
        //将数据传入到data的articleList中
        this.setData({
          articleList: res.data
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

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //触发获取文章列表
    this.getArticleList()
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