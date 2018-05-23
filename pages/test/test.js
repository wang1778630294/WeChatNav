// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: true
  },
  

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },
  onLoad: function(){
    let _that = this;
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          _that.setData({
            canIUse : false
          })
        }
      }
    })
  },
  /**
   * openBluetooth
   */
  openBluetooth: function(){
    let _that = this;
    wx.openBluetoothAdapter({
      success: (res) => {
        // 获取所有设备信息
        wx.showToast({
          title: '打开成功',
          icon: 'success',
          duration: 2000
        })
      },
      fail: function (res) {
        setTimeout(function(){
          _that.openBluetooth();
        },5000)
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.openBluetooth();
  }
})