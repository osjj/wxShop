// pages/order-list/index.js
let commonCityData = require('../../utils/city.js')
let app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selProvince: '请选择',
    selCity: '请选择',
    selDistrict: '请选择',
    selProvinceIndex: 0,
    selCityIndex: 0,
    selDistrictIndex: 0
  },
  bindSave: function (e) {
    let that = this
    let linkMan = e.detail.value.linkMan
    let address = e.detail.value.address
    let mobile = e.detail.value.mobile
    let code = e.detail.value.code
    if (linkMan == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人姓名',
        showCancel: false
      })
      return
    }
    if (mobile == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人手机',
        showCancel: false
      })
      return
    }
    if (this.data.selProvince == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请填写地区',
        showCancel: false
      })
      return
    }
    if (this.data.selCity == "请选择") {
      wx.showModal({
        title: '提示',
        content: '请填写地区',
        showCancel: false
      })
      return
    }
    if (address == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人地址',
        showCancel: false
      })
      return
    }
    let cityId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id
    let districtId
    if (this.data.selDistrict == "请选择" || !this.data.selDistrict) {
      console.log(222)
      districtId = ''
    } else {
      districtId = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id
    }
    if (code == "") {
      wx.showModal({
        title: '提示',
        content: '请填写联系人邮政编号',
        showCancel: false
      })
      return
    }
    let apiAddoRuPDATE = "add";
    let apiAddid = this.data.id
    if (apiAddid) {
      apiAddoRuPDATE = "update"
    } else {
      apiAddid = 0
    }
    wx.request({
      url: 'https://api.it120.cc/' + app.globalData.urlName + '/user/shipping-address/' + apiAddoRuPDATE,
      data: {
        token: app.globalData.token,
        id: apiAddid,
        provinceId: commonCityData.cityData[this.data.selProvinceIndex].id,
        cityId: cityId,
        districtId: districtId,
        linkMan: linkMan,
        address: address,
        mobile: mobile,
        code: code,
        isDefault: true
      },
      success: function (res) {
        if (res.data.code != 0) {
          wx.showModal({
            title: '失败',
            content: res.data.msg,
            showCancel: false
          })
          return
        }
        wx.navigateBack({})
      }
    })
  },
  initCityData: function (level, obj) {
    if (level == 1) {
      let pinkArray = []
      for (let i = 0; i < commonCityData.cityData.length; i++) {
        pinkArray.push(commonCityData.cityData[i].name)
      }
      this.setData({
        provinces: pinkArray
      })
    } else if (level == 2) {
      let pinkArray = []
      let dataArray = obj.cityList
      for (let i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name)
      }
      this.setData({
        citys: pinkArray
      })
    } else if (level == 3) {
      let pinkArray = []
      let dataArray = obj.districtList
      for (let i = 0; i < dataArray.length; i++) {
        pinkArray.push(dataArray[i].name)
      }
      this.setData({
        districts: pinkArray
      })
    }
  },
  bindPickerProvinceChange: function (e) {
    let selItem = commonCityData.cityData[e.detail.value]
    this.setData({
      selProvince: selItem.name,
      selProvinceIndex: e.detail.value,
      selCity: '请选择',
      selCityIndex: 0,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    console.log(selItem)
    this.initCityData(2, selItem)
  },
  bindPickerCityChange: function (e) {
    let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[e.detail.value]
    this.setData({
      selCity: selItem.name,
      selCityIndex: e.detail.value,
      selDistrict: '请选择',
      selDistrictIndex: 0
    })
    this.initCityData(3, selItem)
  },
  bindPickerChange: function (e) {
    let selItem = commonCityData.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[e.detail.value]
    if (selItem && selItem.name && e.detail.value) {
      this.setData({
        selDistrict: selItem.name,
        selDistrictIndex: e.detail.value
      })
    }
  },
  deleteAddress(e){
    let that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除该收货地址吗？',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: 'https://api.it120.cc/' + app.globalData.urlName + '/user/shipping-address/delete',
            data:{
              token:app.globalData.token,
              id: id
            },
            success:function(res){
              wx.navigateBack({})
            }
          })
        } else if(res.cancel){
          console.log('用户点击取消')
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (e) {
    this.initCityData(1)
    let that = this
    let id = e.id
    if (id) {
      wx.showLoading()
      wx.request({
        url: 'https://api.it120.cc/' + app.globalData.urlName + '/user/shipping-address/detail',
        data: {
          token: app.globalData.token,
          id: id
        },
        success: function (res) {
          wx.hideLoading()
          console.log(res.data)
          if (res.data.code == 0) {
            that.setData({
              id: id,
              addressData: res.data.data,
              selProvince: res.data.data.provinceStr,
              selCity: res.data.data.cityStr,
              selDistrict: res.data.data.areaStr
            })
            that.setDBSaveAddressId(res.data.data)
            return
          } else {
            wx.showModal({
              title: '提示',
              content: '无法获取快递地址数据',
              showCancel: false
            })
          }
        }
      })
    }
  },
  setDBSaveAddressId(data){
    for (let i = 0; i<commonCityData.cityData.length; i++){
      if (data.provinceId == commonCityData.cityData[i].id){
        this.data.selProvinceIndex = i
        this.setData({
          selProvinceIndex: i
        })
      }
      for (let j = 0; j < commonCityData.cityData[i].cityList.length; j++){
        if (data.cityId == commonCityData.cityData[i].cityList[j].id){
          this.data.selCityIndex = j
          this.setData({
            selCityIndex:j
          })
        }
        for (let k = 0; k < commonCityData.cityData[i].cityList[j].districtList.length; k++){
          if (data.districtId == commonCityData.cityData[i].cityList[j].districtList[k].id)
            this.data.selDistrict = k
            this.setData({
              selDistrictIndex: k
            })
        }
      }
    }
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