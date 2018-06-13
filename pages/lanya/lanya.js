// pages/xzmap/xzmap.js
let retuestTimer = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    stopTimer:null,
    resetTimer:null,
    beacons:[],
    index: 0,
    info:"",
    infos:""
  },

  openBluetooth: function () {
    let _that = this;
    wx.openBluetoothAdapter({
      success: (res) => {
        // 获取所有设备信息
        // this.obtainData();
      },
      fail: function (res) {

      }
    })
  },

  /**
   * 蓝牙方法一;
   */

  // lnaya: function(){

  //   let _that = this;

  //   wx.startBeaconDiscovery({
  //     // uuids: _that.data.uuid, //西站
  //     uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408','FDA50693-A4E2-4FB1-AFCF-C6EB07647825'],
  //     success(res) {
  //       // 监听设备信息,兼容安卓设备onBeaconUpdate方法
  //     },
  //     fail: function () {

  //     }
  //   });
  //   wx.onBeaconUpdate((res) => {
  //     wx.getBeacons({
  //       success(data) {
  //         console.log("getbeacons成功了........................");
  //         console.log(data);
  //         _that.data.beacons = data.beacons;
  //       }
  //     })
  //   });

  // },

  /**
   * 蓝牙方法二
   */
  lnaya: function () {

    let _that = this;
    wx.startBeaconDiscovery({
      uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408', 'FDA50693-A4E2-4FB1-AFCF-C6EB07647825'], //西站
      // uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408'],
      success(res) {
        // 监听设备信息,兼容安卓设备onBeaconUpdate方法
      },
      fail: function () {

      }
    })

      wx.onBeaconUpdate((res) => {
        console.log("Android  beacons........................");
        console.log(res);
        if (res.beacons) {
          this.data.beacons = res.beacons;
        }
      })

  },

  /**
   * 蓝牙方法三;
   */

  // lnaya: function(){

  //   let _that = this;

  //   wx.startBeaconDiscovery({
  //     // uuids: _that.data.uuid, //西站
  //     uuids: ['AB8190D5-D11E-4941-ACC4-42F30510B408','FDA50693-A4E2-4FB1-AFCF-C6EB07647825'],
  //     success(res) {
  //       // 监听设备信息,兼容安卓设备onBeaconUpdate方法
  //     },
  //     fail: function () {

  //     }
  //   });

  //   if (this.data.stopTimer) {
  //     clearInterval(this.data.stopTimer);
  //   }

  //   this.stopTimer = setInterval(()=>{
  //     // console.log("getbeacon的定时器")
  //     wx.getBeacons({
  //       success(data) {
  //         console.log("getbeacons成功了........................");
  //         console.log(data.beacons);
  //         _that.data.beacons = data.beacons;
  //       }
  //     })
  //   },200)

  // },


  /**
     * 重新获取ibeacon
     */
  restStartDiscovery: function () {
    let _that = this;
    var guid_ = this.guid();
    console.log("停止之前........................." + guid_)
    wx.stopBeaconDiscovery({
      success: function (res) {
        console.log("停止的success方法..........." + guid_)
        _that.lnaya();
      },
      fail: function () {
        console.log("停止的fail方法..........." + guid_)
      },
      complete: function(res) {
        console.log("停止的complete方法..........." + guid_)

        _that.data.index++;

      }
    })

  },

  guid:function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.openBluetooth();
    this.lnaya();
    
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 重启定时器的代码
    if (this.data.resetTimer) {
      clearInterval(this.data.resetTimer);
    }
    this.data.resetTimer = setInterval(()=>{
      console.log("定时器重启了++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      this.restStartDiscovery();
    },6500)


    // 模拟定时提交
    if (retuestTimer) {
      clearInterval(retuestTimer);
    }
    retuestTimer = setInterval(()=>{
      console.log("提交到后台的beacons.........................");
      console.log(this.data.beacons);
      this.data.infos += "提交到后台的beacons........................." + this.data.beacons;
      this.setData({
        "info": this.data.infos
      })
     

    }, 1500);


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
    
  }
})