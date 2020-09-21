var app = new Vue({
  el: '#app',
  data: {
    loginModel: {
      company: '',
      username: ''
    },
    isLogin: false
  },
  mounted() {
    if(window.localStorage.getItem('company')) {
      this.isLogin = true
    }
  },
  methods: {
    setData(data) {
      return new Promise((reslove, reject) => {
        chrome.storage.local.set({
          company: data.company,
          username: data.username
        }, function() {
          reslove()
        });
      })
    },
    clearLoginInfo() {
      window.localStorage.clear()
      chrome.storage.local.remove('company')
      chrome.storage.local.remove('username')
      this.isLogin = false
    },
    noLoginHandler() {
      window.location.href = '/newTab/list/list.html'
    },
    goToLogin() {
      let loginData = Object.assign({}, this.loginModel)
      request.post('/login', loginData, {}).then(async (res) => {
        const {data} = res
        window.localStorage.setItem('company', data.company)
        window.localStorage.setItem('username', data.username)
        await this.setData(data)
        alert('登录成功')
        window.location.href = '/newTab/list/list.html'
      })
    }
  }
})
