// pages/words/words.js
//引入微信同声传译
var plugin = requirePlugin("WechatSI")

Page({
  /**
   * 页面的初始数据
   */
  data: {
    inputArray:[],      //声明输入的数组
    temInput:null,      //声明临时的input
    temTranslate:null,  //声明临时的翻译结果
    temSymbol:null,     //声明临时的音标
    temCentent:'',    //声明临时文章的内容
  },

  /**
   * 增加input
   */
  addInput:function(){
    //获取inputArray
    let inputArray = this.data.inputArray;
    
    //获取temInput
    let temInput = this.data.temInput
    
    //获取temTranslate
    let temTranslate = this.data.temTranslate

    //获取temSymbol
    let temSymbol = this.data.temSymbol

    //获取temCentent
    let temCentent = this.data.temCentent

    //新建对象newObj
    let newObj = {}

    newObj['input'] = temInput
    newObj['temTranslate'] = temTranslate
    newObj['temSymbol'] = temSymbol

    //将newObj存储到inputArray中
    inputArray.push(newObj)

    //保存inputArray
    this.setData({
      inputArray: inputArray
    })

    console.log(this.data.inputArray)

    //当添加单词后，同时给temCentent赋值
    //temCentent = temCentent + temInput + ',' 
    
    //this.setData({
    //  temCentent: temCentent
    //})

    //添加数组后触发makeTextarea
    this.makeTextarea()

    //在提交后把输入框清空
    this.setData({
      temInput:'',
      temSymbol:''
    })
    
  },


  /**
   * 将数据提交到数组中
   */
   postInput:function(e){
     //获取value
     let info = e.detail.value

     if (info){
       //将info存储到temInput中
       this.setData({
         temInput: info
       })

       //进行翻译
       this.translateWord()

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

    //将值存储到temSymbol中
    this.setData({
      temSymbol: theValue
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

    let inputArray = this.data.inputArray

    inputArray.splice(idx,1)
    console.log(inputArray)

    //保存array和inputArray
    this.setData({
      inputArray: inputArray
    })

    //删除数组后触发makeTextarea
    this.makeTextarea()
  },

  /**
   * 生成textarea的内容
   */
  makeTextarea:function(){
    //获取数组inputArray
    let inputArray = this.data.inputArray
    
    //声明temCentent,一个新的空字符串，保证每次值都是新的
    let temCentent = ''

    //遍历数组，得到对应的temCentent
    inputArray.forEach(function (item, index) {
      //获取inputArray中的input组成temCentent
      temCentent = temCentent + item.input + ','
    })

    //将temCentent进行存储
    this.setData({
      temCentent: temCentent
    })
  },

  /**
   * 获取文本框的值
   */
  getTextarea:function(e){
    console.log("文本框的值:" + e.detail.value)

    //将值存储到temCentent中
    this.setData({
      temCentent: e.detail.value
    })
  },

  /**
   * 提交单词信息
   */
  postWordInfo:function(){
    //获取temCentent
    let temCentent = this.data.temCentent;
    
    //获取inputArray
    let inputArray = this.data.inputArray

    //向后台提交对应数据
    const db = wx.cloud.database()

    db.collection('words').add({
      // data 字段表示需新增的 JSON 数据
      data: {
        // _id: 'todo-identifiant-aleatoire', // 可选自定义 _id，在此处场景下用数据库自动分配的就可以了
        centent: temCentent,
        wordArray: inputArray,
        time: this.setNowDate(),
        due: new Date(),
      },
      success: (res) =>{
        // res 是一个对象，其中有 _id 字段标记刚创建的记录的 id
        console.log(res)
      },
      fail:(err) =>{
        console.log(err)
      }
    })  
  },

  /**
   * 当前日期设置
   * return year-month-day
   */
  setNowDate: function () {
    //获取年月日
    var myDate = new Date();
    var year = myDate.getFullYear();    //获取完整的年份(4位,1970-????)
    var month = myDate.getMonth() + 1;       //获取当前月份(1-12)
    var day = myDate.getDate();        //获取当前日(1-31)
    //获取完整年月日
    var newDay = year + "-" + month + "-" + day;
    return newDay
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