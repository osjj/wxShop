// pages/goods-details/index.js
var app = getApp()
var WxParse = require('../../wxParse/wxParse.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideShopPopup: true, //规格弹出框
    indicatorDors: true,
    autoplay: true,
    interval: 4000,
    duration: 500,
    goodsDetail:{}, //商品详情对象
    buyNumMax:0, //最大购买数量
    buyNumMin: 0, //最小购买数量
    buyNumber: 0, //单个购买数量
    shopNum: 0, //全部购买数量
    propertyChildIds: '',//规格属性id
    propertyChildNames: '',//规格属性名
    selectSizePrice: 0,//单曲选择商品价格
    selectSize: '选择: ',//选择规格
    hasMoreSelect: false,//是否有多种规格可选
    shopCarInfo: {},//设置在缓存的购物车信息
    canSubmit: false//是否能添加到购物车
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    //加载缓存，取得购物车信息
    wx.getStorage({
      key: 'shopCarInfo',
      success:function(res){
        // console.log(`initshopCarInfo:${res.data}`)
        that.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        })
      }
    })
    //请求该商品详细数据
    wx.request({
      url: 'https://api.it120.cc/'+ app.globalData.urlName+'/shop/goods/detail',
      data: {
        id: options.id
      },
      success:function(res){
        // console.log(res.data.data)
        let selectSizeTemp = ''
        let dataProprties = res.data.data.properties
        //如果有规格选项则设置
        if (dataProprties) {
          dataProprties.forEach((item)=>{
            selectSizeTemp = selectSizeTemp +' '+item.name
          })
          that.setData({
            hasMoreSelect: true,
            selectSize: that.data.selectSize + selectSizeTemp,
            selectSizePrice: res.data.data.basicInfo.minProce
          })
        }
        that.setData({
          goodsDetail: res.data.data,
          selectSizePrice: res.data.data.basicInfo.minPrice,
          buyNumMax: res.data.data.basicInfo.stores,
          buyNumber: (res.data.data.basicInfo.stores > 0) ? 1 : 0
        })
        WxParse.wxParse('article', 'html', res.data.data.content, that, 5)
      }
    })
  },

  addShopCar: function() {
    if (this.data.goodsDetail.properties && !this.data.canSubmit){
      this.bindGuiGeTap()
      return
    }
    let shopCarMap = {}
    shopCarMap.goodsId = this.data.goodsDetail.basicInfo.id
    shopCarMap.pic = this.data.goodsDetail.basicInfo.pic
    shopCarMap.name = this.data.goodsDetail.basicInfo.name
    shopCarMap.label = this.data.propertyChildNames
    shopCarMap.propertyChildIds = this.data.propertyChildIds
    shopCarMap.price = this.data.selectSizePrice
    shopCarMap.left = ''
    shopCarMap.active = true
    shopCarMap.number = this.data.buyNumber
    shopCarMap.logisticsType = this.data.goodsDetail.basicInfo.logisticsId
    shopCarMap.logistics = this.data.goodsDetail.logistics

    var shopCarInfo = this.data.shopCarInfo
    if (!shopCarInfo.shopNum){
      shopCarInfo.shopNum = 0
    }
    if(!shopCarInfo.shoplist){
      shopCarInfo.shoplist= []
    }
    var hasSameGoodsIndex = -1
    for (var i = 0; i < shopCarInfo.shoplist.length;i++){
      var tamShopCarMap = shopCarInfo.shoplist[i]
      if (tamShopCarMap.goodsId === shopCarMap.goodsId && shopCarMap.propertyChildIds == tamShopCarMap.propertyChildIds){
        shopCarMap.number = shopCarMap.number + tamShopCarMap.number
        hasSameGoodsIndex = i
        break
      }
    }
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shoplist.splice(hasSameGoodsIndex, 1, shopCarMap)
    } else{
      shopCarInfo.shoplist.push(shopCarMap)
    }
    this.setData({
      shopCarInfo: shopCarInfo,
      shopNum: shopCarInfo.shopNum
    })
    this.closePopupTap()
    wx.showToast({
      title: '加入购物车成功',
      icon: 'sucess',
      duration: 2000
    })
    wx.setStorage({
      key: 'shopCarInfo',
      data: shopCarInfo
    })
  },
  bindGuiGeTap(){
    this.setData({
      hideShopPopup: false
    })
  },
  closePopupTap(){
    this.setData({
      hideShopPopup: true
    })
  },
  numJiaTap(){
    let buyNumber = this.data.buyNumber
    if (buyNumber < this.data.buyNumMax){
       buyNumber++
    }
    console.log(buyNumber)
    this.setData({
      buyNumber: buyNumber
    })
  },
  numJianTap() {
    let buyNumber = this.data.buyNumber
    if (buyNumber > this.data.buyNumMin) {
      buyNumber--
    }
    this.setData({
      buyNumber: buyNumber
    })
  },
  //选择框
  labelItemTap(e){
    let that = this
    let propertiesArr = this.data.goodsDetail.properties
    let curProperties = propertiesArr[e.currentTarget.dataset.propertyindex]
    let curProperties_childs = curProperties.childsCurGoods
    for (let i = 0; i < curProperties_childs.length;i++){
      curProperties_childs[i].active = false
    }
    curProperties_childs[e.currentTarget.dataset.propertychildindex].active = true
    let needSelectNum = propertiesArr.length
    let curSelectNum = 0
    let propertyChildIds = ''
    let propertyChildNames =''
    let canSubmit = false
    for (let i = 0; i < propertiesArr.length;i++){
      curSelectNum++
      let properties_childs = propertiesArr[i].childsCurGoods
      for (let j = 0; j < properties_childs.length; j++){
        if (properties_childs[j].active){
          propertyChildIds += propertiesArr[i].id + ':' + properties_childs[j].id+','
          // propertyChildIds += propertiesArr[i].id + ':' + properties_childs[j].id + ','
          propertyChildNames += propertiesArr[i].name + ':' + properties_childs[j].name + ' '
        }
      }
    }
    if (needSelectNum == curSelectNum){
      canSubmit = true
    }
    console.log(propertyChildIds)
    console.log(this.data.goodsDetail.basicInfo.id)
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/shop/goods/price',
      data: {
        goodsId: that.data.goodsDetail.basicInfo.id,
        propertyChildIds: propertyChildIds
      },
      success:function(res){
        if(res.data.code == 405){
            return
        }
        that.setData({
          selectSizePrice: res.data.data.price,
          buyNumMax: res.data.data.stores,
          propertyChildIds: propertyChildIds,
          propertyChildNames: propertyChildNames,
          buyNumber: res.data.data.stores >0 ? 1 : 0
        })
      }
    })
    this.setData({
      goodsDetail: this.data.goodsDetail,
      canSubmit: canSubmit
    })
  },
  goShopCar() {
    wx.reLaunch({
      url: '../shop-cart/index'
    })
  },
  tobuy(){
    if (this.data.goodsDetail.properties && !this.data.canSumbit){
      this.bindGuiGeTap()
      return
    }
    if (this.data.buyNumber<1){
      wx.showModal({
        title: '提示',
        concent:'暂时缺货哦~',
        showCancel:fasle
      })
      return
    }
    this.addShopCar()
    this.goShopCar()
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