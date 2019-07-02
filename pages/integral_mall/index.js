const app = getApp()
var timer11; // 计时器
Page({

  /**
   * 页面的初始数据
   */
  data: {
    jiFen:"",
    jiFenGoods:[],
    defaultColor: "",//主色调
    secondColor:"",//副色调

      page:1,
      pageSize: 6,   //
      totalSize: 0,  //总量
      curpage: 1   //当前页

  },
  tolinkUrl: function (e) {
    console.log(e.currentTarget.dataset.info)
    let info = e.currentTarget.dataset.info
    let jifenId = info.id
    let productId = info.productId
    let jifenNum = info.needJifen
    let jifenCount = info.count
    var a = "jifen_product_detail.html?type=jifen&productId=" + productId + '&jifenNum=' + jifenNum + '&jifenId=' + jifenId + '&jifenCount=' + jifenCount;
    app.linkEvent(a);
  },
  // 测试跳去积分
  click: function () {
    wx.navigateTo({
      url: '/pages/user_jifen_events/index',
    })
  },
  // 兑换商品
  buyGoods: function (e) {
    var that=this;
    console.log(e.currentTarget.dataset.id)
     wx.showModal({
       title: '提示',
       content: '确定兑换商品',
       success: function (res) {
         if (res.confirm) {
           console.log('用户点击确定')
           that.exchange(e.currentTarget.dataset.id)
         } else if (res.cancel) {
           console.log('用户点击取消')
         }
       }
     })

  },
  //兑换
  exchange: function (index) {
    console.log("======a=======", index)
    var that = this;
    console.log("======a=======", that.data.jiFenGoods[index] )
    // 判断是否已经兑换过
    if(that.data.jiFenGoods[index].count<=0){
      wx.showToast({
        title: "超出兑换上限",
        image: '/images/icons/tip.png',
        duration: 2000
      })
    }
    else{
      var id = that.data.jiFenGoods[index].id;
      let exchange = {
        jifenItemId: id,
        fromSource: "wx"
      }
      let menDianYangShi = app.AddClientUrl("/jifen_exchange_phone_json.html", exchange, 'get')
      wx.request({
        url: menDianYangShi.url,
        data: menDianYangShi.params,
        header: app.headerPost,
        method: 'get',
        success: function (res) {
          console.log("======a=======", res)
          if (res.data.errcode == "-1") {
            wx.showToast({
              title: res.data.errMsg,
              image: '/images/icons/tip.png',
              duration: 2000
            })
            console.log(res.data.errMsg)
          }
          else {
            wx.showToast({
              title: "兑换成功",
              image: '/images/icons/targ.png',
              duration: 2000
            })
            // 兑换成功后次数减少
            var time = that.data.jiFenGoods;
            console.log("time", time[index].count--)
            time[index].count = time[index].count--;
            that.setData({
              jiFenGoods: time
            })

          }

        }
      })
    }
   
  },
  onLoad: function (options) {
    // 主色调
  console.log( JSON.stringify(app.setting.platformSetting.defaultColor));
  console.log(JSON.stringify(app.setting.platformSetting.secondColor));
  this.setData({
    defaultColor: app.setting.platformSetting.defaultColor,
    secondColor: app.setting.platformSetting.secondColor,
    setting: app.setting,
    loginUser: app.loginUser
  })

    console.log(this.data.setting);
    console.log(this.data.loginUser);
    //  已经登录
    if (app.loginUser && app.loginUser != "") {
      // console.log("已经登录了" + JSON.stringify(app.loginUser))
      this.setData({
        jiFen: app.loginUser.jifen
      })

      }else{
      this.setData({
        jiFen: "您还未登录"
      })
      }
    let exchange = { }
    exchange.page = this.data.page
    var customIndex = app.AddClientUrl("/super_mini_shop_find_jifen_items.html", exchange, 'get')
    var that = this
  
    //拿custom_page
    wx.request({
      url: customIndex.url,
      header: app.header,
      method: 'get',
      success: function (res) {
        if (res.data.errcode<0){
          that.setData({ jiFenGoods:[] })
        }
        else{
          console.log(res.data.relateObj.result)
          // 获取到的数据要添加进原先的数据
          let newGoods = that.data.jiFenGoods;
          newGoods = newGoods.concat(res.data.relateObj.result);
          console.log(newGoods);
         
          
          that.setData({
            pageSize: res.data.relateObj.pageSize,
            curPage: res.data.relateObj.curPage,
            totalSize: res.data.relateObj.totalSize,
            jiFenGoods: newGoods
             })
        }

      },
      fail: function (res) {

      }
    })
   

  },

  onReady: function () {

  },

  onShow: function () {


 
  },
  onPullDownRefresh: function () {
    this.data.jiFenGoods = []
    this.data.curPage = 1
    this.onLoad();
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this
    // 1 6 20 1
    console.log(that.data.page)
    console.log(that.data.totalSize)
    console.log(that.data.pageSize)
    console.log(that.data.curPage)
    // 当总量大于当前页*数量的时候
    if (that.data.totalSize > that.data.curPage * that.data.pageSize) {
      console.log("1111111")
      let page=that.data.page
      page++;
      that.setData({
        page: page,
      })
      this.onLoad();
    }
 

  

 
  },

})

