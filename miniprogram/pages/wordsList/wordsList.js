// pages/wordsList/wordsList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    offset:0,           //声明跳转的页数
    limit:20,           //声明每页的条数          
    wordList:[],      //声明word的列表
    wordListCount:0,    //声明wordList的总数
  },

  /**
   * 向后端请求word的表单信息
   */
  getWordList:function(){
    const db = wx.cloud.database()
    db.collection('words')
      .limit(20) // 限制返回数量为 10 条
      .get({
      success: (res) =>{
        // res.data 是一个包含集合中有权限访问的所有记录的数据，不超过 20 条
        console.log(res.data)
        
        //将结果存储到wordList
        this.setData({
          wordList: res.data
        })
        console.log("word列表")
        console.log(this.data.wordList)
      }
    })
  },

   /**
   * 向后端提交wordList的总条数
   */
  getWordListCount:function(){
    const db = wx.cloud.database()
    
    //获取总条数
    db.collection('words').count({
      success:(res) =>{
        console.log(res)

        //将结果存储到wordListCount中
        this.setData({
          wordListCount: res.total
        })

        console.log(this.data.wordListCount)
        
      },
      fail:(err) =>{
        console.log(err)
      }
    })
    
  },

  //页面跳转
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
    //向后台提交wordList请求
    this.getWordListCount()
    this.getWordList()
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