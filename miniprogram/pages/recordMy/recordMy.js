// pages/recordMy/recordMy.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    recordInfo:null,     //声明获取记录信息
  },

   /**
   * 获取对应信息
   */
  getRecordData:function(id){
    //初始化数据库
    const db = wx.cloud.database()
    db.collection('records').doc(id).get({
      success:(res) =>{
        // res.data 包含该记录的数据
        console.log(res.data)

        this.setData({
          recordInfo: res.data
        })
        console.log(this.data.recordInfo)
      }
    })
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    
    //触发获取数据
    this.getRecordData(options.id)
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