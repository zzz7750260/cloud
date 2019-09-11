var app = getApp();
Component({
  properties:{
  },

  data:{
    'userInfo':null, //声明传递过来的用户信息
    'logged': false,  //声明传递过来是否已经登陆的标识
    'hasUser':false    //声明是否有用户信息的标识
  },
  lifetimes: {
    created:function(){

    },  // 在组件实例创建页面节点树时执行

    attached: function () {
    
    },

    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () {
      //由于获取userInfo需要一定的请求，所以在进行判断时，要有一定的延迟性

      setTimeout(()=>{
        // 在组件实例进入页面节点树时执行
        console.log(app.globalData.userInfo);
        console.log(app.globalData.hasUser);

        //赋值给data
        this.setData({
          userInfo: app.globalData.userInfo,
          hasUser: app.globalData.hasUser
        })
        //console.log(this.data.userInfo);
        //console.log(this.data.logged);

      },1000)

     },
    hide: function () { },
    resize: function () { },
  },

})