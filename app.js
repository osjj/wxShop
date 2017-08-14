//app.js
App({
  onLaunch: function() {
    var that = this
    wx.request({
      url: 'https://api.it120.cc/' + that.globalData.urlName+'/config/get-value',
      data: {
        key: that.globalData.urlName
      },
      success: (res) => {
        wx.setStorageSync('mallName', res.data.data.value)
      }
    })
    this.login()
  },
  login: function() {
    var that = this
    var token = that.globalData.token
    if(token){
      wx.request({
        url: 'https://api.it120.cc/' + that.globalData.urlName+'/user/check-token',
        data: {
          token: token
        },
        success: (res) => {
          if(res.data.code !=0){
            that.globalData.token = null
            that.login()
          }
        }
      })
      return
    }
    wx.login({
      success: function(res) {
        if (res.code){
        wx.request({
          url: 'https://api.it120.cc/'+that.globalData.urlName+'/user/wxapp/login',
          data: {
            code: res.code
          },
          success:function(res) {
            // console.log(res)
            if(res.data.code==10000){
              // 去注册
             that.registerUser()
              return
            }
            if (res.data.code !=0){
              // 登录错误
              wx.hideLoading()
              wx.showModal({
                title: '提示',
                content: '无法登陆，请重试',
                showCancel: false
              })
              return
            }
            that.globalData.token = res.data.data.token
            console.log(that.globalData.token)
          }
        })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  registerUser: function() {
    var that = this
    wx.login({
      success: function(res){
       var code = res.code
       wx.getUserInfo({
         success: function(res){
           var iv = res.iv
           var encryptedData = res.encryptedData
           // 下面开始调用注册接口
           wx.request({
             url: 'https://api.it120.cc/'+that.globalData.urlName+'/user/wxapp/register/complex',
             data: {
               code: code,
               encryptedData: encryptedData,
               iv: iv
             },
             success: function(res) {
               // that.globalData.token = res.data.data.token
               wx.hideLoading()
               that.login()
             }
           })
         }
       })
      }
    })
  },
  globalData: {
    userInfo: null,
    urlName: 'shopmall'
  }
})
