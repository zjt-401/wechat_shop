

const app = getApp()

Page({

  data: {
    setting: null, // setting   
    sysWidth: 320,//图片大小
    localPoint: { longitude: '0', latitude:'0'},
    address:"",
    addressList:[],
  },
  toIndex(){
    app.toIndex()
  },
  clickcontrol(e) {//回到定位的
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
    
  },
  getSearchProductName:function(e){
    let that=this;
    console.log("=====getSearchProductName=====", e);
    console.log("=====getSearchProductName----value=====", e.detail.value);
    let name = e.detail.value || ''
    let param={
      name: name,
    }
    param  = Object.assign({}, param, that.data.localPoint)
    that.getSearchLoctionAddr(param)
  },
  getSearchLoctionAddr: function (param) {
    let that = this
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    let customIndex = app.AddClientUrl("/search_location_by_name.html", param, 'get')
    wx.request({
      url: customIndex.url,
      header: app.header,
      success: function (res) {
        console.log("==getLoctionAddr==", res.data)
        if (res.data.status == 0) {
          wx.hideLoading()
          let result = res.data.results;
          let arr=[]
          for (let i = 0; i < result.length;i++){
            let address={}
            address = {
              simpleAddress: result[i].name,
              detailedAddress: result[i].address,
              longitude: result[i].location.lng,
              latitude: result[i].location.lat,
              province: result[i].province,
              city: result[i].city,
              street: result[i].address,
            };
            arr.splice(arr.length, 1, address)
          }
          that.setData({ addressList: arr })
          console.log("==addressList==", that.data.addressList)
        } else {
          wx.showToast({
            title: '加载失败...',
            icon: 'none',
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '加载失败...',
          icon: 'none',
        })
        wx.hideLoading()
        app.loadFail()
      }
    })
  },
  selectAddressFun: function (e) {
    let that = this;
    let address={};
    console.log("=====选择地点=====", e)
    let item = e.currentTarget.dataset.item;
    address={
      longitude: item.longitude,
      latitude: item.latitude,
      value: item.detailedAddress,
      province: item.province,
      city: item.city,
      street: item.street,
    }
    let pages = getCurrentPages();//当前页面
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      selectAddress: address,
    });
    wx.navigateBack(
      { delta: 1, }
    )
  },
  getCenterPoint(callback){
    let that = this;
    var mapCtx = wx.createMapContext('map')
    mapCtx.getCenterLocation({
      success: function (res) {
        console.log('res', res)
        that.getLoctionAddr(res.longitude, res.latitude)
        that.params.latitude = res.latitude;
        that.params.longitude = res.longitude;
        that.setData({
          params: that.params,
        })
        if (callback){
          callback(that.params,2)
        }
      }
    }) //获取当前地图的中心经纬度
  },
  regionchange(e) {
    console.log('===regionchange===',e)
    if (e.type == 'end') {
      if (e.causedBy =='scale'){
        console.log('====scale====')
      } else if(e.causedBy == 'drag') {
        console.log('====drag====');
        this.getCenterPoint(this.getData);
        }else{
        console.log('====all====');
        this.getCenterPoint(this.getData);
        }
    }
  },
  markertap(e) {
    console.log(e.markerId)
    this.toProductDetailMap(e.markerId);
  },
  controltap(e) {
    console.log(e)
  },
  hiddenProInfo(e){
    console.log(e)
    this.setData({productDetail:null})
  },
  /* 全部参数 */
  params: {
    latitude:'0',
    longitude:'0',

  }, 
  getLoctionAddr: function (longitude, latitude) {
    var that = this
    var param = {}
    param.longitude = longitude
    param.latitude = latitude
    wx.showToast({
      title: '加载中...',
      icon: 'loading',
    })
    var customIndex = app.AddClientUrl("/get_location_detail.html", param, 'get')
    wx.request({
      url: customIndex.url,
      header: app.header,
      success: function (res) {
        console.log("==getLoctionAddr==",res.data)
        if (res.data.status == 0) {
          wx.hideLoading()
          let result = res.data.result
          let address = { 
            simpleAddress: result.sematic_description, 
            detailedAddress: result.formatted_address,
            longitude: result.location.lng,
            latitude: result.location.lat,
            province: result.addressComponent.province,
            city: result.addressComponent.city,
            street: result.addressComponent.street,
            };
          let addressList=[];
          addressList.splice(0, 1, address)
          console.log("====addressList====", addressList)
          that.setData({ address: address, addressList: addressList})
        }else{
          wx.showToast({
            title: '加载失败...',
            icon: 'none',
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: '加载失败...',
          icon: 'none',
        })
        wx.hideLoading()
        app.loadFail()
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    that.initSetting();
    wx.getLocation({
      type: 'gcj02', //返回可以用于wx.openLocation的经纬度
      success: function (res) {
        console.log(res)
        that.data.localPoint.latitude = res.latitude
        that.data.localPoint.longitude = res.longitude
        that.getLoctionAddr(res.longitude, res.latitude)
        console.log("options", options)
        for (let i in options) {
          for (let j in that.params) {
            if (i.toLowerCase() == j.toLowerCase()) { that.params[j] = options[i] }
          }
        }
        that.setData({
          params: that.params,
          localPoint: that.data.localPoint
        })
        console.log(that.params)
      }
    })
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },
  initSetting(){
    this.setData({ setting: app.setting })
    for (let i = 0; i < this.data.setting.platformSetting.categories.length; i++) {
      this.data.setting.platformSetting.categories[i].colorAtive = '#888';
    }
    this.data.setting.platformSetting.categories[0].colorAtive = this.data.setting.platformSetting.defaultColor;
    this.setData({
      setting: this.data.setting,
    })
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
    var that = this
    
  },

})