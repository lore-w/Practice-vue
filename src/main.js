// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import vueResource from 'vue-resource'
import App from './App'
import router from './router'
let NProgress = require('./commons/nProgress').NProgress;

let transName;

Vue.use(vueResource);

// 设置过渡动画类型
router.beforeEach((to, from, next) => {
    
    NProgress.start();
    transName = !from.name ? 'fade' : 'slide';
    next();
});

router.afterEach(() => {
    
    NProgress.done();
});



new Vue({
  el: '#app',
  router,
  template: '<App :transName="transName"/>',
  components: {App},
    data() {
      return {
          transName: transName
      }
    }
});
