const app = getApp();
Component({
  properties: {


    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: JSON,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    shoppingCarData: {},
    cartData:{},
    countGood:0,
    countPrice:0,
    sysWidth:"",
  },

  ready:function(){
    console.log("=======购物车组件==========",this.data.data)
    this.setData({
      sysWidth: app.globalData.sysWidth,
      setting:app.setting
    });
    app.addCarChangeNotify(this);
    this.getCart();
  },
  methods: {
    carChangeNotify:function(data){
      console.log("====car change=====", data)
      let that=this;
      if (data =='clear'){
        this.setData({
          pushItem: [],
          countGood: 0,
          countPrice: 0
        })
      }
      else{
        this.getCart();
      }
      // this.setData({
      //   pushItem: data.item,
      //   countGood: data.totalCarItemCount,
      //   countPrice: data.totalCarItemPrice.toFixed(2)
      // })
    },
    getCart: function (type) {
      console.log('==========')
      var customIndex = app.AddClientUrl("/get_shopping_car_list_item.html")
      var that = this
      wx.request({
        url: customIndex.url,
        header: app.header,
        success: function (res) {
          console.log('------error-------')
          console.log("加载的数据", res.data)
          if (res.data.errcode == '10001') {
            that.data.cartData = null
            that.setData({
              cartData: that.data.cartData
            })
            app.loadLogin()
          } else if (res.data.result.errcode == '-1') {
            that.data.cartData = null
            that.setData({
              cartData: that.data.cartData
            })
            app.echoErr(res.data.result.errMsg)
          } else {
            if (!res.data.result || res.data.result.length == 0) {
              that.data.cartData = null
              that.setData({
                cartData: that.data.cartData
              })
            } else if (res.data.result.errcode) {
              that.data.cartData = null
              that.setData({
                cartData: that.data.cartData
              })
              app.echoErr(res.data.result.errMsg)
            } else {
              console.log("======success====")
              that.data.cartData = res.data.result;
              that.setData({
                cartData: that.data.cartData,
              })
              console.log("======successcartData====", that.data.cartData)
            }
            that.showPrice()
          }

          //wx.hideLoading()
        },
        fail: function (res) {
          // wx.hideLoading()

        }
      })
    },
    showPrice: function () {
      if (!this.data.cartData) {
        this.setData({
          countGood: 0,
          countPrice: 0
        })
        return
      }
      var cartDataItem = this.data.cartData[0].carItems

      var pushItem = []
      var countGood = 0
      var countPrice = 0

      for (let i = 0; i < cartDataItem.length; i++) {
        pushItem.push(cartDataItem[i])
      }
      for (let i = 0; i < pushItem.length; i++) {
        countGood += parseInt(pushItem[i].count)
        console.log("====pushItem=====", pushItem[i])
        let promotionPrice = 0;
        let carItemPrice = 0;
        let specialSaleTypePrice = 0;
        if (pushItem[i].item.itemSpecialSaleType==1){
          specialSaleTypePrice = Number(pushItem[i].item.itemSpecialSaleValue2)
        }
        if (pushItem[i].item.promotion && pushItem[i].item.promotion != 0) {
          promotionPrice = pushItem[i].item.promotionPrice
        }else {
          carItemPrice = pushItem[i].carItemPrice
        }
        console.log("====pushItem=====", promotionPrice, carItemPrice, specialSaleTypePrice)
        if (pushItem[i].item.promotion && pushItem[i].item.promotion!=0) {
          countPrice += ((parseInt(pushItem[i].count) * promotionPrice) - specialSaleTypePrice)
        } else {
          countPrice += ((parseInt(pushItem[i].count) * carItemPrice) - specialSaleTypePrice)
        }
        // if (pushItem[i].item.promotion && pushItem[i].item.promotion!=0) {
        //   countPrice += parseInt(pushItem[i].count) * pushItem[i].item.promotionPrice
        // } else {
        //   countPrice += parseInt(pushItem[i].count) * pushItem[i].carItemPrice
        // }
      }
      countPrice = countPrice.toFixed(2)
      this.setData({
        pushItem: pushItem,
        countGood: countGood,
        countPrice: countPrice
      })
      console.log(pushItem, 'pushItem__')
      console.log(countGood, 'countGood__')
      console.log(countPrice, "countPrice__")
    },
    tolinkUrl: function (event) {
      console.log(event.currentTarget.dataset.link)
      app.linkEvent(event.currentTarget.dataset.link);
    }
  },
})