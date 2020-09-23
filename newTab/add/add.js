var app = new Vue({
  el: '#app',
  data() {
    return {
      submitData: {
        website: '',
        name: '',
        account: '',
        password: '',
        isAutoLogin: false,
        creator: window.localStorage.getItem('users') || '',
        company: window.localStorage.getItem('company') || ''
      },
      pwdId: ''
    }
  },
  mounted() {
    console.log(window.location)
    const id = this.getQueryVariable('id')
    if(id) {
      this.submitData.id = id
      this.pwdId = id
      this.getDetail()
    }
  },
  methods: {
    getQueryVariable(variable) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");
      for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){return pair[1];}
      }
      return(false);
    },
    getDetail() {
      let params = {
        id: this.pwdId
      }
      request.post('/account/getListById', params, {}).then((res) => {
        Object.keys(this.submitData).forEach((v, k) => {
          if(v !== 'creator' || v !== 'company') {
            this.submitData[v] = res.data[v]
          }
        })

        if(this.submitData.isAutoLogin) {
          this.submitData.isAutoLogin = true
        }else{
          this.submitData.isAutoLogin = false
        }
      })
    },
    submitAccountMethods() {
      let submitData = Object.assign({}, this.submitData)
      request.post('/account/save', submitData, {}).then((res) => {
        alert(res.msg)
        window.history.go(-1)
      })
    },
  }
})
