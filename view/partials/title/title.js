const app = getApp();
  Component({
  properties: {
   

    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: JSON,
     
    }
  },
    data: {
      // 这里是一些组件内部数据
      someData: { }
  },
    ready: function () {
      let that=this;
      console.log("==========title=============", that.data.data)
      that.setData({ setting: app.setting })
      console.log("==========setting=============", that.data.setting.platformSetting.defaultColor)
    },
    methods: {
      // 这里是一个自定义方法
   
      /* 搜索 */
      searchProduct: function (e) {
        var product = e.detail.value
        console.log(product)
        var param = {}
        param.productName = product
        let postParam = app.jsonToStr(param)
        // app.productParam = param
        wx.navigateTo({
          url: '/pages/search_product/index' + postParam
        })
      },
      tolinkUrl: function (event) {
        console.log(event.currentTarget.dataset.link)
        app.linkEvent(event.currentTarget.dataset.link);


        // wx.navigateTo({
        //   url: '/pages/' + event.currentTarget.dataset.page + '/index'
        // })
      }
  }
})