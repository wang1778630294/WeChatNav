// pages/map/map.js
let accelerationsArr = [];
let directionArr = [];
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer:null,
    passinfo:{
      direction:[],
      openId:'',
      beacons:[],
      accelerations:[],
      accsessToken:'',
      time:'',
      deviceType:''
    }
  },

  /**
   * 获取openId
   */
  getOpenId:function () {  
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发起网络请求
          wx.request({
            url: 'https://xzdqnavi.powerlbs.com/wechat/openid',
            data: {
              code:res.code
            },
            success: (res) => {
              this.data.passinfo.openId = res.data.data;
            },
          })
        } else {

        }
      }
    });
  },

  /**
   * 监听罗盘仪
   */
  compass: function() {
    wx.onCompassChange((res) => {
      directionArr.push(res.direction);
    })
  },


  /**
   * 初始化蓝牙
   */
  initBluetooth: function() {
    wx.openBluetoothAdapter({
      success: (res) => {
        // wx.showToast({
        //   title: '蓝牙打开成功',
        //   icon: 'success',
        //   duration: 2000
        // })
      },
      fail: function (res) {
        // fail 
        // wx.showToast({
        //   title: '请打开您的蓝牙',
        //   icon: 'success',
        //   duration: 2000
        // })
      }
    })
  },

  /**
   * 获取蓝牙状态信息
   */
  getBluetoothAdapterState: function() {
    wx.getBluetoothAdapterState({
      success: (res) => {

      }
    })
  },

  /**
   * 开始获取ibeacon
   */
  startBeaconDiscovery: function() {
    wx.startBeaconDiscovery({
      uuids: ['FDA50693-A4E2-4FB1-AFCF-C6EB07647825'],
      success(res) {
        
      },
      fail(err) {

      }
    })
  },

  /**
   * 停止获取ibeacon
   */
  stopBeaconDiscovery: function() {
    wx.stopBeaconDiscovery({
      success: function (res) { 
        
      }
    })
  },
  
  
  /**
   * 获取ibeacons
   */
  getBeacons: function() {
    wx.getBeacons({
      success: (res) => {
        console.log(res);
        this.data.passinfo.beacons = res.beacons
      }
    })
  },

  /**
   * 获取ibeacon更新事件
   */
  onBeaconUpdate: function() {
    wx.onBeaconUpdate(function(res){
      console.log(res);
      this.data.passinfo.beacons = res.beacons
    })
  },

  /**
   * 获取加速针
   */
  accelerometer: function() {
    let that = this;
    wx.onAccelerometerChange((res) => {1
      accelerationsArr.push(res);
    })
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
    this.getOpenId();

    this.compass();

    this.accelerometer();

    this.initBluetooth();

    this.getBluetoothAdapterState();

    this.startBeaconDiscovery();

    try {
      var res = wx.getSystemInfoSync()
      let sys = res.system;
      let sysArr = sys.split(' ');
      this.data.passinfo.deviceType = sysArr[0];
      if (sysArr[0] === "iOS") {
        this.onBeaconUpdate();
      } else {
        this.timer = setInterval(() => {
          this.getBeacons();
        }, 1000)
      }
    } catch (e) {
      // Do something when catch error
    }

    setInterval(()=>{
      let time = Date.parse(new Date());
      this.data.passinfo.time = time;
      this.data.passinfo.direction = directionArr;
      this.data.passinfo.accelerations = accelerationsArr;
      wx.request({
        url: 'https://xzdqnavi.powerlbs.com/wechat/locate',
        data: this.data.passinfo,
        method:'POST',
        success:function(res){

        }
      })

      directionArr = [];
      accelerationsArr = [];

    },1000)



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
    this.stopBeaconDiscovery();
    clearInterval(this.timer);
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