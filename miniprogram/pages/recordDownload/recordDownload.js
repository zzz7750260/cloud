// pages/recordDownload/recordDownload.js

//声明播放插件
const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    downloadList:null,       //声明下载列表
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

  /**
   * 获取加载列表
   */
  getDownloadList:function(){
    /*
    wx.getSavedFileList({
      success:(res)=> {
        console.log(res.fileList)
        this.setData({
          downloadList: res.fileList
        })
      }
    })
    */

    const db = wx.cloud.database()
    db.collection('recordDownloads')
      .get({
        success:(res) =>{
          // res.data 是包含以上定义的两条记录的数组
          console.log(res.data)

          //将结果存储到downloadList中
          this.setData({
            downloadList: res.data
          })

          console.log(this.data.downloadList)
        }
      })   
  },

  /**
   * 清空所有记录
   */
  delAllRecord:function(){
    //获取记录列表
    let downloadList = this.data.downloadList
    
    downloadList.forEach((item,index)=>{
      console.log(item)
      //删除记录
      wx.removeSavedFile({
        filePath: item.filePath,
        success:(res)=>{
          console.log("删除成功")
          console.log(res)
        },
        complete:(res) => {
          console.log(res)
        }
    })
    })

    //重新赋值
    this.setData({
      downloadList:[]
    })
  },

  /**
   * 播放记录
   */
  playRecord:function(e){
    //获取播放路径
    let thePath = e.currentTarget.dataset.recordurl

    innerAudioContext.src = thePath
    innerAudioContext.play()

  },

  /**
   * 删除记录
   */
  deleteRecord:function(e){
    //获取对应的id
    let id = e.currentTarget.dataset.id;

    //获取对应的文件路径
    let recordurl = e.currentTarget.dataset.recordurl;

    //删除数据库中的数据
    const db = wx.cloud.database()

    db.collection('recordDownloads').doc(id).remove({
      success: function (res) {
        console.log(res.data)
        //在删除数据库记录成功后，同时删除本地文件
        wx.removeSavedFile({
          filePath: recordurl,
          complete(res) {
            console.log(res)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  showLocalRecord:function(){
    wx.getSavedFileList({
      success:(res)=>{
        console.log(res.fileList)
      }
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getDownloadList();

    //监听播放状态
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
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