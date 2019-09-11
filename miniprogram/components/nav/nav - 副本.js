var app = getApp()
Component({ 
  properties: {
 
  },
  data:{
    'logged':false,   //用户是否已经登陆的标识
    'hasUser':false,  //是否已经有用户信息的标识
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      // 在组件实例进入页面节点树时执行
      //console.log(app.globalData.userInfo);
      //console.log(app.globalData.logged);

       //由于获取userInfo需要一定的请求，所以在进行判断时，要有一定的延迟性

      setTimeout(()=>{
        //赋值给data
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUser: app.globalData.hasUser
        })
      },1000)


      //从Storage中获取openid
      let openid = wx.getStorageSync('openid');

      //如果存在openid说明已经登陆过
      //因为判断hasUser有延迟，所以这里也进行延迟设置
      setTimeout(() => {
        if (openid && this.data.hasUser){
          this.setData({
            logged: true,
          })
        }
      }, 1200)

      //console.log(this.data.userInfo);
      //console.log(this.data.logged);
      
    },
    hide: function () { },
    resize: function () { },
  },

  methods:{
    getUserInfoDetail:function(e){
      if (!this.data.hasUser){
        this.getUserInfo(e);
        this.onGetOpenid();
      }else{
        console.log("用户已经存在");
        this.onGetOpenid();
      }    
    },

    //获取用户信息，这个其实在进入主界面的时候就已经加载了
    getUserInfo: function (e) {
      console.log(e)
      getApp().globalData.userInfo = e.detail.userInfo
      this.setData({
        userInfo: e.detail.userInfo,
        hasUserInfo: true
      })
    },

    //获取用户的openId
    onGetOpenid: function () {
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

          //将logged赋予局部
          this.setData({
            logged:true
          })

          //同时将res.result.openid存储到Storage中
          wx.setStorageSync('openid', res.result.openid)

          //查询数据库是否存在,没有就插入，有就更新
          //用app.globalData.openid来作为Id
          const db = wx.cloud.database()
          db.collection('users').doc(app.globalData.openid).set({
            data: {
              userInfo: app.globalData.userInfo,
              openid: app.globalData.openid,
              due: new Date(),
              done: false
            },
            success: (res) => {
              console.log(res)
            },
            fail: (err) => {
              console.log(err)
            }
          })

        //wx.navigateTo({
        //  url: '../userConsole/userConsole',
        //})
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          //wx.navigateTo({
          //  url: '../deployFunctions/deployFunctions',
          //})
        }
      })
    },
  }
})