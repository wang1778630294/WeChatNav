// pages/xzmap/xzmap.js
let retuestTimer = null;
var MAJOR = "10048";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    viewUrl: "",
    navurl:'https://xzdqnavi.powerlbs.com/xzdqnavi2#wechat_redirect',
    timer: null,
    retuestTimer: null,
    accelerationsArr: [],
    directionArr: [],
    isClearDir:false,
    directionArrios: [],
    sessionId:'',
    avatarUrl:'',
    isOpen: true,
    uuid:[],
    isFirst: true,
    lastBeaconArr: true,
    stopTimer: null,
    openTimer: null,
    postTimer: null,
    reststartTimer: null,
    devInfo: null,
    canIUse: false,
    passinfo: {
      // direction: [],
      openId: '',
      beacons: '',
      // accelerations: [],
      time: '',
      deviceType: ''
    }
  },


  // 分享
  onShareAppMessage: function (res) {

    let _that = this;

    /**
     * 1.创建websocket  获取sessionId
     * 
     * 2.把sessionId   传递到分享的页面
     * 
     * */

    let sessionId = "";
    if (_that.data.sessionId) {
      sessionId = _that.data.sessionId;
    }else{
      sessionId = _that.data.passinfo.openId + 'session';
    }

    return {
      title: '分享我的位置',
      path: '/pages/wel/wel?openId=' + _that.data.passinfo.openId + "&sessionId=" + sessionId + '&avatarUrl=' + _that.data.avatarUrl,
      imageUrl: '/pages/test/images/xcx.jpg',
      success: function (res) {
        _that.data.isOpen = false;
        if (!_that.data.sessionId) {
          _that.setData({
            viewUrl: "https://xzdqnavi.powerlbs.com/find_people_xz/#wechat_redirect?openId=" + _that.data.passinfo.openId + "&sessionId=" + sessionId + "&avatarUrl=" + _that.data.avatarUrl 
          })
        }
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
              _that.data.passinfo.openId = res.data.data;

              if (!_that.data.sessionId && _that.data.isOpen) {
                _that.setData({
                  viewUrl: _that.data.navurl + "?" + _that.data.passinfo.openId
                })
              }
              
              wx.openBluetoothAdapter({
                success: (res) => {
                  // 获取所有设备信息
                  _that.obtainData();
                },
                fail: function (res) {
                  wx.showToast({
                    title: '请打开您的蓝牙',
                    icon: 'success',
                    duration: 2000
                  })
                  wx.onBluetoothAdapterStateChange(function (res) {
                    if (res.available === true) {
                    
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
        // this.obtainData();
      },
      fail: function (res) {
        wx.showToast({
          title: '请打开您的蓝牙',
          icon: 'success',
          duration: 2000
        })

        if (_that.data.openTimer) {
          clearTimeout(_that.data.openTimer);
        }

        _that.data.openTimer = setTimeout(function () {
          _that.openBluetooth();
        }, 5000)
      }
    })
  },


  /**
   * beacon去同方法;
   */
  // beaconRemoveRame: function(lastBeacons,beacons){
  //   let newBeacons = [];
  //   if (beacons.length>0) {
  //     newBeacons = beacons;
  //     for (let i = 0; i < beacons.length; i++) {
  //       if (beacons[i]!==undefined) {
  //         for (let j = 0; j < lastBeacons.length; j++) {
  //           if (lastBeacons[j] !== undefined) {
  //             if (beacons[i].minor == lastBeacons[j].minor && beacons[i].rssi == lastBeacons[j].rssi) {
  //               newBeacons.splice(i, 1);
  //             }
  //           }
            
  //         }
  //       }
  //     }
  //   }else{
  //     newBeacons = lastBeacons;
  //   }
  //   return newBeacons;
  // },


  /**
   * 获取设备信息
   */
  getInfo:function(){
    let _that = this;
    try {
      let info = wx.getSystemInfoSync()
      let sys = info.system;
      let sysArr = sys.split(' ');
      _that.data.passinfo.deviceType = sysArr[0];
      if (sysArr[0] === "iOS") {
        this.data.devInfo = "IOS";
      } else {
        this.data.devInfo = "Android";
        this.setOut();
      }

    } catch (e) {
      // Do something when catch error
    }
  },


  /**
   * 开始获取ibeacon
   */
  startBeaconDiscovery: function () {

    let _that = this;
    wx.startBeaconDiscovery({
      // uuids: _that.data.uuid, //西站
      uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408'],    //西站
      // uuids: ['FDA50693-A4E2-4FB1-AFCF-C6EB07647825'],    //劲点
      success(res) {
        // 监听设备信息,兼容安卓设备onBeaconUpdate方法
      },
      fail: function () {

      }
    })

    if (this.data.devInfo == "IOS") {
      wx.onBeaconUpdate((res) => {
        let beacons_ios = '';
        for (let i=0;i<res.beacons.length;i++) {
          if (res.beacons[i].major == MAJOR) {
            beacons_ios += res.beacons[i].major + ',' + res.beacons[i].minor + ',' + res.beacons[i].rssi + ';';
          }
        }
        _that.data.passinfo.beacons = beacons_ios;
      })
    }
    
    if (this.data.devInfo == "Android") {

      if (_that.data.timer) {
        clearInterval(_that.data.timer);
      }

      wx.onBeaconUpdate((res) => {
        
        if (res.beacons.length > 0) {
          // for (let i = 0; i < res.beacons.length; i++) {
          //   res.beacons[i]["uuid"] = res.beacons[i].uuid.toLocaleUpperCase();
          // }

          // _that.data.passinfo.beacons = res.beacons;

          let beacons_android = '';
          for (let i = 0; i < res.beacons.length; i++) {
            if (res.beacons[i].major == MAJOR) {
              beacons_android += res.beacons[i].major + ',' + res.beacons[i].minor + ',' + res.beacons[i].rssi + ';';
            }
          }

          _that.data.passinfo.beacons = beacons_android;
          

        }
      })
    }
  },

  

  /**
   * 重新获取ibeacon
   */
  restStartDiscovery: function() {
    let _that = this;
    wx.stopBeaconDiscovery({
      success: function (res) {
        _that.startBeaconDiscovery();
      },
      fail: function () {

      }
    })
  },

  /**
   * 定时重启
   */
  setOut: function(){
    let _that = this;
    if (_that.data.stopTimer) {
      clearTimeout(_that.data.stopTimer);
    }

    _that.data.stopTimer = setTimeout(() => {
      _that.restStartDiscovery();
    }, 6500)
  },


  stopBeaconDiscovery: function () {
    let _that = this;
    wx.stopBeaconDiscovery({
      success: function (res) {

      },
      fail: function () {

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
    let socketOpen = false;

    // if (this.data.passinfo.deviceType == "iOS" && this.data.directionArrios.length > 0) {
    //   this.data.passinfo.direction = this.data.directionArrios;
    // }
    // if (this.data.passinfo.deviceType == "Android") {
    //   this.data.passinfo.direction = this.data.directionArr;
    // }

    // this.data.passinfo.accelerations = this.data.accelerationsArr;

    wx.connectSocket({
      url: 'wss://xzdqnavi.powerlbs.com/wechat/locate',
      success: function (res) {
      
      },
      fail: function (res) {

      }
    })

    wx.onSocketOpen(function (res) {
      socketOpen = true;
      if (retuestTimer) {
        clearInterval(retuestTimer);
      }
      retuestTimer = setInterval(function () {
        time = Date.parse(new Date());
        _that.data.passinfo.time = time;
        sendSocketMessage(_that.data.passinfo);
      }, 1500);

    })

    wx.onSocketError(function (res) {
    
    })

    function sendSocketMessage(msg) {
      if (socketOpen) {
        let _data = JSON.stringify(msg);
        console.log(_data);
        wx.sendSocketMessage({
          data: _data,
          success: function(res){

          },
          fail: function(res){
     
          }
        })
      }
    }


    // wx.onSocketOpen(function (res) {
    //   retuestTimer = setTimeout(function(){
    //     wx.sendSocketMessage({
    //       data: _that.data.passinfo
    //     })
    //   },1500);

    // })


    // wx.request({
    //   url: 'https://xzdqnavi.powerlbs.com/wechat/locate',
    //   data: _that.data.passinfo,
    //   method: 'POST',
    //   success: function (res) {
        
    //     // retuestTimer = setTimeout(function(){
    //     //   _that.postData();
    //     // },1500);
        
    //   }
    // })

    // if (this.data.directionArr.length>4){
    //   this.data.directionArr = [];
    // };
    // if (this.data.isClearDir) {
    //     this.data.directionArrios = [];
    //   this.data.isClearDir = false;
    // }
    // this.data.accelerationsArr = [];


  },


  /**
   * 获取手机定位信息
   */
  obtainData: function () {
    
    let _that = this;


    // 开始捕获ibeacon

    this.startBeaconDiscovery();

    // 监听罗盘仪
    // wx.onCompassChange((res) => {
    //   this.data.directionArr.push(res.direction);
    //   this.data.directionArrios.push(res.direction);
    //   this.data.isClearDir = true;
    // })
    // 获取加速针
    // wx.onAccelerometerChange((res) => {
    //   this.data.accelerationsArr.push(res);
    // })

    this.postData();
    // retuestTimer = setInterval(this.postData, 1500);

  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _that = this;

    this.data.uuid.push(options.uuid);

    wx.getUserInfo({
      complete: function (data) {
        if (data.userInfo) {
          _that.data.avatarUrl = data.userInfo.avatarUrl;
        }else{
          _that.setData({
            canIUse: true
          })
        }
      }
    });

    if (options.sessionId) {
      _that.data.isOpen = false;

      /**
       * 有sessionId 好友分享的页面
       * 储存sessionId 
       */
      _that.data.sessionId = options.sessionId;

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

                this.data.passinfo.openId = res.data.data;

                _that.setData({
                  viewUrl: "https://xzdqnavi.powerlbs.com/find_people_xz/#wechat_redirect?openId=" + _that.data.passinfo.openId + "&sessionId=" + options.sessionId + "&avatarUrl=" + _that.data.avatarUrl
                })

                // wx.navigateTo({
                //   url: "/pages/find/find?openId=" + _that.data.passinfo.openId + "&sessionId=" + options.sessionId + "&avatarUrl=" + _that.data.avatarUrl,
                // })

              },
            })
          };
        }
      });
    }


    // this.navurl = options.navurl;

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let _that = this;
    this.getInfo();


    wx.getSetting({
      success: (res) => {

        
      }
    })

    wx.getLocation({
      type: 'wgs84',
      success: function (res) {

      },
      fail: function(res){
        setTimeout(() => {
          wx.showToast({
            title: '请授予定位权限',
            icon: 'success',
            duration: 3000
          })
        }, 2000)
      }
    })

    wx.onNetworkStatusChange(function (res) {
      if (res.isConnected) {
        _that.obtainData();
      }

    })

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _that = this;
    // 获取openid
    this.getOpenId();
    // this.obtainData();


  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.stopBeaconDiscovery();
    clearInterval(retuestTimer);
    clearTimeout(this.data.timer);

    wx.closeSocket({
      success: function(res){
      },
      fail: function(res){

      },
      complete: function(res){

      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(retuestTimer);
    clearTimeout(this.data.timer);
  }
  
})