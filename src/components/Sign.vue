<template>
    <div id="sign">
        <ul class="sign-wrapper">
            <li class="tel">
                <inputWidget
                    widgetId="tel"
                    widgetType="tel"
                    widgetName="手机号码"
                    maxlength="11"
                    type="tel"
                    placeholder="请输入手机号码"
                    :initVal="tel.value"
                    @listenChild="receiveChildData"/>
            </li>
        </ul>
        <div class="submit-btn" :class="{active: btnStatus}" @click="submitFn">签到</div>
    </div>
</template>

<script>

    // 导入widget
    import inputWidget from '@/components/commons/Input';

    import Server from '../services/enroll';

    export default {
        name: 'Detail',
        data () {
            return {
                tel: {
                    value: ''
                },
                btnStatus: false //提交按钮的状态
            }
        },
        components: {
            inputWidget
        },
        // 生命周期钩子
        mounted () {

        },
        /*beforeRouteEnter(to, from, next) {

            let _this,
                urlParams = to.params;
        },*/
        methods: {

            // 接收父组件传回的数据
            receiveChildData (childData) {

                let _this = this;

                _this.tel.value = childData.value;

                if (_this.tel.value) {

                    _this.btnStatus = true;
                } else {
                    _this.btnStatus = false;
                }
            },

            submitFn() {

                let telReg = /(^(13\d|14[57]|15[^4,\D]|17[0135678]|18\d)\d{8})$/;

                if (!telReg.test(this.tel.value)) {

                    AlertBox({
                        type: 'mini',
                        msg: '请输入正确的手机号码'
                    });

                    return;
                }

                let _this = this,
                    urlParams = _this.$route.params;

                Server.checkSign(urlParams.actCode, urlParams.storeCode, _this.tel.value).then(code => {

                    //4033 已经签到 | 4032 还未签到 | 4031 现在还不可以签到
                    if (code === '4033') {

                        AlertBox({
                            type: 'mini',
                            msg: '您已经签到过啦'
                        });
                    } else if (code === '4031') {

                        AlertBox({
                            type: 'mini',
                            msg: '现在还不可以签到'
                        });

                    } else if (code === '4032') {

                        $.cookie('signTel', _this.tel.value);
                        _this.$router.push({
                            name: 'enroll',
                            params: {
                                actCode: urlParams.actCode,
                                storeCode: urlParams.storeCode,
                                storeType: urlParams.storeType,
                                sign: '0'
                            }
                        });
                    }
                });
            }
        }
    }
</script>

<style scoped>

    .submit-btn {
        width: 100%;
        height: 1.98rem;
        font-size: .68rem;
        line-height: 1.98rem;
        border-radius: 0;
        display: block;
        background: #cacaca;
        color: #999;
        position: fixed;
        left: 0;
        bottom: 0;
        text-align: center;

        &.active {
            background: #ffc001;
            color: #fff;
        }
    }
</style>
