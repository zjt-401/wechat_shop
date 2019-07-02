const app = getApp();
Component({
  properties: {


    // 这里定义了innerText属性，属性值可以在组件使用时指定
    data: {
      type: JSON,
      value: 'default value',
    }
  },
  data: {
    // 这里是一些组件内部数据
    someData: {}
  },
  ready: function () {
    let that = this;
    console.log('=====导航=====', this.data.data)
  },
  methods: {
    // 这里是一个自定义方法

    tolinkUrl: function (event) {
      console.log(event.currentTarget.dataset.link)
      app.linkEvent(event.currentTarget.dataset.link);


      // wx.navigateTo({
      //   url: '/pages/' + event.currentTarget.dataset.page + '/index'
      // })
    }
  },
})