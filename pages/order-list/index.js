// pages/order-list/index.js
let commonCityData = require('../../utils/city.js')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusType: ["全部", "待付款", "待发货", "待收货", "已完成"],
    currentType:0,
    tabClass:["","","","","",""]
  },
  statusTap(e){
    let index = e.currentTarget.dataset.index
    this.setData({
      currentType: index
    })
    this.onShow()
  },
  //支付
  toPayTap(e){
    wx.showModal({
      title: '',
      content: '个人展示作品暂不支持支付功能',
      showCancel:false
    })
    let orderId = e.currentTarget.dataset.id
    let money = e.currentTarget.dataset.money
    let postData = {
      token: app.globalData.token,
      money: money,
      remark: "支付订单 ：" + orderId,
      payName: "在线支付",
      nextAction: { type: 0, id: orderId }
    }
    wx.request({
      url: 'https://api.it120.cc/'+app.globalData.urlName+'/pay/wxapp/get-pay-data',
      data: postData,
      success:(res)=>{
        console.log(res.data)
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
  getOrderStatistics(){
    let that = this
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/order/statistics',
      data:{
        token: app.globalData.token
      },
      success:(res)=>{
        let resData = res.data.data
        let tabClass = that.data.tabClass
        if (res.data.code){
          if (resData.count_id_no_pay>0){
            tabClass[1] = 'red-dot'
          }
          if (resData.count_id_no_transfer > 0) {
            tabClass[2] = 'red-dot'
          }
          if (resData.count_id_no_confirm > 0) {
            tabClass[3] = 'red-dot'
          }
          if (resData.count_id_success > 0) {
            tabClass[4] = 'red-dot'
          }
          that.setData({
            tabClass: tabClass
          })
        }
      }
    })
  },
  cancelOrderTap(e){
    let id = e.currentTarget.dataset.id
    let that =this
    wx.showModal({
      title: '确定要取消该订单吗？',
      content: '',
      success:(res)=>{
        if(res.confirm){
          wx.showLoading()
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.urlName + '/order/close',
            data: {
              token: app.globalData.token,
              orderId: id
            },
            success:(res)=>{
              console.log(223211)
              wx.hideLoading()
              if(res.data.code == 0){
                that.onShow()
              }
            }
          })
        }
      }
    })
  },
  onShow: function () {
    let that = this
    wx.showLoading()
    let postData = {
      token: app.globalData.token
    }
    if (this.data.currentType == 1){
      postData.status = 0
    }
    if (this.data.currentType == 2){
      postData.status = 1
    }
    if(this.data.currentType == 3){
      postData.status = 2
    }
    if (this.data.currentType == 4) {
      postData.status = 4
    }
    this.getOrderStatistics()
    wx.request({
      url: 'https://api.it120.cc/'+app.globalData.urlName +'/order/list',
      data: postData,
      success:(res)=>{
        wx.hideLoading()
        if(res.data.code==0){
          that.setData({
            orderList: res.data.data.orderList,
            goodsMap: res.data.data.goodsMap,
            logisticsMap: res.data.data.logisticsMap
          })
        } else {
          that.setData({
            orderList: null,
            logisticsMap: {},
            goodsMap: {}
          })
        }
      }
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