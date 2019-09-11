//index.js
const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    hasUser:false,  //是否有用户信息的
    requestResult: '',
    articleList:[],     //声明返回的文章信息
    openId:null,        //声明openId
  },

  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            lang:'zh_CN',
            success: res => {
              //将userinfo赋予全局
              app.globalData.userInfo = res.userInfo;
              console.log(app.globalData.userInfo);

              //将logged也赋予全局
              app.globalData.hasUser = true;

              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              })
            }
          })
        }
      }
    })

    //从Storage中获取openid
    let openId = wx.getStorageSync('openid')
    this.setData({
      openId: openId
    })

    //触发每日一句的加载
    this.getNewOneArticle()

    //触发获取网站信息
    this.getWebSet()
  },


  
  onGetUserInfo: function(e) {
    if (!this.hasUser && e.detail.userInfo) {
      this.setData({
        //logged: true,
        hasUser:true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user event: ', res.result.event)
        console.log('[云函数] [login] user openid: ', res.result.openid)

        app.globalData.openid = res.result.openid

        //将是否登陆的标识存储到全局
        app.globalData.logged = true;

        //同时将res.result.openid存储到Storage中
        wx.setStorageSync('openid', res.result.openid)

        //查询数据库是否存在,没有就插入，有就更新
        //用app.globalData.openid来作为Id
        const db = wx.cloud.database()
        db.collection('users').doc(app.globalData.openid).set({
          data: {
            userInfo:app.globalData.userInfo,
            openid: app.globalData.openid,
            due: new Date(),
            done: false
          },
          success:(res) =>{
            console.log(res)
          },
          fail:(err) =>{
            console.log(err)
          }
        })

        //wx.navigateTo({
        //  url: '../userConsole/userConsole',
        //})
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  addUser:function(){
    const db = wx.cloud.database()
    db.collection('users').doc(app.globalData.openid).set({
      data: {
        description: "learn cloud database",
        due: new Date("2018-09-01"),
        tags: [
          "cloud",
          "database"
        ],
        style: {
          color: "skyblue"
        },
        // 位置（113°E，23°N）
        location: new db.Geo.Point(113, 23),
        done: false
      },
      success: function (res) {
        console.log(res)
      },
      fail:(err)=>{
        console.log(err)
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

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

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
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

  //页面跳转
  navigateToFun:function(e){
    //获取data中的url
    let url = e.currentTarget.dataset.url;

    //判断是否已经登陆，如果没有登陆就不能进行跳转
    
    //从Storage中获取openid
    let openid = wx.getStorageSync('openid');

    //如果openid不存在需要点击进行登陆
    if (!openid){
      wx.showToast({
        title: '需要登陆',
        icon: 'loading',
        duration: 2000
      })
    }
    else{
      //页面跳转
      wx.navigateTo({
        url: url,
      })
    }
  },

  //页面跳转2
  navigateToPage:function(e){
    //获取data中的url
    let url = e.currentTarget.dataset.url;
    //页面跳转
    wx.navigateTo({
      url: url,
    })
  },

  //每日一句，查询最后更新的一条文章
  //skip()  不能从0条开始跳
  getNewOneArticle:function(){
    const db = wx.cloud.database()
    db.collection('articles').limit(1).orderBy('time', 'desc').get().then(res => {
        console.log(res)

        //将得到的结果赋予articleList
        this.setData({
          articleList: res.data
        })

      }).catch(err => {
        console.error(err)
      })
  },

  //获取webSets数据库的信息
  getWebSet:function(){
    //连接数据库
    const db = wx.cloud.database()

    db.collection('webSets')
      .get({
        success:(res)=>{
          // res.data 是包含以上定义的两条记录的数组
          console.log(res.data)

          //将webNav赋予全局
          app.globalData.webNav = res.data[0].webNav;
        },
        fail:(err)=>{

        }
      })
  }
})
