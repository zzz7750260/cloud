// pages/words/words.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    array:[0],          //声明循环的数组
    inputArray:[],      //声明输入的数组
    temInput:null,      //声明临时的input
    temTranslate:null,  //声明临时的翻译结果
  },

  /**
   * 增加input
   */
  addInput:function(){
    //获取array
    let oldArray = this.data.array
    console.log(oldArray)
    oldArray.push(1)  //数组增加
    this.setData({
      array: oldArray
    })
    console.log("索引结果"+this.data.array)
   },


  /**
   * 将数据提交到数组中
   */
   postInput:function(e){
     //获取idx
     let idx = e.currentTarget.dataset.idx;
     console.log(idx)

     //获取value
     let info = e.detail.value

     if (info){
       //将info存储到temInput中
       this.setData({
         temInput: info
       })


       //获取inputArray
       let inputArray = this.data.inputArray;
       console.log(inputArray)

       //进行翻译
       this.translateWord()


       //声明一个新对象,将输入和翻译结果都存储到其中
       let newObj = {}
       newObj.ainput = info

       //获取临时的翻译结果temTranslate,由于翻译结果会相对慢一点，因而存储也稍微延迟点

       setTimeout(() => {
         let temTranslate = this.data.temTranslate
         console.log("结果:" + temTranslate)

         newObj.translateValue = temTranslate
         console.log(newObj)
       }, 200)

       //保存inputArray，
       //将newObj填到数组中
       inputArray[idx] = newObj;

       this.setData({
         inputArray: inputArray
       })

       console.log("数组结果：")
       console.log(this.data.inputArray)

    }
    
   },

  /**
   * 将词语进行翻译
   */
  translateWord:function(){
    //获取temInput
    let temInput = this.data.temInput

    plugin.translate({
      lfrom: "en_US",
      lto: "zh_CN",
      content: temInput,
      success: (res) => {
        if (res.retcode == 0) {
          console.log("result", res.result)
          //将结果存储到temTranslate中
          //setTimeout(()=>{
            this.setData({
              temTranslate: res.result
            })           
          //},300)

        } else {
          console.warn("翻译失败", res)
        }
      },
      fail: (res) => {
        console.log("网络失败", res)
      }
    })    
  },


  /**
   * 输入音标
   */
  postSymbol:function(e){
    //获取值
    let theValue = e.detail.value;

    //获取idx
    let idx = e.currentTarget.dataset.idx;  

    //获取数组inputArray
    let inputArray = this.data.inputArray
    
    //将值添加到数组中
    inputArray[idx]['symbol'] = theValue

    console.log(inputArray)

    //存储数组
    this.setData({
      inputArray: inputArray
    })
  },

  /**
   * 删除对应的元素
   */
  delArray:function(e){
    //获取idx
    let idx = e.currentTarget.dataset.idx;  
    console.log("索引：" + idx)

    //利用splice对数组进行删除
    //对array和inputArray同时进行删除
    
    //获取array和inputArray
    let array = this.data.array
    let inputArray = this.data.inputArray

    array.splice(idx,1)
    inputArray.splice(idx,1)

    console.log(array)
    console.log(inputArray)

    //保存array和inputArray
    this.setData({
      array: array,
      inputArray: inputArray
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