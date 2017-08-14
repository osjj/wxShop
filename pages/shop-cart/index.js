// pages/shop-cart/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList: {
      saveHidden: true,
      totalPrice: 0,
      allSelect: true,
      noSelect: false,
      list: []
    },
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initEleWidth();
    this.cartShow()
  },
  //获取元素自适应后的实际宽度
  getEleWidth: function (w) {
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750 / 2) / (w / 2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res / scale);
      return real;
    } catch (e) {
      return false;
      // Do something when catch error
    }
  },
  initEleWidth: function () {
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth: delBtnWidth
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  /*onLoad: function (options) {
    this.initEleWidth();
    this.onshow()
  },*/
  cartShow:function() {
    var shoplist = [];
    // 获取购物车数据
    var shopCarInfoMem = wx.getStorageSync('shopCarInfo')
    if (shopCarInfoMem && shopCarInfoMem.shoplist) {
      shoplist = shopCarInfoMem.shoplist
    }
    // this.totalPrice()
    this.data.goodsList.list = shoplist;
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), shoplist);
  },
  getSaveHide: function () {
    var saveHidden = this.data.goodsList.saveHidden;
    return saveHidden;
  },
  allSelect:function() {
    var list = this.data.goodsList.list;
    var allSelect = false
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        allSelect = true
      } else{
        allSelect = false
        break 
      }
    }
    return allSelect
  },
  noSelect: function(){
    var list = this.data.goodsList.list;
    var noSelect = false
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i]
      if (curItem.active) {
        noSelect = false
        break
      } else {
        noSelect = false
      }
    }
    return noSelect
    /*return list.forEach((item) => {
      if (item.active) {
        return false
      } else {
        return true
      }
    })*/
  },
  totalPrice: function () {
    var list = this.data.goodsList.list;
    var total = 0;
    for (var i = 0; i < list.length; i++) {
      var curItem = list[i];
      if (curItem.active) {
        total += parseFloat(curItem.price) * curItem.number;
      }
    }
    return total
  },
  toPayOrder(total) {
    this.setData({
      totalPrice: total
    })
  },
  selectTap(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    if (index!=='' && index!==null){
      list[parseInt(index)].active = !list[parseInt(index)].active
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list)
    }
  },
  bindAllSelect() {
    var list = this.data.goodsList.list;
    var currentAllSelect = this.data.goodsList.allSelect
    if (currentAllSelect) {
      list.forEach((item) => {
        item.active = false
      })
    } else {
      list.forEach((item) => {
        item.active = true
      })
    }
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), !currentAllSelect, this.noSelect(), list);
  },
  saveHidden:function() {
    return this.data.goodsList.saveHidden
  },
  setGoodsList: function (saveHidden, total, allSelect, noSelect, list) {
    this.setData({
      goodsList: {
        saveHidden: saveHidden,
        totalPrice: total,
        allSelect: allSelect,
        noSelect: noSelect,
        list: list
      }
    });
    var shopCarInfo = {};
    var tempNumber = 0;
    shopCarInfo.shoplist = list;
    for (var i = 0; i < list.length; i++) {
      tempNumber = tempNumber + list[i].number
    }
    shopCarInfo.shopNum = tempNumber;
    wx.setStorage({
      key: "shopCarInfo",
      data: shopCarInfo
    })
  },
  jiaBtnTap(e){
    var index = parseInt(e.currentTarget.dataset.index)
    var list = this.data.goodsList.list
    if (index!==null && index !== '')
      if (list[index].number<10) {
      list[index].number++
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },
  jianBtnTap(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var list = this.data.goodsList.list
    if (index !== null && index !== '')
      if (list[index].number > 1) {
        list[index].number--
        this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
      }
  },
  touchS(e) {
    if (e.touches.length == 1){
      this.setData({
        startX: e.touches[0].clientX
      })
    }
  },
  touchM(e) {
    var index = parseInt(e.currentTarget.dataset.index)
    var left = ''
    if(e.touches.length == 1){
      var moveX = e.touches[0].clientX
     var disX = this.data.startX - moveX
     var btnWidth = 120
     if (disX <= 0){
        left = 0
     } else if (disX>0 ){
       left = `-${disX}rpx`
       if (disX>=btnWidth){
         left = `-${btnWidth}rpx`
       }
     }
     var list = this.data.goodsList.list
     if (index !== '' && index!==null){
       list[index].left = left 
       this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
     }
    }
  },
  touchE(e) {
    var left = ''
    var index = parseInt(e.currentTarget.dataset.index)
    if (e.changedTouches.length == 1){
      var endX = e.changedTouches[0].clientX
      var disX = this.data.startX - endX
      var btnWidth = 120
      disX >= btnWidth/2 ? left = `-${btnWidth}rpx` : left = 0
    }
    var list = this.data.goodsList.list
    if (index !== '' && index !== null) {
      list[index].left = left
      this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list);
    }
  },
  delItem(e) {
    var index = e.currentTarget.dataset.index
    var list = this.data.goodsList.list
    list.splice(index,1)
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list); 
  },
  editTap(){
    var list = this.data.goodsList.list
    list.forEach((item)=>{
      item.active = false
    })
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list); 
  },
  saveTap(){
    var list = this.data.goodsList.list
    list.forEach((item) => {
      item.active = true
    })
    this.setGoodsList(!this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), list); 
  },
  deleteSelected(){
    var list = this.data.goodsList.list
    var newList = []
    list.forEach((item) => {
      if (!item.active) {
        newList.push(item)
      }
    })
    this.setGoodsList(this.getSaveHide(), this.totalPrice(), this.allSelect(), this.noSelect(), newList); 
  },
  toPayOrder(){
    let that = this
    wx.showLoading()
    if (this.data.goodsList.noSelect){
      return
    }
    let shopList = []
    let DoneNUmber = 0
    let shopListMap = wx.getStorageSync('shopCarInfo')
    if (shopListMap && shopListMap.shoplist){
      shopList = shopListMap.shoplist
    }
    if (shopList.length==0){
      return
    }
    let isFail = false
    let needDoneNUmber = 0
    for (var i = 0; i < shopList.length;i++){
      console.log(isFail)
      if (isFail){
        wx.hideLoading()
        console.log(333)
        return
      }
      if(!shopList[i].active){
        continue
      }
      if (shopList[i].active) {
        needDoneNUmber++
      }
      // let needDoneNUmber = shopList.length
      let carShopBean = shopList[i]
      if (!carShopBean.propertyChildIds || carShopBean.propertyChildIds == ""){
        wx.request({
          url:  'https://api.it120.cc/'+ app.globalData.urlName+'/shop/goods/detail',
          data:{
            id: carShopBean.goodsId 
          },
          success:function(res){
            DoneNUmber++
            if (res.data.data.basicInfo.stores<carShopBean.number){
              wx.showModal({
                title: '提示',
                content: `${res.data.data.basicInfo.name}商品库存不足`,
                showCancel: false
              })
              isFail = true
              wx.hideLoading()
              return
            }
            if (res.data.data.basicInfo.minPrice != carShopBean.price) {
              wx.showModal({
                title: '提示',
                content: `${res.data.data.basicInfo.name}商品价格有调整，请重新购买`,
                showCancel: false
              })
              isFail = true
              wx.hideLoading()
              return
            }
            if (res.data.data.basicInfo.properties){
              wx.showModal({
                title:'提示',
                content:`${res.data.data.basicInfo.name}商品已失效，请重新购买`,
                showCancel: false
              })
              isFail = true
              wx.hideLoading()
              return
            }
            if (needDoneNUmber == DoneNUmber){
              that.navToPayOrder()
            }
          }
        })
      } else {
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.urlName + '/shop/goods/price',
          data: {
            goodsId: shopList[i].goodsId,
            propertyChildIds: shopList[i].propertyChildIds
          },
          success: function (res) {
            DoneNUmber++
            if (res.data.data.stores < carShopBean.number) {
              isFail = true
              console.log(isFail)
              wx.showModal({
                title: '提示',
                content: `${carShopBean.name}商品库存不足`,
                showCancel: false
              })
              isFail = true
              console.log(888)
              wx.hideLoading()
              return
            }
            if (res.data.data.price != carShopBean.price) {
              wx.showModal({
                title: '提示',
                content: `${carShopBean.name}商品价格有调整，请重新购买`,
                showCancel: false
              })
              isFail = true
              wx.hideLoading()
              return
            }
            if (needDoneNUmber == DoneNUmber) {
              console.log(3121)
              that.navToPayOrder()
            }
          }
        })
      }
      }
  },
  navToPayOrder() {
    wx.hideLoading()
    wx.navigateTo({
      url: "/pages/to-pay-order/index",
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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