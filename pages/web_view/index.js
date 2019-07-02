
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:"https://www.baidu.com/",
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onloadOpt:{},
  onLoad: function (options) {
    let that=this;
    console.log("===options==", options)
    let url = decodeURIComponent(options.url)
    that.setData({ url: url || "https://www.baidu.com/" })
    console.log("===url==", that.data.url)
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
})