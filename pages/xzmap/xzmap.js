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
      path: '/pages/test/test?sessionId=' + sessionId + '&uuid=' + _that.data.uuid,
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
        console.log("转发失败");
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
                  viewUrl: _that.navurl + "?" + _that.data.passinfo.openId
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
  beaconRemoveRame: function(lastBeacons,beacons){
    let newBeacons = [];
    if (beacons.length>0) {
      newBeacons = beacons;
      for (let i = 0; i < beacons.length; i++) {
        if (beacons[i]!==undefined) {
          for (let j = 0; j < lastBeacons.length; j++) {
            if (lastBeacons[j] !== undefined) {
              if (beacons[i].minor == lastBeacons[j].minor && beacons[i].rssi == lastBeacons[j].rssi) {
                newBeacons.splice(i, 1);
              }
            }
            
          }
        }
      }
    }else{
      newBeacons = lastBeacons;
    }
    return newBeacons;
  },


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
      uuids: _that.data.uuid, //西站
      // uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408'],
      success(res) {
        // 监听设备信息,兼容安卓设备onBeaconUpdate方法
      },
      fail: function () {

      }
    })

    if (this.data.devInfo == "IOS") {
      wx.onBeaconUpdate((res) => {
        console.log("IOS  beacons........................");
        console.log(res);
        _that.data.passinfo.beacons = res.beacons
      })
    }
    
    if (this.data.devInfo == "Android") {

      if (_that.data.timer) {
        clearInterval(_that.data.timer);
      }

      _that.data.timer = setTimeout(() => {
        wx.onBeaconUpdate((res) => {
          console.log("Android  beacons........................");
          console.log(res);
          if (res.beacons.length > 0) {
            for (let i = 0; i < res.beacons.length; i++) {
              res.beacons[i]["uuid"] = res.beacons[i].uuid.toLocaleUpperCase();
            }

            _that.data.passinfo.beacons = res.beacons;
          }
        })
      }, 1500)
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


    if (this.data.passinfo.deviceType == "iOS" && this.data.directionArrios.length > 0) {
      this.data.passinfo.direction = this.data.directionArrios;
    }
    if (this.data.passinfo.deviceType == "Android") {
      this.data.passinfo.direction = this.data.directionArr;
    }

    console.log("提交到后台的代码.............................");
    console.log(this.data.passinfo.beacons);
    this.data.passinfo.accelerations = this.data.accelerationsArr;

    wx.request({
      url: 'https://xzdqnavi.powerlbs.com/wechat/locate',
      data: _that.data.passinfo,
      method: 'POST',
      success: function (res) {
        
        // retuestTimer = setTimeout(function(){
        //   _that.postData();
        // },1500);
        
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
  obtainData: function () {
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

    if (_that.data.postTimer) {
      clearTimeout(_that.data.postTimer);
    }

    _that.data.postTimer = setTimeout(function () {
      _that.postData();
    }, 1500)

    retuestTimer = setInterval(this.postData, 1500);

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
              },
            })
          };
        }
      });
    }


    this.navurl = options.navurl;

  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (this.data.devInfo == "Android") {
      this.setOut();
    }
    this.getInfo();
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