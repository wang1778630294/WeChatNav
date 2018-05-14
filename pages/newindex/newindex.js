// pages/newindex/newindex.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer:null,
    isload:false
  },

  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // 来自页面内转发按钮
      console.log(res.target)
    }
    return {
      title: '哈喽',
      path: '/pages/xzmap/xzmap',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
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
    
    setInterval(()=>{
      console.log("2222222222222");
    },1000)



  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log("页面出现了.....");
    wx.showToast({
      title: '页面出现了',
      icon: 'success',
      duration: 5000
    })
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