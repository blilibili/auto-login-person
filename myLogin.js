
// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//     console.log(request, sender, sendResponse)
//     if(request.type === 'REQUEST_USERS_ALL'){
//         loginCommonMethods(request.data)
//
//     }
// });
var globalTypeId
var globalTerName = ''
var currentPage = 1
var pageSize = 5
var clientHeight = 0
var globalData = {
    userid:'',
    myName: '',
    myUrl: '',
    myuserName: '',
    userName: ''
}

function inserYunjiLogo(callback) {
    const keyDom = document.createElement('img')
    keyDom.src = chrome.extension.getURL('img/yunji.png');
    keyDom.style.position = 'fixed'
    keyDom.style.zIndex = 100

    keyDom.width = 30
    keyDom.height = 30

    keyDom.style.top = '15px'
    keyDom.style.left = '50%'
    keyDom.style.cursor = 'pointer'
    keyDom.onclick = callback
    document.body.appendChild(keyDom)
}

function createModal(width=500, height=500, modalClassName) {
    const modalDom = document.createElement('div')
    modalDom.className = modalClassName || 'alert-auto-login-modal'
    $(modalDom).css({width: width, height: height, backgroundColor: 'white', position: 'absolute', top: '50%', left: '50%', zIndex: 10001, marginLeft: -(width/2) + 'px', marginTop: -(height/2) + 'px'})
    document.body.appendChild(modalDom)
    return modalDom
}

function createltModal(modalClassName) {
    const modalDom = document.createElement('div')
    modalDom.className = modalClassName
    document.body.appendChild(modalDom)
    return modalDom
}

// 查找页面中 登录的按钮
function findLoginButton() {
    const eles = document.getElementsByTagName("*")
    // 切割掉前八个头部
    let sliceEles = []
    let simLoginButton = []
    for(let i = 0;i < eles.length;i++){
        if(i > 7){
            sliceEles.push(eles[i])
        }
    }

    for(let i = 0;i < sliceEles.length;i++){
        if(sliceEles[i].innerText === '登录' || sliceEles[i].innerText === '登 录' || sliceEles[i].value === '登录'){
            simLoginButton.push(sliceEles[i])
        }
    }

    console.log('button', simLoginButton)
    return simLoginButton
}

function createBackWall() {
    const modalDom = document.createElement('div')
    modalDom.className = 'auto-login-back-wall'
    document.body.appendChild(modalDom)
    return modalDom
}

function keyUsernameClick() {
    const modalDom = createModal(380, 282)
    currentPage = 1

    let searchObj = {
        // myuserId: globalData.userid,
        currentPage: currentPage,
        pageSize: pageSize,
        selectType: 3,
        searchValue: window.location.origin,
        accounttype: 1
        // webStatus: 1
    }

    let params = {
        company: window.localStorage.getItem('company'),
        website: window.location.href
    }
    request.post('/account/getList', params, {}).then((res) => {
        layui.use(['laytpl'], function() {
            createBackWall()
            var data = { //数据
                list: res.data === null?[]: res.data
            }
            console.log('data', data)

            // $('.share-result-td').append(shareListHtml)
            var laytpl = layui.laytpl;
            var getTpl = noMatchingAccount

            laytpl(getTpl).render(data, function(html){
                $(modalDom).append(html)

                createAddAccountDom()

                $('.no-matching-close-button').on('click', function() {
                    $(modalDom).remove()
                    $('.auto-login-back-wall').remove()
                })

                $('.account-list-use').each((key,val)=>{
                    clientHeight = parseInt(clientHeight, 10) + parseInt($(val)[0].clientHeight, 10)
                    $(val).on('click',function(item){
                        clickPwdListRowEvent.call(this, modalDom, res)
                    })
                })

                $('.auto-login-account-row-content-box').scroll(function(e) {
                    let scrollTop = $(this)[0].scrollTop
                    let maxScroll = $(this)[0].scrollHeight - $(this)[0].offsetHeight;
                    console.log('scrolltop', scrollTop, maxScroll)
                    if(scrollTop >= maxScroll) {
                        currentPage++
                        renderMorePwdList(currentPage, modalDom)
                    }
                })
            });
        })
    })

}

function clickPwdListRowEvent(modalDom, res) {
    let keyId = this.getAttribute('data-typeId')
    console.log("typeId:",keyId)

    let accountObj = res.data.filter((result) => {
        return parseInt(result.id, 10) === parseInt(keyId, 10)
    })[0]

    console.log('account', accountObj)
    // 设置账号密码
    setUserName(accountObj.account)
    setPassword(accountObj.password)

    // 设置记录的数据
    globalData.myName = accountObj.name
    globalData.myUrl = accountObj.url
    globalData.myuserName = accountObj.userAccount
    globalTerName = accountObj.name

    $(findLoginButton()[0]).addClass('active')

    $(modalDom).remove()
    $('.auto-login-back-wall').remove()

    // 是否自动登录
    console.log('是否自动登录', accountObj)
    if(accountObj.isAutoLogin) {
        clickLoginButton()
    }
}

function clickLoginButton() {
    // 点击登录按钮 插入记录
    const loginButton = findLoginButton()
    loginButton[0].click()
}

function renderMorePwdList(nextPage, modalDom) {
    let searchObj = {
        // myuserId: globalData.userid,
        currentPage: nextPage,
        pageSize: pageSize,
        selectType: 3,
        searchValue: window.location.origin,
        accounttype: 1
        // webStatus: 1
    }
    myTabAjax('/miyun/sys/UserPwdController/getAccountPwdList', 'get', searchObj, globalData.userid).then((res) => {
        console.log('下一页数据', res)
        layui.use(['laytpl'], function() {
            var data = { //数据
                list: res.data === null?[]: res.data.records
            }

            // $('.share-result-td').append(shareListHtml)
            var laytpl = layui.laytpl;
            var getTpl = renderPwdList

            laytpl(getTpl).render(data, function(html){
                console.log('模板输出', html)
                $('.auto-login-account-row-content-box').append(html)
                $('.account-list-use').each((key,val)=>{
                    $(val).on('click',function(item){
                        clickPwdListRowEvent.call(this, modalDom, res)
                    })
                })
            })
        })
    })
}

let pwdLength = 20
let settingType = [1,1,1,1] //字符,大写,小写,数字
// 获取当前操作系统信息
function getCurrentSoftVersion() {
    const appVersion = window.navigator.userAgent
    const softInfo = appVersion.slice(appVersion.indexOf('(')+1, appVersion.indexOf(')'))
    return softInfo
}
// 添加新账号
function createAddAccountDom() {
    $('.no-matching-add-new-account').on('click', function() {
        $('.auto-login-start-click-account').remove()
        const renderAccountNewModalDom = createModal(480, 435, 'add-new-account-modal')
        //账号：必填项可编辑，获取页面中的type=text类型第一个输入框的值，如果为空，获取第二个输入框的值，依次类推；如果全为空，则该输入框为空，heaveil
        let textList = $("input[type='text']")
        let account = ''
        for (let i = 0; i < textList.length; i++) {
            if(textList[i].value){
                account = textList[i].value
            }
        }

        layui.use(['form', 'slider', 'laytpl'], function(){
            // 渲染新增新账号
            var data = { //数据
                list: []
            }

            // $('.share-result-td').append(shareListHtml)
            var laytpl = layui.laytpl;
            var getTpl = addNewAccountConfig

            laytpl(getTpl).render(data, function(html){
                $(renderAccountNewModalDom).append(html)
            });

            var form = layui.form;

            //重新渲染
            form.render();

            form.on('checkbox(chrtype)', function(data){
                settingType[data.value] = data.elem.checked?1:0
                setTimeout(()=>{
                    $("#accountPwd").val(autoCreatePwd())
                },500)
            });

            var slider = layui.slider
            let sliderTimer = false
            //渲染
            slider.render({
                elem: '#slide-pass-set',  //绑定元素
                max:30, //长度范围0-30
                value:20, //默认长度20位
                theme:'#90D5FE',
                change: function(value){
                    $("#slidePassSetVal").html(value) //动态获取滑块数值

                    sliderTimer = true
                    pwdLength = parseInt(value)
                    setTimeout(()=>{
                        if(sliderTimer)$("#accountPwd").val(autoCreatePwd())
                        sliderTimer = false
                    },500)

                }
            });

            //先把元素append进去以后才能操作dom
            $("#account").val(account)
            if(!account){
                $(".auto-login-pass-set-use").removeClass('layui-btn-normal').addClass('layui-btn-disabled')
            }else{
                $(".auto-login-pass-set-use").removeClass('layui-btn-disabled').addClass('layui-btn-normal')
            }

            $("#account").on('input',function(){
                account = $(this).val()
                if(!account){
                    $(".auto-login-pass-set-use").removeClass('layui-btn-normal').addClass('layui-btn-disabled')
                }else{
                    $(".auto-login-pass-set-use").removeClass('layui-btn-disabled').addClass('layui-btn-normal')
                }
            })

            $("#accountPwd").on('click',function(){
                console.log("重新生成密码")
                $("#accountPwd").val(autoCreatePwd())
            })

            $("#copybtn").on('click',function(){
                console.log("点击复制")
                var aux = document.createElement("input");
                aux.setAttribute("value", $("#accountPwd").val());
                document.body.appendChild(aux);
                aux.select();
                document.execCommand("copy");
                document.body.removeChild(aux);

                alert('复制成功')
            });
        });


        $('.close-set-pass-config').on('click', function() {
            closeModal()
        })

        $('.auto-login-pass-set-cancel').on('click', function() {
            closeModal()
        })

        $('.auto-login-pass-set-use').on('click', function() {
            if(!account)return
            console.log('提交')
            // 设置账号密码
            setUserName(account)
            const pwd = $("#accountPwd").val()
            setPassword(pwd,false)
            $(findLoginButton()[0]).addClass('active')
            closeModal()
            //查询是否已经设置了明天再提示
            let val = {
                userId:globalData.userid
            }
            console.log("req:",val)
            myTabAjax('/miyun/sys/UserRecodsController/getUserUseRecods', 'get', val, globalData.userid).then((res) => {
                console.log("resp:",res)
                if(res.code === 42003) {
                    //需要提示
                    //查询密码是否一致
                    const url = window.location.href
                    let param = {
                        accountType:1,
                        userAccount:account,
                        url,
                    }
                    console.log("param===>",param)
                    myTabAjax('/miyun/sys/UserPwdController/getPassWordByUser', 'get',param, globalData.userid).then((res) => {
                        if(res.code === 10000){
                            //相同，判断密码是否相同，相同的话不做任何操作
                            const encodePwd = do_encrypt(pwd)
                            console.log("加密后密文:",encodePwd)
                            if(res.data.userPassword !== encodePwd){
                                console.log("两个密码不一致，提示更新")
                                //提示更新
                                layui.use(['laytpl'], function(){
                                    const renderAccountNewModalDom = createltModal('the-same-account-modal')
                                    // 渲染新增新账号
                                    var data = { //数据
                                        list: []
                                    }

                                    var laytpl = layui.laytpl;
                                    var getTpl = theSameAccount

                                    laytpl(getTpl).render(data, function(html){
                                        $(renderAccountNewModalDom).append(html)
                                    });

                                    $(".the-same-account-close").on('click',function(){
                                        closeModal()
                                    })

                                    $(".the-same-account-btn1").on('click',function(){
                                        let val = {
                                            accountType:1,
                                            typeId:res.data.id,
                                            userAccount:account,
                                            userPassword:encodePwd,
                                        }
                                        console.log("req:",val)
                                        myTabAjax('/miyun/sys/UserPwdController/updateMyUserPwd', 'post', val, globalData.userid).then((res) => {
                                            if(res.code === 10000) {
                                                $(".the-same-account").hide()
                                                $(".the-same-account-succ").show()
                                                setTimeout(() => {
                                                    closeModal()
                                                }, 3000)
                                            }else{
                                                alert("更新失败！")
                                            }
                                        })
                                    })
                                })
                            }
                        }
                        if(res.code===80003){
                            //都不相同
                            layui.use(['laytpl'], function(){
                                const renderAccountNewModalDom = createltModal('no-same-account-modal')
                                // 渲染新增新账号
                                var data = { //数据
                                    list: []
                                }

                                var laytpl = layui.laytpl;
                                var getTpl = noSameAccount

                                laytpl(getTpl).render(data, function(html){
                                    $(renderAccountNewModalDom).append(html)
                                });

                                $("#no-same-account-account").val(account)
                                $("#no-same-account-pwd").val(pwd)

                                $(".no-same-account-close").on('click',function(){
                                    closeModal()
                                })

                                $(".no-same-account-btn1").on('click',function(){
                                    //确认则保存成功，3秒后弹窗消失
                                    let val = {
                                        accountType:1,
                                        isAgainCheck:2,
                                        typeData : [{
                                            name: url,
                                            url
                                        }],
                                        userAccount:account,
                                        userPassword:do_encrypt(pwd),
                                    }
                                    console.log("req:",val)
                                    myTabAjax('/miyun/sys/UserPwdController/saveMyUserPwd', 'post', val, globalData.userid).then((res) => {
                                        if(res.code === 10000) {
                                            $(".no-same-account").hide()
                                            $(".no-same-account-succ").show()
                                            setTimeout(() => {
                                                closeModal()
                                            }, 3000)
                                        }else{
                                            alert("保存失败！")
                                        }
                                    })
                                })

                                $(".no-same-account-btn2").on('click',function(){
                                    //明天再提示
                                    let val = {
                                        userId:globalData.userid
                                    }
                                    console.log("req:",val)
                                    myTabAjax('/miyun/sys/UserRecodsController/saveMyUserUseRecods', 'get', val, globalData.userid).then((res) => {
                                        if(res.code === 10000) {
                                            closeModal()
                                        }else{
                                            alert("设置失败！")
                                        }
                                    })
                                })

                            });

                        }
                    })
                }
            })
        })

        $("#accountPwd").val(autoCreatePwd())

    })
}

function closeModal() {
    $('.add-new-account-modal').remove()
    $('.alert-auto-login-modal').remove()
    $('.auto-login-back-wall').remove()
    $('.no-same-account-modal').remove()
    $('.the-same-account-modal').remove()
}

//设置密码等级
function pwdSafe(pwd) {
    //判断密码等级
    let settingTypeL = 0
    settingType.forEach(item=>{
        settingTypeL += item
    })
    let safeList = ['低','中','高']
    let index = 3
    if(settingTypeL === 1 || pwd.length <= 10)index = 1
    else if((settingTypeL === 2 && pwd.length > 10) || (settingTypeL === 3 && (pwd.length > 10 && pwd.length < 20)))index = 2
    else if((settingTypeL === 3 && pwd.length >= 20) || (settingTypeL === 4 && pwd.length > 10))index = 3
    $('.auto-login-safe-col').each((ids,val)=>{
        if($(val).attr('id') <= index){
            $(val).addClass("auto-login-safe-col-checked")
        }else{
            $(val).removeClass("auto-login-safe-col-checked")
        }
    })
    $('#auto-login-safe-txt').html(safeList[index-1])
}

//自动生成复杂密码
function autoCreatePwd(){
    // let pwdLength = 20
    if(pwdLength < 1){
        return '';//密码长度不能为0
    }
    // let settingType = [1,1,1,1] //大写,小写,数字,字符
    let settingTypeL = 0
    settingType.forEach(item=>{
        settingTypeL += item
    })
    if(settingTypeL < 1){
        return '';//字符设置不能为空
    }

    let safeStatic = 1 //1,2,3 低,中,高
    let retPwd = ''

    let pwdLib = [
        settingType[0] && '~!@#¥%^&*()_-+=|{}:"<>?/\\'.split(""),
        settingType[1] && Array.from(Array(26),(v,k)=>{
            return String.fromCharCode(k+65)
        }),
        settingType[2] && Array.from(Array(26),(v,k)=>{
            return String.fromCharCode(k+97)
        }),
        settingType[3] && Array.from(Array(10),(v,k)=>{
            return k
        }),
    ]

    let count = parseInt(pwdLength/settingTypeL)
    //先判断是否可以均分
    if(pwdLength%settingTypeL === 0){
        let list = (settingType[0] ? getRandomArrayElements(pwdLib[0],count) : '') + (settingType[1] ? getRandomArrayElements(pwdLib[1],count) : '') + (settingType[2] ? getRandomArrayElements(pwdLib[2],count) : '') + (settingType[3] ? getRandomArrayElements(pwdLib[3],count) : '')
        retPwd = upsetArr(Array.from(list)).join('')
    }else {
        //不可以均分，每多一个，排序在前的数列多一位
        let remainder = pwdLength%settingTypeL
        let list = (settingType[0] ? getRandomArrayElements(pwdLib[0],count+(--remainder>=0?1:0)) : '') + (settingType[1] ? getRandomArrayElements(pwdLib[1],count+(--remainder>=0?1:0)) : '') + (settingType[2] ? getRandomArrayElements(pwdLib[2],count+(--remainder>=0?1:0)) : '') + (settingType[3] ? getRandomArrayElements(pwdLib[3],count) : '')
        retPwd = upsetArr(Array.from(list)).join('')
    }
    setTimeout(()=>{
        pwdSafe(retPwd)
    },200)
    return retPwd
}

//获取指定区间范围随机数，包括lowerValue和upperValue
function randomFrom(lowerValue,upperValue)
{
    return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
}

function getRandomArrayElements(arr, count) {
    let i = arr.length-1
    let temp = []
    while (count-- > 0) {
        let index = randomFrom(0,i);
        temp.push(arr[index]);
    }
    return temp.join('');
}

function upsetArr(arr){
    return arr.sort(function(){return Math.random()-0.5})
}

function upsetArr(arr){
    return arr.sort(function(){return Math.random()-0.5})
}

function setUserName(username='') {
    var usernameDom = setUserAccountArr[0]
    var evt = new InputEvent('input', {
        inputType: 'insertText',
        data: username,
        dataTransfer: null,
        isComposing: false
    });
    usernameDom.value = username
    usernameDom.dispatchEvent(evt);
}

function setPassword(password='',flag = true) {
    var usernameDom = setUserPassArr[0]
    var evt = new InputEvent('input', {
        inputType: 'insertText',
        // data: flag ? do_decrypt(password) : password, //有解密跟不需要解密之分
        data: password,
        dataTransfer: null,
        isComposing: false
    });
    // usernameDom.value = flag ? do_decrypt(password) : password
    usernameDom.value = password
    usernameDom.dispatchEvent(evt);
}

const setUserAccountArr = []
const setUserPassArr = []
function loginCommonMethods() {
    const pathname = window.location.pathname
    chrome.storage.local.get(['company', 'username'],function(result) {
        console.log("登录信息:",result)
        window.localStorage.setItem('company', result.company)
        window.localStorage.setItem('username', result.username)
    });

    let inputArr = $('input')

    // iframe 有跨域问题
    console.log($('iframe'))
    $('iframe').each((index, item) => {
        console.log(item, index)
        let obj = item.contentWindow
        console.log('找到元素', obj.document.getElementsByTagName('input'))
    })

    console.log('找到的input', inputArr)

    // 查找输入框中第一个是text和password
    for(let i = 0;i < inputArr.length;i++) {
        let attributes = inputArr[i].attributes
        for(let j = 0;j < attributes.length;j++) {
            if(attributes[j].name === 'type') {
                if(attributes[j].value === 'text') {
                    setUserAccountArr.push(inputArr[i])
                }
                if(attributes[j].value === 'password') {
                    setUserPassArr.push(inputArr[i])
                }
            }
        }
    }

    inserYunjiLogo(keyUsernameClick)
}

function getToken(data) {
    return new Promise((resolve) => {
        myTabAjax('/miyun/sys/UserLoginController/getMyuserToken', 'get', data).then((res) => {
            resolve(res.data.token)
        })
    })
}

// 递归判断是否加载完成
testIsComplete()
function testIsComplete() {
    console.log('开始执行')
    if(window.document.readyState === 'complete'){
        loginCommonMethods()
    }else{
        setTimeout(() => {
            testIsComplete()
        }, 200)
    }
}
