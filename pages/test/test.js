// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    canIUse: true,
    jdsrc: "images/jindian.jpg",
    xzsrc: 'images/xizhan1.jpg'
  },

  navTozk: function () {
    wx.navigateTo({
      url: '/pages/xzmap/xzmap?navurl=https://xzdqnavi.powerlbs.com/zkjdnav#wechat_redirect&uuid=FDA50693-A4E2-4FB1-AFCF-C6EB07647825',
    })
  },
  navToxz: function () {
    wx.navigateTo({
      url: '/pages/xzmap/xzmap?navurl=https://xzdqnavi.powerlbs.com/xzdqnavi2#wechat_redirect&uuid=AB8190D5-D11E-4941-ACC4-42F30510B408',
    })
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
   
  },
  onLoad: function (options){
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

    if (options.sessionId) {
      console.log("页面跳转")
      wx.navigateTo({
        url: '/pages/xzmap/xzmap?sessionId=' + options.sessionId + '&uuid=' + options.uuid,
      })
    }

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