
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formCommitId:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    console.log(options)
    that.setData({ formCommitId: options.custom_form_commit_id})
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
    let that=this;
    that.selectComponent("#checkFormDetail").onShow();
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
    let that=this;
    that.selectComponent("#checkFormDetail").onPullDownRefresh();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let that = this;
    console.log('onReachBottom')
    that.selectComponent("#checkFormDetail").onReachBottom();
    // if (that.totalSize) {
    //   if (that.totalSize > that.curPage * that.pageSize) {
    //     that.getCommentData(that.data.allFormData.id, ++that.curPage);
    //   } else {
    //     console.log("没有更多数据了");
    //   }
    // }else{

    // }
  },

})