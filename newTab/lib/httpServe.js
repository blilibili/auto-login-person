const http = axios.create({
  baseURL: 'http://122.51.89.68:3000',
  // baseURL: 'http://localhost:3000',
  headers: {}
})

var request = {
  post: function (url,data , config) {
    return new Promise((reslove, reject) => {
      http.post(url,data , config).then((result) => {
        if(result.data.code === 0) {
          reslove(result.data)
        }else {
          alert(result.data.msg)
        }
      })
    })
  },
  get: function (url, data, config) {
    return new Promise((reslove, reject) => {
      http.get(url, {params: data}, config).then((result) => {
        reslove(result)
      })
    })
  }
}
