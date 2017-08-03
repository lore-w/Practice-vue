<template>
    <div id="success">
        <h3 class="success-tips">{{result}}</h3>
        <p class="success" v-if="startTime">
            欢迎您于{{startTime}}至{{endTime}}前往{{activityLocation}}参与活动。
        </p>

        <div class="success-btn" v-if="startTime">
            <span class="share">分享</span>
            <span class="show-store" v-if="storeBtn">查看门店</span>
        </div>
        <p class="success-v" :class="{fail: vFail}" @click="enrollV">{{vText}}</p>
    </div>
</template>

<script>

    import Server from '../services/enroll';
    import {Util} from '../commons/util';

    let isneedLogin,
        cityId,
        storeCode;

    export default {
        name: 'Detail',
        data () {
            return {
                'result': '恭喜您，报名成功！',
                'startTime': '',
                'endTime': '',
                'activityLocation': '',
                'storeBtn': false,
                'vText': '',
                'vFail': true
            }
        },
        // 生命周期钩子
        mounted () {

        },
        beforeRouteEnter(to, from, next) {

            let _this,
                urlParams = to.params;



            // 如果是签到
            if (urlParams.sign === '0') {

                next(vm => {

                    vm.result = '恭喜您，签到成功！';
                    return;
                });
            }

            Server.queryActDetailsInfo(urlParams.actCode).then(data => {

                next(vm => {

                    _this = vm;

                    let sTime = Util.getStringTime(data.activityStarttime),
                        eTime = Util.getStringTime(data.activityEndtime);

                    isneedLogin = data.isneedLogin;


                    _this.startTime = sTime.M + '\u6708' + sTime.D + '\u65e5 ' + sTime.h + ':' + sTime.m;
                    _this.endTime = eTime.M + '\u6708' + eTime.D + '\u65e5 ' + eTime.h + ':' + eTime.m;
                    _this.activityLocation = data.activityLocation;

                    let vStatus = $.cookie('vStatus'),
                        btnStatus = $.cookie('btnStatus');


                    _this.storeBtn = btnStatus === '1';

                    switch (vStatus) {

                        case '0':
                            _this.vText = '我们的导购员稍后会跟您进行确认，届时将全程陪同，为您服务';
                            _this.vFail = false;
                            break;
                        case '1':
                            _this.vFail = false;
                            break;
                        case '2':
                            _this.vText = '预约接待导购还需登录，如有需要点此前往';
                            break;
                        case '3':
                            // 跳转url（http://res.mpre.cnsuning.com/project/vbuy/salespersons.html?cityId=9173&channel=13&storeCode=7611）
                            _this.vText = '预约导购失败，继续预约可点击前往';
                            cityId = $.cookie('cityId');
                            storeCode = $.cookie('storeCode');
                            break;
                        default:
                            _this.vFail = false;
                    }
                });
            });
        },
        methods: {

            enrollV() {

                if (!this.vFail) return;

                let _this = this;

                // 去预约导购
                if ($.cookie('vStatus') === '2') {

                    Util.auth(() => {

                        // 取出报名页面存储的提交数据
                        let submitData = JSON.parse(window.sessionStorage.submitData);

                        submitData.isBooking = '3';

                        Server.enroll('1', submitData).then(data => {

                            console.log('submitData', data);

                            // 预约导购成功
                            if (data.data.code === '0') {

                                _this.vText = '我们的导购员稍后会跟您进行确认，届时将全程陪同，为您服务';
                                _this.vFail = false;
                                $.cookie('vStatus', '0');
                            } else {
                                _this.vText = '预约导购失败，继续预约可点击前往';
                                $.cookie('vStatus', '3');
                            }
                        });
                    });
                } else if ($.cookie('vStatus') === '3') {

                    // 跳V购预约页面
                    window.location.href = `//res.mpre.cnsuning.com/project/vbuy/salespersons.html?cityId=${cityId}&storeCode=${storeCode}&channel=13`;
                } else {

                    return false;
                }
            }
        }
    }
</script>

<style scoped>

    #success {
        width: 100%;
        height: 100%;
        background: #f2f2f2;
    }

    .success-tips {
        display: block;
        font-size: .6rem;
        text-align: center;
        overflow: hidden;
        color: #E21D1D;

        &:before {
             margin-top: 3.6rem;
             content: "";
             display: block;
             width: 100%;
             height: 4.98rem;
             background: url('../assets/ico-success-new.png') center center no-repeat;
             background-size: 12.58rem 4.98rem;
         }
    }

    .success {
        font-size: .52rem;
        width: 8.4rem;
        margin: .6rem auto 0;
        text-align: center;
    }

    .success-btn {
        margin: 1.4rem 2.6rem;
        display: -webkit-box;

        span {
            -webkit-box-flex: 1;
            height: 1.12rem;
            line-height: 1.12rem;
            border-radius: .1rem;
            display: block;
            border: 1px solid #eda200;
            text-align: center;
            margin: 0 .25rem;

            &.share {
                color: #eda200;
                border: 1px solid #eda200;
            }

            &.show-store {
                color: #e21d1d;
                border: 1px solid #e21d1d;
            }
        }
    }

    .success-v {
        color: #999;
        padding: 0 3rem;
        text-align: center;

        &.fail {
            text-decoration: underline;
            color: #ffc001;
        }
    }
</style>
