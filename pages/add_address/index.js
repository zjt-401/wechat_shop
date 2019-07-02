

const app = getApp()
Page({
 
  /**
   * 页面的初始数据
   */
  data: {
    longitude:0,
    latitude:0,
    region: ['省', '市', '区'],
    needParam: null, 
    setting: null,
    loginUser: null,
    ifEid: false,
    addressType:0,
    reqType:"",
    reqLocation:false,
  },


  needParam:{
    platformNo:'',
    userId:'',
    contactName: '',
    telno: '',
    province: '',
    city: '',
    district: '',
    detail: '', //详细地址
    longitude: '',
    latitude: '',
    defaultAddress: 0,
  },
  //名字
  getName: function(e) {
    this.needParam.contactName = e.detail.value
  },
  getPhone: function (e) {
    this.needParam.telno = e.detail.value
  },
  getCardNo: function (e) {
    this.needParam.idCardNo = e.detail.value
  },
  getAddr: function (e) {
    this.needParam.detail = e.detail.value
  },
  defaultAddressChange: function(e) {
    this.needParam.defaultAddress = e.detail.value[0]
  },

  tolinkUrl: function (e) {
    if (!app.loginUser) {
      wx.showModal({
        title: '提示',
        content: '主人~您还在登陆哦!稍等片刻',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    let that = this;
    let linkUrl = e.currentTarget.dataset.link
    if (linkUrl.indexOf("select_location.html") != -1) {
      console.log("选择位置")
      that.setData({ reqLocation: true })
    } else {
      that.setData({ reqLocation: false })
    }
    app.linkEvent(linkUrl)
  },
  dellAddrSpace:function(e){
    let that=this;
    console.log('===dellAddrSpace===',e)
    // let phoneTest = new RegExp('^1[3|4|5|7|8][0-9]{9}$', 'g');
    let testphone = e.telno
    let idCardNo = e.idCardNo
    let pass = '0'
      if (e.contactName == ''){
      pass = '收货人为空'
    } if (e.telno == '') {
      pass = '联系方式为空'
      } if (e.detail == '') {
      pass = '详细地址为空'
    } if (e.province == '') {
      pass = '请选择地区'
    } if (e.district == '') {
      pass = '请选择地区'
    }
    /* if (e.longitude == '') {
      pass = '正在定位请稍等提交'
    } if (e.latitude == '') {
      pass = '正在定位请稍等提交'
    } */ 
    if (!testphone || testphone.length != 11) {
      pass = '手机号码不正确'
    }
    if ((!idCardNo || idCardNo.length != 18) && that.data.addressType==1) {
      pass = '身份证号不正确'
    }
    return pass
  },
  subMitArrFrom: function(e) {
    console.log("这是参数" + JSON.stringify(this.needParam))
    var that = this
    /* 判断地址是否有空的 */
    let pass = this.dellAddrSpace(this.needParam)
    if (pass == '0'){
      /* 判断是编辑还是新增 */
      var customIndex = null
      if (!this.data.ifEid) {
        customIndex = app.AddClientUrl("/add_address.html", that.needParam,'post')
      }
      else {
        customIndex = app.AddClientUrl("/edit_address.html", that.needParam, 'post')
      }
      wx.showLoading({
        title: 'loading',
        mask: true
      })

      wx.request({
        url: customIndex.url,
        data: customIndex.params,
        header: app.headerPost,
        method: 'POST',
        success: function (res) {
          console.log(res)
          wx.hideLoading()
          if (res.data.errcode=='0'){
            app.addrEditParam = that.needParam
            if (that.data.reqType == 'order') {
              console.log("订单选择地址")
              let pages = getCurrentPages();//当前页面
              let prevPage = pages[pages.length - 2];//上一页面
              prevPage.setData({//直接给上移页面赋值
                selectAddress: res.data.relateObj,
              });
            } 
            wx.navigateBack(
              { delta: 1,}
            )
          }else{
            wx.showModal({
              content: res.data.errMsg,
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                }
              }
            });
          }
        },
        fail: function (res) {
          wx.hideLoading()
          app.loadFail()
        }
      })
    } else{
      wx.showToast({
        title: pass,
        image: '/images/icons/tip.png',
        duration: 2000
      })
    }
   
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.needParam.province = e.detail.value[0]
    this.needParam.city = e.detail.value[1]
    this.needParam.district = e.detail.value[2]
    this.setData({
      region: e.detail.value,
      needParam: this.needParam
    })
  },


  getLoctionAddr: function (longitude, latitude) {
    var that = this
    var param = {}
    param.longitude = longitude
    param.latitude = latitude
    var customIndex = app.AddClientUrl("/get_location_detail.html", param, 'get')
    wx.request({
      url: customIndex.url,
      header: app.header,
      success: function (res) {
        console.log(res.data)
        let addressComponent = res.data.result.addressComponent
        that.needParam.province = addressComponent.province
        that.needParam.city = addressComponent.city
        that.needParam.district = addressComponent.district
        that.needParam.detail = addressComponent.street
        that.data.region[0] = addressComponent.province
        that.data.region[1] = addressComponent.city
        that.data.region[2] = addressComponent.district
        that.data.needParam.detail = addressComponent.street
        that.setData({ region: that.data.region, needParam:that.data.needParam})
        wx.hideLoading()
      },
      fail: function (res) {
        wx.hideLoading()
        app.loadFail()
      }
    })
  },
  onLoad: function (options) {
    var that =this
    console.log(options)
    if (options.type) {
      that.setData({ reqType: 'order' })
    } else {
      that.setData({ reqType: 'normal' })
    }
    if (!options.addrId){
      this.setData({ ifEid:false })
      wx.getLocation({
        type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
        success: function (res) {
          // success  
          var longitude = res.longitude
          var latitude = res.latitude;
          that.getLoctionAddr(longitude,latitude)
          that.needParam.longitude = longitude
          that.needParam.latitude = latitude
          that.setData({ needParam: that.needParam })
        },
        fail: function () {
          // fail  
        },
        complete: function () {
          // complete  
        }
      })
    }else{
      wx.setNavigationBarTitle({
        title: '修改地址'
      })
      var editaddr = app.EditAddr
      this.setData({ ifEid: true })

      this.needParam.province = editaddr.province
      this.needParam.city = editaddr.city
      this.needParam.district = editaddr.area
      this.needParam.latitude = editaddr.latitude
      this.needParam.longitude = editaddr.longitude
      this.needParam.detail = editaddr.address

      this.needParam.contactName = editaddr.contactName
      this.needParam.telno = editaddr.telNo
      this.needParam.idCardNo = editaddr.idCardNo||""
      this.needParam.defaultAddress = editaddr.defaultAddress
      this.needParam.userId = editaddr.belongUserId
      this.needParam.addressId = editaddr.id

      this.data.region[0] = this.needParam.province
      this.data.region[1] = this.needParam.city
      this.data.region[2] = this.needParam.district
      this.setData({ region: this.data.region })
    }
    this.setData({ needParam: this.needParam })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.setData({ 
      setting: app.setting, 
      addressType: app.setting.platformSetting.addressType, 
      loginUser: app.loginUser
      })
    this.needParam.platformNo = app.setting.platformSetting.platformNo
    this.needParam.userId = app.loginUser.id
    console.log('==this.setting===', this.data.setting)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that=this;
    if (that.data.reqLocation) {
      let locationList = {};
      console.log("从选择地点页面返回", that.data.selectAddress)
      var pages = getCurrentPages();
      var currPage = pages[pages.length - 1]; //当前页面
      console.log(currPage) //就可以看到data里mydata的值了
      if (that.data.selectAddress) {
        console.log("选择了地点")
        let longitude = that.data.selectAddress.longitude
        let latitude = that.data.selectAddress.latitude;
        that.getLoctionAddr(longitude, latitude)
        that.needParam.longitude = longitude
        that.needParam.latitude = latitude
        that.setData({ needParam: that.needParam })
        // that.selectAddressFun(that.data.selectAddress)
      } else {
        console.log("没选择地点")
      }
    }
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

})

/* 
  //自动加载地区   但是有问题
  getLocates: function () {
    var that = this
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标  
      success: function (res) {
        // success  
        var longitude = res.longitude
        var latitude = res.latitude
        that.setData({ longitude: longitude, latitude: latitude})
        that.loadCity(longitude, latitude)
      },
      fail: function () {
        // fail  
      },
      complete: function () {
        // complete  
      }
    })

  },
  // 加载地址 
  loadCity: function (longitude, latitude) {
    var that = this
    wx.request({
      url: 'https://api.map.baidu.com/api?v=2.0&ak=iCbvxqCiDKD4dryP2qSRNyh7&location='+latitude+','+longitude+'&output=json',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      success: function (res) {
        // success  
        console.log(res);
        var city = res.data.result.addressComponent.city;
        that.setData({ city: city });
      },
      fail: function () {
        // fail  
      },
      complete: function () {
        // complete  
      }
    })
  },

 */