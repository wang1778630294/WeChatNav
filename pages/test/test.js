// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
  
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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