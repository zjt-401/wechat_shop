const app = getApp();
Component({
  properties: {


    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: Object,
      value: 'default value',
    },
    locationList2: {
      type: Object,
    },
    showBtn:{
      type: String,
    },
    showTitle: {
      type: String,
    },
    userAddressCustomFormCommitId:{
      type: String,
    }
  },
  data: {
    formData:null,
    sexArray:['男','女'],
    selectPicker:{},
    upLoadImageList:{},
    dataAndTime:{},
    showformSubmitBtn:false,
    processType: false,
    refProductFormType: false,
    productId:0,
    skuData: {
      productId: 0,
      itemCount: 1,
      shopId: 0,
      cartesianId: 0,
      fromSource: 'mini',
      orderType: 0,
      pintuanCreateType: 0,
      pintuanRecordId: 0
    },
    gainActionEvent: {},
    region: {},
    checkboxList: {},
    formId:0,
    reqLocation:false,
    locationList:{},
    inputValue:{},
    locationIndex:"",
    multistageData:{},//级联数据
    multiIndex:{},//选择级联位置
    currentMultiData:{},
    haveFormData:null,
    showCheckBoxState:[],
  },
  ready: function () {
    let that = this;
    that.setData({ setting: app.setting,loginUser: app.loginUser  })
    console.log(that.data.data)
    console.log("====userAddressCustomFormCommitId===", that.data.userAddressCustomFormCommitId)
    console.log("====showBtn===", that.data.showBtn)
    console.log("==locationList==", that.data.locationList)
    console.log("===selectAddress=====", that.data.selectAddress)
    let options = that.data.data
    that.data.gainActionEvent = options.actionEvent
    that.setData({ formId: options.customFormId })
    if (that.data.showBtn=='ture'){
      that.setData({ showformSubmitBtn:true})
    } else {
      that.setData({ showformSubmitBtn: false })
    }
    if (options && options.actionEvent) {
      that.data.processType = true;
    } else {
      that.data.processType = false;
    }
    if (options && options.productId) {
      that.data.refProductFormType = true;
      that.data.productId = options.productId
      if (options.params) {
        that.data.skuData = JSON.parse(options.params)
      } else {
        that.data.skuData = that.skuData;
      }
    } else {
      that.data.refProductFormType = false;
    }
    let formDetailData = app.AddClientUrl("/wx_get_custom_form.html", { customFormId: options.customFormId }, 'get')
    console.log('==formDetailData===', formDetailData)
    wx.request({
      url: formDetailData.url,
      data: formDetailData.params,
      header: app.headerPost,
      method: 'get',
      success: function (res) {
        console.log(res)
        if (that.data.userAddressCustomFormCommitId){
          that.getDetail(that.data.userAddressCustomFormCommitId, res.data.relateObj)
        }else{
          that.setFormDataFun(res.data.relateObj)
        }
        if (that.data.showTitle!='false'){
          wx.setNavigationBarTitle({
            title: res.data.relateObj.formName
          })
        }
      }
    })
  },
  methods: {
    toImgUrl: function (event) {
      console.log(event.currentTarget.dataset.link)
      console.log("===========e==========", event.currentTarget.dataset.url)
      app.linkEvent(event.currentTarget.dataset.link);
    },
    saveImageToLocal: function (e) {
      let imgSrc = e.currentTarget.dataset.imageurl
      console.log(imgSrc)
      let PostImageSrc = imgSrc.replace(/http/, "https")
      // let PostImageSrc = imgSrc
      console.log(PostImageSrc)
      if (!imgSrc) {
        return
      }
      let urls = []
      urls.push(imgSrc)
      wx.previewImage({
        current: imgSrc, // 当前显示图片的http链接
        urls: urls // 需要预览的图片http链接列表
      })
    },
    getDetail: function (formCommitId, data) {
      let that = this;
      wx.showToast({
        title: '加载中...',
        icon: 'loading',
      })
      let formDetailData = app.AddClientUrl("/wx_get_custom_form_commit.html", { formCommitId: formCommitId }, 'get')
      wx.request({
        url: formDetailData.url,
        data: formDetailData.params,
        header: app.headerPost,
        method: 'get',
        success: function (res) {
          console.log("====success====", res)
          if (res.data.errcode == 0) {
            wx.hideLoading()
            // that.setData({ haveFormData: res.data.relateObj.commitJson, loading: false })
            that.setFormDataFun(data, JSON.parse(res.data.relateObj.commitJson))
          } else {
            wx.showToast({
              title: '加载失败...',
              icon: 'none',
              duration: 2000,
            })
            wx.navigateBack(
              { delta: 1, }
            )
          }
        }
      })
    },
    setFormDataFun: function (formData,jsonData){
      let that=this;
      console.log("===jsonData===", jsonData)
      console.log("===formData===", formData)
      if (formData.items.length > 0) {
        let upLoadImageList = {};
        let region = {};
        let dataAndTime = {};
        let selectPicker = {};
        for (let i = 0; i < formData.items.length; i++) {
          if (formData.items[i].listValues && (formData.items[i].type == 2 || formData.items[i].type == 4)) {
            formData.items[i].listValues = formData.items[i].listValues.split(",")
            let name = "picker_";
            if (formData.items[i].type == 4){
              name ='checkbox_'
            }
            if (jsonData&&jsonData[formData.items[i].name]){
              selectPicker[name + i] = jsonData[formData.items[i].name].value
            }else{
              if (formData.items[i].defaultValue) {
                console.log("下拉框有值")
                selectPicker[name + i] = formData.items[i].defaultValue
              } else {
                console.log("下拉框没值")
                selectPicker[name + i] = ""
              }
            }
            that.setData({
              selectPicker: selectPicker
            })
            if (formData.items[i].type == 4){
              let checkboxList=selectPicker['checkbox_' + i];
              let listValues =formData.items[i].listValues;
              let showCheckBoxState=[]
              for (let j = 0; j < listValues.length; j++) {
                console.log("====listValues=====", listValues[j])
                let count = 0;
                for (let k = 0; k < checkboxList.length; k++) {
                  console.log("====checkbox=====", checkboxList[k])
                  if (listValues[j] != checkboxList[k]) {
                    console.log("======", listValues[j], checkboxList[k])
                    count++
                  } else {
                    console.log("!======", listValues[j], checkboxList[k])
                  }
                }
                if (count != checkboxList.length) {
                  console.log("===count===", count)
                  showCheckBoxState.splice(j, 1, true)
                } else {
                  console.log("!count======", count)
                  showCheckBoxState.splice(j, 1, false)
                }
              }
              that.setData({ showCheckBoxState: showCheckBoxState})
            }
            console.log("=======selectPicker======", selectPicker)
          } else if (formData.items[i].listValues && formData.items[i].type == 13) {
            formData.items[i].listValues = JSON.parse(formData.items[i].listValues)
            that.setData({ currentMultiData: formData.items })
            that.setMultiPicker(formData.items[i], 0, 0, 0);
          } else if (formData.items[i].type == 9999) {
            formData.items[i].splitStyle = JSON.parse(formData.items[i].splitStyle);
          } else if (formData.items[i].type == 7 || formData.items[i].type == 11) {
            upLoadImageList['img_' + i] = [];
            if (jsonData && jsonData[formData.items[i].name]) {
              let defaultValue = jsonData[formData.items[i].name].value
              if(defaultValue){
                if (typeof (defaultValue) == 'object') {
                  upLoadImageList['img_' + i] = defaultValue
                } else {
                  upLoadImageList['img_' + i].push(defaultValue)
                }
              }
            } else {
              if (formData.items[i].defaultValue) {
                let defaultValue;
                try {
                  defaultValue = JSON.parse(formData.items[i].defaultValue);
                } catch (e) {
                  defaultValue = formData.items[i].defaultValue
                  console.log(e);
                }
                if (typeof (defaultValue) == 'object') {
                  upLoadImageList['img_' + i] = defaultValue
                } else {
                  upLoadImageList['img_' + i].push(defaultValue)
                }
              }
            }
            that.setData({
              upLoadImageList: upLoadImageList
            })
          } else if (formData.items[i].type == 10) {
            if (formData.items[i].defaultValue) {
              console.log("地址有值")
              let defaultRegion;
              try {
                defaultRegion = JSON.parse(formData.items[i].defaultValue).join(",")
              } catch (e) {
                defaultRegion = formData.items[i].defaultValue
                console.log(e);
              }
              region['address_' + i] = defaultRegion
            } else {
              console.log("地址没值")
              region['address_' + i] = "请选择您的地址"
            }
            that.setData({
              region: region
            })
          } else if (formData.items[i].type == 5 || formData.items[i].type == 6) {
            if (formData.items[i].defaultValue) {
              console.log("日期时间有值")
              dataAndTime[formData.items[i].name] = formData.items[i].defaultValue
            } else {
              console.log("日期时间没值")
              dataAndTime[formData.items[i].name] = ""
            }
            that.setData({
              dataAndTime: dataAndTime
            })
          } else {
            if (jsonData && jsonData[formData.items[i].name]){
              formData.items[i].defaultValue = jsonData[formData.items[i].name].value
            }
          }
        }
        that.setData({ formData: formData })
        console.log(that.data.formData)
      }
    },
    saveSearchValue: function (e) {
      console.log("====saveSearchValue======", e)
      let that=this;
      let name = e.currentTarget.dataset.name;
      let value = e.detail.value
      let inputValue = that.data.inputValue;
      inputValue[name] = value;
      that.setData({ inputValue: inputValue })
      console.log("====inputValue======", that.data.inputValue)
    },
    setMultiPicker: function (itemData, indexOne, indexTwo, indexThree){
      let that=this;
      let dataA = that.data.multistageData;
      let multiIndex = that.data.multiIndex;
      let objName = itemData.name
      let currentData = itemData.listValues
      dataA[objName] = [];
      dataA[objName][0] = [];
      multiIndex[objName] = [indexOne, indexTwo, indexThree];
      // 一级
      for (let j = 0; j < currentData.length; j++) {
        dataA[objName][0].push(currentData[j].name)
      }
      //二级
      if (currentData[indexOne].children&&currentData[indexOne].children.length != 0) {
        dataA[objName][1] = [];
        for (let k = 0; k < currentData[indexOne].children.length; k++) {
          dataA[objName][1].push(currentData[indexOne].children[k].name)
        }
      }
      //三级
      if (currentData[indexOne].children[indexTwo].children&&currentData[indexOne].children[indexTwo].children.length != 0) {
        dataA[objName][2] = [];
        for (let l = 0; l < currentData[indexOne].children[indexTwo].children.length; l++) {
          dataA[objName][2].push(currentData[indexOne].children[indexTwo].children[l].name)
        }
      }
      console.log("===dataA====", dataA)
      console.log("===multiIndex====", multiIndex)
      that.setData({
        multistageData: dataA,
        multiIndex: multiIndex
      })
    },
    selectAddress:function(){
      let that=this;
      this.setData({ locationList: that.data.locationList2})
    },
    checkboxChange:function(e){
      console.log('checkbox发生change事件，携带value值为：', e)
      let index = e.target.dataset.index
      let that = this;
      let selectPicker = that.data.selectPicker;
      selectPicker['checkbox_' + index] = e.detail.value
      this.setData({
        selectPicker: selectPicker
      })
      console.log("=====selectPicker=====", selectPicker)
    },
  // 关闭海报
  getChilrenPoster(e) {
    let that = this;
    that.setData({
      posterState: false,
    })
  },
  showPoster: function () {
    let that = this;
    console.log('===showPoster====', that.data.formId)
    let ewmImgUrl = app.getQrCode({ type: "form_detail", id: that.data.formId })
    that.setData({
      posterState: true,
      ewmImgUrl: ewmImgUrl,
    })
  },
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e, this.data.formData)
    let index = e.target.dataset.index
    this.data.dataAndTime[this.data.formData.items[index].name] = e.detail.value
    this.data.formData.items[index].defaultValue = e.detail.value
    this.setData({
      dataAndTime: this.data.dataAndTime
    })
  },
  bindTimeChange: function (e) {
    console.log('picker发送选择改变，携带值为', e, this.data.formData)
    let index = e.target.dataset.index
    this.data.dataAndTime[this.data.formData.items[index].name] = e.detail.value
    this.data.formData.items[index].defaultValue = e.detail.value
    this.setData({
      dataAndTime: this.data.dataAndTime
    })
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let index = e.target.dataset.index
    let that=this;
    let region = that.data.region;
    region['address_' + index] = e.detail.value
    this.setData({
      region: region
    })
  },
    getCurrentData:function(e){
      console.log("getCurrentData",e);
      let that=this;
      let itemData = e.currentTarget.dataset.itemdata
      that.setData({ currentMultiData: itemData})
    },
  // 多级联
    bindMultiPickerChange: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      let that=this;
      let currentMultiData = that.data.currentMultiData
      let multiIndex = this.data.multiIndex
      multiIndex[currentMultiData.name] = e.detail.value
      this.setData({
        confirmMultiIndex: multiIndex
      })
    },
    bindMultiPickerColumnChange: function (e) {
      let that=this;
      console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
      let currentMultiData = that.data.currentMultiData
      let multiIndex = that.data.multiIndex
      switch (e.detail.column) {
          // 一级联
        case 0:
          that.setMultiPicker(currentMultiData, e.detail.value,0,0,0);
          break;
          // 二级联
        case 1:
          that.setMultiPicker(currentMultiData, multiIndex[currentMultiData.name][0], e.detail.value,0);
          break;
          //三级联
        case 2:
          that.setMultiPicker(currentMultiData, multiIndex[currentMultiData.name][0], multiIndex[currentMultiData.name][1], e.detail.value);
          break;
      }
    },


  tolinkUrl: function (e) {
    if (!app.loginUser) {
      wx.showModal({
        title: '提示',
        content: '主人~您还在登陆哦!稍等片刻',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    let that = this;
    let linkUrl = e.currentTarget.dataset.link
    let index = e.currentTarget.dataset.index
    if (linkUrl.indexOf("select_location.html") != -1) {
      console.log("选择位置")
      that.triggerEvent('selectPsotion', { locationIndex: "position_" + index}) //myevent自定义名称事件，父组件中使用
      that.setData({ reqLocation: true, locationIndex: "position_" + index})
    } else {
      that.setData({ reqLocation: false })
    }
    app.linkEvent(linkUrl + "?locationIndex=" + "position_" + index)
  },
  // 返回首页
  toFormCommitList: function (){
    var a = "form_commit_list.html?customFormId=" + this.data.formId;
    app.linkEvent(a);
  },
  toProcessList: function (formCommitId) {
    let that=this;
   /* let gainActionEvent = JSON.parse(that.data.gainActionEvent)
    gainActionEvent.formCommitId = formCommitId;
    var a = "process_list.html?processId=0&actionEvent=" + JSON.stringify(gainActionEvent);
    app.linkEvent(a);*/
    setTimeout(function () { wx.navigateBack() }, 200);
    if (app.preCallbackObj['processInstanceItem'] && app.preCallbackObj['processInstanceItem'].callback){
      app.preCallbackObj['processInstanceItem'].callback(formCommitId);
    }
  },
  login: function(e) {
    wx.switchTab({
      url: '../../pageTab/custom_page_index/index',
    })
  },
  bindPickerChange:function(event){
    console.log('====index', event)
    let that=this;
    let value = event.currentTarget.dataset.value
    let index = event.currentTarget.dataset.index
    let selectIndex = event.detail.value
    that.data.selectPicker["picker_" + index] = value[selectIndex]
    that.setData({ selectPicker: that.data.selectPicker})
  },
  formSubmit:function(e){
    console.log('form发生了submit事件，携带数据为：', e)
    var that = this;
    console.log('===that.data.formData.items===', that.data.formData.items)
    let newObj={}
    // console.log(that.params);
    let params={};
    let value={}
    params.customFormId = that.data.formId;
    if(e){
      value = e.detail.value
      params.miniNotifyFormId = e.detail.formId;
    }else{
      for (let i = 0; i < that.data.formData.items.length; i++) {
        let name = that.data.formData.items[i].name;
        if ((that.data.formData.items[i].type == 0 || that.data.formData.items[i].type == 9 || that.data.formData.items[i].type == 1)&& (!that.data.inputValue[name] && that.data.inputValue[name]!=='')){
          that.data.inputValue[name] = that.data.formData.items[i].defaultValue||"";
        }
      }
      value =that.data.inputValue;
    }
    console.log('===value1=====', value)
    let imgObj = {};
    let positionObj = {};
    let dataAndTime = {};
    let selectPicker = {};
    let region = {}
    let checkboxList = {}
    let multistageData = {}
    for (let i = 0; i<that.data.formData.items.length;i++){
      if (that.data.formData.items[i].type == 7||that.data.formData.items[i].type ==11){
        imgObj[that.data.formData.items[i].name] = that.data.upLoadImageList['img_' + i]||""
      }else if (that.data.formData.items[i].type == 10) {
        region[that.data.formData.items[i].name] = that.data.region['address_' + i] !='请选择您的地址'?that.data.region['address_' + i] : ""
      } else if (that.data.formData.items[i].type == 5||that.data.formData.items[i].type == 6) {
        dataAndTime[that.data.formData.items[i].name] = that.data.dataAndTime[that.data.formData.items[i].name] || ""
      } else if (that.data.formData.items[i].type == 2) {
        selectPicker[that.data.formData.items[i].name] = that.data.selectPicker['picker_' + i] || ""
      } else if (that.data.formData.items[i].type == 4) {
        checkboxList[that.data.formData.items[i].name] = that.data.selectPicker['checkbox_' + i] || ""
      }else if (that.data.formData.items[i].type == 12) {
        positionObj[that.data.formData.items[i].name] = that.data.locationList['position_' + i] || ""
      } else if (that.data.formData.items[i].type == 13) {
        console.log("that.data.formData.items[i].name", that.data.formData.items[i].name)
        let multistageDataObj = that.data.multistageData[that.data.formData.items[i].name];
        let multiIndexObj = that.data.multiIndex[that.data.formData.items[i].name]
        console.log("===multiIndexObj====", multistageDataObj, multiIndexObj)
        multistageData[that.data.formData.items[i].name] = []
        if (multistageDataObj.length != 0) {
          for (let j = 0; j < multistageDataObj.length; j++) {
            console.log(multistageDataObj[j][multiIndexObj[j]])
            multistageData[that.data.formData.items[i].name].push(multistageDataObj[j][multiIndexObj[j]])
          }
        }
        console.log("====multistageData=====", multistageData)
        // multistageData[that.data.formData.items[i].name] = that.data.multistageData[that.data.formData.items[i].name] || ""
      }else if (that.data.formData.items[i].type ==0){

      }
    }
    value = Object.assign({}, value, imgObj, positionObj, region, dataAndTime, selectPicker, multistageData, checkboxList)
    console.log('===value2=====', value, that.data.formData)
    let itemData = that.data.formData.items
    // return
    console.log('===itemData====', itemData)
    for (let i = 0; i < itemData.length;i++){
      for (let j in value) {
        if(itemData[i].name == j){
          newObj[itemData[i].name] = { value: value[j] || "", title: itemData[i].title, type: itemData[i].type, showInList: itemData[i].showInList, showInListOrder: itemData[i].showInListOrder }
        }
        if (itemData[i].name == j && itemData[i].mustInput == 1 && (!value[j] || value[j].length==0)){
          wx.showModal({
            title: '提示',
            content: '请填写完整',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
              } else if (res.cancel) {
                console.log('用户点击取消')
              }
            }
          })
          return
        } 
      }
    }
    console.log("==newObj====", newObj)
    params.formJson = JSON.stringify(newObj);
    if (that.data.userAddressCustomFormCommitId){
      params.customFromCommitId = that.data.userAddressCustomFormCommitId
    }
    var formData = app.AddClientUrl("/wx_commit_custom_form.html", params, 'post')
    wx.request({
      url: formData.url,
      data: formData.params,
      header: app.headerPost,
      success: function (res) {
        console.log(res.data)

        if (res.data.errcode == '0') {
          wx.showToast({
            title: '提交成功',
            icon: 'success',
            duration: 1000
          })
          if (!that.data.showformSubmitBtn){
            that.triggerEvent('sendDataFun', { formId: res.data.relateObj.id }) //myevent自定义名称事件，父组件中使用
          }
          if (that.data.processType){
            setTimeout(function () {
              that.toProcessList(res.data.relateObj.id)
            }, 1000)
          } else if (that.data.refProductFormType){
            let baseProData={
              productId: that.data.skuData.productId,
              itemCount: that.data.skuData.itemCount,
              shopId: that.data.skuData.shopId,
              cartesianId: that.data.skuData.cartesianId,
              fromSource: 'mini',
              orderType: that.data.skuData.orderType,
            };
            let pintuanData = {
              pintuanCreateType: that.data.skuData.pintuanCreateType,
              pintuanRecordId: that.data.skuData.pintuanRecordId,
              };
            app.createOrder(baseProData, pintuanData, res.data.relateObj.id)
          } else if (that.data.formData.refProductId && that.data.formData.refProductId != 0) {
            let baseProData = {
              productId: that.data.formData.refProductId,
              itemCount: 1,
              shopId: 0,
              cartesianId: 0,
              fromSource: 'mini',
              orderType: 0,
            };
            let pintuanData = {
              pintuanCreateType: 0,
              pintuanRecordId: 0
            };
            app.createOrder(baseProData, pintuanData, res.data.relateObj.id)
          } else if (!that.data.showformSubmitBtn){
            
          }else{
            setTimeout(function () {
              that.toFormCommitList()
            }, 1000)
          }
        } else {
          wx.showToast({
            title: res.data.errMsg,
            image: '/images/icons/tip.png',
            duration: 1000
          })
        }
      },
      fail: function (res) {
        console.log(res.data)
      },
      complete: function (res) {
        wx.stopPullDownRefresh()
      }
    })
  },
  removeImg:function(event){
    let that=this;
    console.log('======event==',event);
    let index = event.currentTarget.dataset.index;
    let num = event.currentTarget.dataset.num;
    that.data.upLoadImageList['img_' + index].splice(num, 1);
    console.log('that.data.upLoadImageList', that.data.upLoadImageList);
    that.setData({ upLoadImageList: that.data.upLoadImageList })
  },
  addCommitImage: function (e) {
    console.log('===addCommitImage=',e)
    var that = this;
    let index = e.currentTarget.dataset.index;
    let count=1;
    let type = e.currentTarget.dataset.type;
    let upLoadImageList = that.data.upLoadImageList
    if (!that.data.upLoadImageList['img_' + index]){
      that.data.upLoadImageList['img_' + index]=[];//初始化数据
    }
    if (type == 7 ){
      count=1;
      if (upLoadImageList['img_' + index]&&upLoadImageList['img_' + index].length == 1){
        console.log("只能选一张")
        wx.showToast({
          title: "只能选一张",
          icon: 'none',
          duration: 2000
        })
        return
      }
    } else if (type == 11) {
      console.log("可选多张")
      count=9
    }
    wx.chooseImage({
      count: count - upLoadImageList['img_' + index].length, // 默认9
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        console.log("===chooseImage===",res)
        let tempFilePaths = res.tempFilePaths
        for (let i = 0; i < tempFilePaths.length;i++){
          that.uploadImage(tempFilePaths[i], tempFilePaths.length, index)
        }
      }
    })
  },
  uploadImage: function (tempFilePaths, count,index) {
    if (!app.loginUser) {
      app.echoErr('用户未登录')
      return
    }
    console.log(count)
    let that = this
    let param = {
      userId: app.loginUser.id
    }
    console.log("==upLoadImageList===", that.data.upLoadImageList)
    var customIndex = app.AddClientUrl("/file_uploading.html", param, 'POST')
    wx.uploadFile({
      url: customIndex.url, //接口地址
      filePath: tempFilePaths,
      name: 'file',
      formData: customIndex.params,
      header: {'content-type': 'multipart/form-data'},
      success: function (res) {
        let upLoadImageList = that.data.upLoadImageList
        var data = res.data
        console.log("===success===",data)
        if (typeof (data) == 'string') {
          data = JSON.parse(data)
          console.log("====string====",data)
          if (data.errcode == 0) {
            upLoadImageList['img_' + index].push(data.relateObj.imageUrl)
            that.setData({
              upLoadImageList: upLoadImageList
            })
          }
        } else if (typeof (data) == 'object') {
          console.log("===object====", data)
          if (data.errcode == 0) {
            upLoadImageList['img_' + index].push(data.relateObj.imageUrl)
            that.setData({
              upLoadImageList: upLoadImageList
            })
          }
        }
        console.log('==upLoadImageList==',that.data.upLoadImageList)
        //do something
      }, fail: function (e) {
        console.log(e)
      }, complete: function (e) {
        // if (count == 1 || count < 1) {
        //   return false;
        // } else {
        //   that.uploadImage(tempFilePaths, --count)
        // }

      }
    })
  },
  },
})