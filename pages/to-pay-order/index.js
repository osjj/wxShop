// pages/to-pay-order/index.js
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[],
    isNeedLogistics: 1,
    curAddressData:false,
    yunPrice: 0,
    allGoodsAndYunPrice:0
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.initShippingAddress()
  },
  getDistrictId(obj, id){
    if (!obj){
      return ''
    }
    if(!id){
      return ""
    }
    return id
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this
    wx.getStorage({
      key:'shopCarInfo',
      success: function(res){
        //console.log(res.data)
        let goodsList = res.data.shoplist
        let ActiveGoods = goodsList.filter(function(item){
          return item.active == true
        })
        that.setData({
          goodsList: ActiveGoods
        })
      }
    })
  },
  createOrder(e){
    let that = this
    let loginToken = app.globalData.token
    //console.log(loginToken)
    let remark = e.detail.value.remark
    let pastData = {
      token: loginToken,
      goodsJsonStr: that.data.goodsJsonStr,
      remark: remark
    }
    if (that.data.isNeedLogistics > 0){
      if (!that.data.curAddressData){
        wx.showModal({
          title: '错误',
          content: '请选择您的收货地址',
          showCancel: false
        })
        return
      }
    }
    pastData.provinceId = that.data.curAddressData.provinceId
    pastData.cityId = that.data.curAddressData.cityId
    if (that.data.curAddressData.districtId) {
      pastData.districtId = that.data.curAddressData.districtId;
    }
    pastData.address = that.data.curAddressData.address
    pastData.code = that.data.curAddressData.code
    pastData.linkMan = that.data.curAddressData.linkMan
    pastData.mobile = that.data.curAddressData.mobile
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName +'/order/create',
      method:'post',
      header:{
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: pastData,
      success:function(res){
         //清除购物车
         wx.getStorage({
           key: 'shopCarInfo',
           success: function(res) {
             let newShopCar = {}
             let newList = []
             let list = res.data.shoplist
             let num = 0
            for (let i = 0; i < list.length;i++){
              if (!list[i].active){
                newList.push(list[i])
                num++
              }
            }
            newShopCar.shoplist = newList
            newShopCar.shopNum = num
            wx.setStorage({
              key: 'shopCarInfo',
              data:newShopCar
            })
            // console.log(newShopCar)
           },
         })
         wx.reLaunch({
           url: "/pages/order-list/index"
         })
      }
    })
  },
  initShippingAddress(){
    let that = this
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/user/shipping-address/default',
      data: {
        token: app.globalData.token
      },
      success: function(res){
        if(res.data.code == 0){
          that.setData({
            curAddressData: res.data.data
          })
        } else {
          that.setData({
            curAddressData: null
          })
        }
        that.processYunfei();
      }
    })
  },
  processYunfei(){
    let that = this
    let goodList = this.data.goodsList
    let isNeedLogistics = 0
    let allGoodsPrice =0
    let goodsJsonStr = '['
    for (let i = 0; i < goodList.length;i++) {
      let carShopBean = goodList[i]
      if (carShopBean.logistics){
        isNeedLogistics = 1
      }
      allGoodsPrice += carShopBean.price * carShopBean.number

    let goodsJsonStrTmp = ''
    if(i>0){
      goodsJsonStrTmp =','
    }
    let propertyChildIds = carShopBean.propertyChildIds ? carShopBean.propertyChildIds: ''
    //goodsJsonStrTmp += '{"goodsId":' + carShopBean.goodsId + ',"number":' + carShopBean.number + ',"propertyChildIds":' + propertyChildIds + ',"logisticsType":0}'
    goodsJsonStrTmp += `{"goodsId":${carShopBean.goodsId},"number":${carShopBean.number},"propertyChildIds":"${propertyChildIds}","logisticsType":0}`    
    goodsJsonStr += goodsJsonStrTmp
    if (carShopBean.logistic && !carShopBean.isFree){
        let DistrictId = that.getDistrictId(that.data.curAddressData, that.data.curAddressData.getDistrictId)
        wx.request({
          url: 'https://api.it120.cc/' + app.globalData.urlName + '/shop/goods/price/freight',
          data: {
            templated: carShopBean.logisticsType,
            type: 0,
            provinceId: that.data.curAddressData.provinceId,
            cityId: that.data.curAddressData.cityId,
            districtId: districtId
          },
          success:function(res){
            if(!res.data.code){
              wx.showModal({
                title: '错误',
                content: res.data.msg,
                showCancel:false
              })
              console.log(222)
              console.log(res.data.data)
            }
            let firstNumber = res.data.data.firstNumber
            let addAmount = res.data.data.addAmount
            let firstAmount = res.data.data.firstAmount
            let addNumber = res.data.data.addNumber
            let amountLogistic = firstAmount
            //记件
            if (carShopBean.logistics.feeType == 0) {
              let numberLeft = carShopBean.number - firstNumber
              while (numberLeft>0){
                numberLeft = numberLeft - addNumber
                amountLogistic = amountLogistic + addAmount
              }
              let yunPrice = that.data.yunPrice + amountLogistics
              that.setData({
                yunPrice: parseFloat(yunPrice.toFixed(2)),
                allGoodsAndYunPrice: parseFloat((allGoodsPrice + yunPrice).toFixed(2))
              })
            }
            //计重
            if (carShopBean.logistics.feeType == 1) {
              // 按重量
              let totleWeight = carShopBean.weight * carShopBean.number;
              let amountLogistics = firstAmount;
              let leftWeight = totleWeight - firstNumber;
              while (leftWeight > 0) {
                leftWeight = leftWeight - addNumber;
                amountLogistics = amountLogistics + addAmount;
              }
              let yunPrice = that.data.yunPrice + amountLogistics;
              that.setData({
                yunPrice: parseFloat(yunPrice.toFixed(2)),
                allGoodsAndYunPrice: parseFloat((allGoodsPrice + yunPrice).toFixed(2)),
              })
            }
          }
        })
      }
    }
    goodsJsonStr+=']'
    console.log(2221)
    console.log(allGoodsPrice)
    that.setData({
      isNeedLogistics: isNeedLogistics,
      allGoodsAndYunPrice: allGoodsPrice,
      goodsJsonStr: goodsJsonStr
    })
    //console.log(goodsJsonStr)
  },
  addAddress(){
    wx.navigateTo({
      url: '/pages/address-add/index',
    })
  },
  selectAddress(){
    wx.navigateTo({
      url: '/pages/select-address/index'
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