// pages/index/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    indicatorDors: true,
    autoplay: true,
    interval: 4000,
    duration: 500,
    activeCategoryId: 0
  },
  tabClick: function (e) {

    this.setData({
      activeCategoryId: e.currentTarget.id
    })
    this.getGoodsList(e.currentTarget.id)
    // this.getGoodsList(e.currentTarget.id)
  },
  getGoodsList: function (categoryId) {
    var that = this
    if (categoryId == 0) {
      categoryId = ''
    }
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/shop/goods/list',
      data: {
        categoryId: categoryId
      },
      success: function (res) {
        that.setData({
          goods: res.data.data
        })
      }
    })
  },
  tabDetails(e) {
    wx.navigateTo({
      url: '/pages/goods-details/index?id=' + e.currentTarget.dataset.id
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    wx.setNavigationBarTitle({
      title: wx.getStorageSync('mallName'),
    })
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/banner/list',
      data: {
        key: 'mallName'
      },
      success: function (res) {
        that.setData({
          banners: res.data.data
        })
      }
    }),
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.urlName + '/shop/goods/category/all',
        data: {
          key: 'category'
        },
        success: function (res) {
          var category = [{ id: 0, name: '全部' }]
          res.data.data.forEach(item => {
            category.push(item)
          })
          that.setData({
            categories: category
          })
          that.getGoodsList(0)
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