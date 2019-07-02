const app = getApp();
Component({
  properties: {


    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: String,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    showPopup:false,
    renderData: null,
    PaiXuPartials: [], 
    kefuCount: 0,
    defaultTop:0,
    footerImgState:false,
  },

  ready: function () {
    let that=this;
    console.log('zujian',this.data.data)
    if (this.data.data){}
    this.setData({ setting: app.setting })
    console.log('setting', this.data.setting)
    this.getParac();
    wx.getSetting({//检查用户是否授权了
      success(res) {
        console.warn("======检查用户是否授权了========", res)
        if (!res.authSetting['scope.userInfo']) {
          console.log('=====1userInfo====')
          that.setData({ showPopup: true })
        } else {
          console.log('=====2userInfo====')
          that.setData({ showPopup: false })
        }
      }});
  },
  methods: {
    // 这里是一个自定义方法
    /* 组件事件集合 */
    bindGetUserInfo: function (e) {
      let that=this;
      that.setData({ showPopup: false })
      console.log(that.data.showPopup)
      console.log(e.detail.userInfo)
      if (e.detail.userInfo) {
        //用户按了允许授权按钮
        console.log('用户按了允许授权按钮')
        if (app.loginUser && app.loginUser.platformUser&&!app.loginUser.platformUser.nickname) {
           app.sentWxUserInfo(app.loginUser)
        }
      } else {
        console.log('用户按了拒绝按钮')
        //用户按了拒绝按钮
      }
    },
    cancel:function(){
      this.setData({ showPopup: false })
    },
    getParac: function () {
      var that = this;
      let url
      let jsonData;
      let params = { version: app.version};
      try {
        jsonData = JSON.parse(that.data.data);
        url = jsonData.url
      } catch (e) {
        jsonData = that.data.data
        console.log(e); //error in the above string(in this case,yes)!
        url = jsonData
      }
      if (jsonData.params){
        params = Object.assign({}, params, jsonData.params)
      }
      console.log("====url====", url, jsonData)
      var customIndex = app.AddClientUrl("/custom_page_" + url + ".html", params, 'get', '1')
      //拿custom_page
      wx.request({
        url: customIndex.url,
        header: app.header,
        success: function (res) {
          console.log("====== res.data=========", res.data)
          let data = res.data;
          if (!data.errcode | data.errcode=='0'){
            if (data.channelName !="index"){
              if (jsonData.title && jsonData.title =="noTitle"){
                console.log("======不设置标题=======")
              } else (
                wx.setNavigationBarTitle({
                  title: data.channelTitle,
                })
              )
           }
            wx.hideLoading()
            app.renderData = data
            that.setData({ renderData: data })
            if (data.partials.length == 0) {
              that.setData({ PaiXuPartials: null })
            } else {
              that.getPartials();
            }
          }else{
            // wx.showModal({
            //   title: '提示',
            //   content: '该页面还未装修',
            //   success: function (res) {

            //     if (res.confirm) {
                 
            //     } else if (res.cancel) {
                 
            //     }
            //   }
            // })
            console.log('加载失败')
          }
        },
        fail: function (res) {
          console.log('------------2222222-----------')
          console.log(res)
          wx.hideLoading()

          //app.loadFail()

          wx.showModal({
            title: '提示',
            content: '加载失败，点击【确定】重新加载',
            success: function (res) {

              if (res.confirm) {
                that.getParac()
              } else if (res.cancel) {
                app.toIndex()
              }
            }
          })
        }
      })
    },
    getPartials: function () {
      let that=this;
      var partials = that.data.renderData.partials;
      console.log("=====partials=====", partials)
      var PaiXuPartials = [];
      //排序
      if (partials && partials.length) {
        for (let i = 0; i < partials.length; i++) {
          // 产品标签的转化为数组start
          if (partials[i].partialType == 6 && partials[i].androidTemplate=="footer-img"){
            console.log("====存在浮动图片====", that.data.footerImgState)
            that.setData({ footerImgState: true })
            console.log("====存在浮动图片====", that.data.footerImgState)
          }
          if (partials[i].partialType == 24 ){
            that.data.kefuCount++;
          }
          console.log('=========that.kefuCount=====', that.data.kefuCount)
          // if (partials[i].partialType == 15 && partials[i].relateBean && partials[i].relateBean.length != 0) {
          //   for (let j = 0; j < partials[i].relateBean.length; j++) {
          //     if (partials[i].relateBean[j].tags && partials[i].relateBean[j].tags != '') {
          //       let tagArray = partials[i].relateBean[j].tags.slice(1, -1).split("][")
          //       partials[i].relateBean[j].tagArray = tagArray;
          //     }
          //   }
          // }
          // 产品标签的转化为数组end
          if (typeof (partials[i].jsonData) == "string") {
            partials[i].jsonData = JSON.parse(partials[i].jsonData)
          } else {
            continue;
          }

          console.log("=====partials=====", partials)
          PaiXuPartials.push(partials[i]);
        }
        wx.getSystemInfo({
          success: function (res) {
            let screenHeight = Math.floor(res.screenHeight * 0.618);
            let kefuHeight = Math.floor(that.data.kefuCount * ((65 + 20) / 2))
            console.log('===screenHeight====', screenHeight);
            let defaultTop = screenHeight - kefuHeight
            console.log('defaultTop', defaultTop)
            that.setData({
              defaultTop: defaultTop
            })
          },
        })
      }
      this.setData({ PaiXuPartials: PaiXuPartials })
      console.log(this.data.PaiXuPartials)
    },

  },
})