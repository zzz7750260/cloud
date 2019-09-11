// pages/fm/fm.js
//声明录音组件
const innerAudioContext = wx.createInnerAudioContext()

//声明app
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    indexInfo:null,       //声明获取到的首页信息
    theLimit:10,          //声明每页的数量
    theOffset:0,          //声明偏移量
    thePage: 1,           //声明页数
    categoryList:null,    //声明得到category返回的信息
    categoryId:null,      //声明存储的categoryId  
    categoryFlag:false,   //声明是否点击了栏目的标识
    playFlag:false,       //声明播放标识
    temUrl:null,          //声明临时的temUrl
    fmTitle:null,         //声明fm的title
    webNav:0,             //声明webNav
    fmSrc:null,           //声明fm的播放地址
    fmControl:false,      //声明fmControl控件
  },

  /**
   * 提交fm的首页信息
   */
  getFmIndex:function(){
    wx.request({
      url: 'https://yiapi.xinli001.com/fm/home-list.json', //仅为示例，并非真实的接口地址
      data: {
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) =>{
        console.log(res.data)
        this.setData({
          indexInfo: res.data.data
        })
        
        console.log(this.data.indexInfo)
      }
    })
  },

  /**
   * 获取分类信息
   */
  getCategoryInfo:function(e){
    let id = e.currentTarget.dataset.id   //获取category的id
    let theOffset = this.data.theOffset   //获取偏移量
    let theLimit = this.data.theLimit     //获取每页数量
  
    //将id存储到categoryId中
    this.setData({
      categoryId: id
    })

    //将点击了category的标识设置为true
    this.setData({
      categoryFlag:true
    })

    wx.request({
      url: 'https://yiapi.xinli001.com/fm/category-jiemu-list.json', //仅为示例，并非真实的接口地址
      data: {
        category_id: id,
        offset: theOffset,
        limit:theLimit,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log("category的信息")
        console.log(res.data)
        this.setData({
          categoryList: res.data.data
        })

        console.log(this.data.categoryList)
      }
    })   
  },

  /**
   * 下一页
   */
  getCategoryInc: function () {
    //let id = e.currentTarget.dataset.id   //获取category的id
    let theOffset = this.data.theOffset   //获取偏移量
    let thePage = this.data.thePage       //获取页数
    let theLimit = this.data.theLimit     //获取每页数量
    let categoryId = this.data.categoryId     //获取正在请求的categoryId

    //对偏移量进行增加并保存
    theOffset = theOffset + 1;

    //页数增加并保存
    thePage = thePage + 1;
    this.setData({
      theOffset:theOffset,
      thePage:thePage
    })

    wx.request({
      url: 'https://yiapi.xinli001.com/fm/category-jiemu-list.json', //仅为示例，并非真实的接口地址
      data: {
        category_id: categoryId,
        offset: theOffset * theLimit,
        limit: theLimit
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log("category的信息")
        console.log(res.data)
        this.setData({
          categoryList: res.data.data
        })

        console.log(this.data.categoryList)
      }
    })
  },

  /**
   * 上一页
   */
  getCategoryDec:function(){
    let theOffset = this.data.theOffset   //获取偏移量
    let thePage = this.data.thePage       //获取页数
    let theLimit = this.data.theLimit     //获取每页数量
    let categoryId = this.data.categoryId     //获取正在请求的categoryId


    //对偏移量进行增加并保存
    theOffset = theOffset - 1;

    //页数增加并保存
    thePage = thePage - 1;
    this.setData({
      theOffset: theOffset,
      thePage: thePage
    })

    wx.request({
      url: 'https://yiapi.xinli001.com/fm/category-jiemu-list.json', //仅为示例，并非真实的接口地址
      data: {
        category_id: categoryId,
        offset: theOffset * theLimit,
        limit: theLimit
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log("category的信息")
        console.log(res.data)
        this.setData({
          categoryList: res.data.data
        })

        console.log(this.data.categoryList)
      }
    })    
  },

  /**
   * 获取推荐列表
   */
  recommendList:function(){
    wx.request({
      url: 'https://bapi.xinli001.com/fm2/broadcast_list.json/', //仅为示例，并非真实的接口地址
      data: {
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: (res) => {
        console.log("category的信息")
        console.log(res.data)
        this.setData({
          categoryList: res.data.data
        })

        console.log(this.data.categoryList)
      }
    })       
  },

  /**
   * 录音机
   */
  playAudio:function(e){
    //获取播放地址
    let playUrl = e.currentTarget.dataset.url

    //获取播放的title
    let title = e.currentTarget.dataset.title

    //获取webSet
    let webNav = this.data.webNav

    //将title存储到fmTitle中
    this.setData({
      fmTitle:title
    })

    //获取临时的播放地址
    let temUrl = this.data.temUrl
    //innerAudioContext.src = playUrl

     //将播放地址存储到fmSrc中
     this.setData({
       fmSrc: playUrl
     })

    if (webNav == 2){
      //当temUrl与playUrl相同时为播放的是同一个节目
      if (temUrl === playUrl) {
        if (this.data.playFlag == false) {
          //innerAudioContext.play()
          this.setData({
            playFlag: true
          })
        }
        else {
          //innerAudioContext.pause()
          this.setData({
            playFlag: false
          })
        }
      }
      else {
        //innerAudioContext.play()

        //将播放地址存储到temUrl中
        this.setData({
          playFlag: true,
          temUrl: playUrl
        })
      }
    }
    else{
      console.log(title)
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFmIndex()
    this.recommendList()

    //监听播放状态
    innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    //存储webNav
    this.setData({
      webNav: app.globalData.webNav
    })
 
    //控制fmControl
    if(this.data.webNav === 2){
      this.setData({
        fmControl:true
      })
    }
    console.log("webNav")
    console.log(this.data.fmControl)
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