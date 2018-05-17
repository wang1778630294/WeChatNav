// pages/xzmap/xzmap.js
let retuestTimer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    viewUrl: "",
    navurl:'',
    timer: null,
    retuestTimer: null,
    accelerationsArr: [],
    directionArr: [],
    isClearDir:false,
    directionArrios: [],
    friendOpenId: null,
    passinfo: {
      direction: [],
      openId: '',
      beacons: [],
      accelerations: [],
      accsessToken: '',
      time: '',
      deviceType: '',
      headurl: ''
    }
  },

  // 分享
  onShareAppMessage: function (res) {
    let _that = this;
    return {
      title: '分享我的位置',
      path: '/pages/xzmap/xzmap?openId=' + _that.data.passinfo.openId,
      success: function (res) {
        wx.getShareInfo({
          shareTicket: res.shareTickets[0],
          success: function (res) { 

            /**
             * 1.创建websocket  获取sessionId
             * 
             * 2.把sessionId   传递到分享的页面
             * 
             * */ 
        

            _that.setData({
              viewUrl: "https://xzdqnavi.powerlbs.com/find_people/#wechat_redirect?openId=o5FDx5GxcZ0PvWxgnRoqIVVHm0dw&friendId="
            })
          },
          fail: function (res) {
            
          },
          complete: function (res) { 

          }
        })
      },
      fail: function (res) {
        // 转发失败
        
      }
    }
  },
  
  /**
   * 获取openId
   */
  getOpenId: function () {
    let _that = this;
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发起网络请求
          wx.request({
            url: 'https://xzdqnavi.powerlbs.com/wechat/openid',
            data: {
              code: res.code
            },
            success: (res) => {
              let _that = this;
              this.data.passinfo.openId = res.data.data;
              if (_that.data.friendOpenId) {
                this.setData({
                  viewUrl: "https://xzdqnavi.powerlbs.com/zkjdnav#wechat_redirect?openId=" + res.data.data + "&friendId=" + _that.data.friendOpenId
                })
              }else{
                this.setData({
                  viewUrl: this.navurl + "?openId=" + _that.data.passinfo.openId + "&friendId="
                })
              }

              wx.openBluetoothAdapter({
                success: (res) => {
                  // 获取所有设备信息
                  this.obtainData();
                },
                fail: function (res) {
                  wx.showToast({
                    title: '请打开您的蓝牙',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.onBluetoothAdapterStateChange(function (res) {
                    if (res.available === true) {
                      wx.showToast({
                        title: '执行代码',
                        icon: 'success',
                        duration: 3000
                      })
                      _that.obtainData();
                    }
                  })
                }
              })

            },
          })
        }
      }
    });
  },


  /**
   * 初始化蓝牙
   */
  openBluetooth: function () {
    let _that = this;
    wx.openBluetoothAdapter({
      success: (res) => {
        // 获取所有设备信息
        this.obtainData();
      },
      fail: function (res) {
        wx.showToast({
          title: '请打开您的蓝牙',
          icon: 'success',
          duration: 2000
        })
        setTimeout(function () {
          _that.openBluetooth();
        }, 5000)
      }
    })
  },



  /**
   * 开始获取ibeacon
   */
  startBeaconDiscovery: function(){
    let _that = this;
    wx.startBeaconDiscovery({
      uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'], //西站
      success(res) {
        console.log("开始了");
        console.log(res);
        // 监听设备信息,兼容安卓设备onBeaconUpdate方法

          let info = wx.getSystemInfoSync()
          let sys = info.system;
          let sysArr = sys.split(' ');
          _that.data.passinfo.deviceType = sysArr[0];
          if (sysArr[0] === "iOS") {
            wx.onBeaconUpdate((res) => {
              _that.data.passinfo.beacons = res.beacons
            })
          } else {
            _that.data.timer = setTimeout(() => {
              wx.getBeacons({
                success: (res) => {
                  console.log(res);
                  _that.data.passinfo.beacons = res.beacons
                }
              })

              _that.stopBeaconDiscovery();
            }, 1000)
          }

      },
      fail: function () {
        console.log("打开失败了");
      }
    })
  },

  /**
   * 重新获取ibeacon
   */
  stopBeaconDiscovery: function () {
    let _that = this;
    wx.stopBeaconDiscovery({
      success: function (res) {
        console.log("结束了");
        _that.startBeaconDiscovery();
      },
      fail:function(){
        console.log("结束失败了");
      }
    })
  },

  /**
   * 传递数据
   */
  postData: function () {
    let time = Date.parse(new Date());
    this.data.passinfo.time = time;
    let _that = this;


    if (this.data.passinfo.deviceType == "iOS" && this.data.directionArrios.length > 0) {
      this.data.passinfo.direction = this.data.directionArrios;
    }
    if (this.data.passinfo.deviceType == "Android") {
      this.data.passinfo.direction = this.data.directionArr;
    }

    this.data.passinfo.accelerations = this.data.accelerationsArr;

    wx.request({
      url: 'https://xzdqnavi.powerlbs.com/wechat/locate',
      data: _that.data.passinfo,
      method: 'POST',
      success: function (res) {
        retuestTimer = setTimeout(function(){
          _that.postData();
        },1000);
        
      }
    })

    

    if (this.data.directionArr.length>4){
      this.data.directionArr = [];
    };
    if (this.data.isClearDir) {
        this.data.directionArrios = [];
      this.data.isClearDir = false;
    }
    this.data.accelerationsArr = [];


  },


  /**
   * 获取手机定位信息
   */
  obtainData: function(){
    if (retuestTimer) {
      clearInterval(retuestTimer);
    }
    let _that = this;

    // 开始捕获ibeacon
    this.startBeaconDiscovery();


    // 监听罗盘仪
    wx.onCompassChange((res) => {
      this.data.directionArr.push(res.direction);
      this.data.directionArrios.push(res.direction);
      this.data.isClearDir = true;
    })
    // 获取加速针
    wx.onAccelerometerChange((res) => {
      this.data.accelerationsArr.push(res);
    })
   
    
    // 将获取到的信息发送至服务器;
    this.postData();

    // retuestTimer = setInterval(this.postData,1000);

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    if (options.sessionId) {

      /**
       * 如果有sessionId, 是好友分享的页面
       * 储存sessionId 
       * 
       */

      this.data.friendOpenId = options.sessionId;

      wx.showToast({
        title: this.data.friendOpenId,
        icon: 'success',
        duration: 20000
      })

    }


    this.navurl = options.navurl;
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {

      },
      fail: function (res) {

      }
    })
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
    let _that = this;
    // 获取openid
    this.getOpenId();

    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopBeaconDiscovery();
    clearInterval(retuestTimer);
    clearTimeout(this.data.timer);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(retuestTimer);
    clearTimeout(this.data.timer);
  }
})