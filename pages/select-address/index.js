// pages/select-address/index.js
let app=getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList:[]
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
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initShippingAddress()
  },
  initShippingAddress(){
    let that =this
    wx.request({
      url: 'https://api.it120.cc/'+app.globalData.urlName+'/user/shipping-address/list',
      data:{
        token: app.globalData.token
      },
      success:function(res){
        console.log(res.data)
        if(res.data.code == 0){
        that.setData({
          addressList:res.data.data
        })
        } else{
          that.setData({
            addressList: null
          })
        }
      }
    })
  },
  selectTap(e){
    let id = e.currentTarget.dataset.id
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.urlName +'/user/shipping-address/update',
      data:{
        token: app.globalData.token,
        id: id,
        isDefault:'true'
      },
      success:function(){
        wx.navigateBack({})
      }
    })
  },
  addAddress(){
    wx.navigateTo({
      url: "/pages/address-add/index",
    })
  },
  editAddress(e){
    wx.navigateTo({
      url: "/pages/address-add/index?id="+e.currentTarget.dataset.id,
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