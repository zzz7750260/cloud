//上拉刷新
function pullUpRefresh(num,page,user='all'){
  //console.log('aaaa');
  //用promise进行异步请求
  //var pageList = [];
  var p = new Promise(function (resolve, reject){
    wx.request({
      url: getApp().globalData.webSet.apiUrl + 'article/list',
      method: 'get',
      data: {
        num: num,
        page: page,
        user: user
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        //console.log(res.data)
        //pageList = res.data;
        //promise返回成功的数据
        resolve(res.data)
      },
      fail:function(res){
        //promise返回失败的数据
        reject(res)
      }
    })
  })

  return p;
  //return pageList
}

//选择前三张图片
function getThreePic(imgArr){
  //检测图片的长度
  //console.log("重组数组开始")
  var imgArrayLength = imgArr.length;
  //当图片大于三张时，只截取三张
  var setTheImgArray = [];
  if (imgArrayLength > 3){
    //优化代码，利用字符串截取来进行
    /*
      for(var i = 0; i<3; i++){
        setTheImgArray[i] = imgArr[i]
      }
      */
    setTheImgArray = imgArr.slice(0, 2);
  }
  else{
    //如果照片没大于3张，直接赋值
    setTheImgArray = imgArr 
  }
  //console.log('重组的数组');
  //console.log(setTheImgArray)

  //组装返回的数组
  var theArray = {
    arrayLenght: imgArrayLength,
    theImgArray: setTheImgArray
  }

  return theArray;
}

module.exports = {
  pullUpRefresh: pullUpRefresh,
  getThreePic: getThreePic
}