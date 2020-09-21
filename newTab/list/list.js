var app = new Vue({
  el: '#app',
  data() {
    return {
      passList: []
    }
  },
  mounted() {
    this.getPassList()
  },
  methods: {
    goToEdit(row) {
      window.location.href = '/newTab/add/add.html?id=' + row.id
    },
    goToAddNew() {
      window.location.href = '/newTab/add/add.html'
    },
    getPassList() {
      let params = {
        company: window.localStorage.getItem('company')
      }
      request.post('/account/getList', params, {}).then((res) => {
        console.log('查询', res.data)
        this.passList = res.data
        console.log(this.passList)
      })
    },
    delPwd(row) {
      let params = {
        id: row.id
      }
      request.post('/account/delPwd', params, {}).then((res) => {
        alert(res.msg)
        this.getPassList()
      })
    }
  }
})
