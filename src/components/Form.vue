<template>
    <div id="enroll">
        <ul class="enroll-wrapper" :class="{'hasv': !v.has}">
            <!--手机号-->
            <li class="tel">
                <inputWidget
                    widgetId="tel"
                    widgetType="tel"
                    widgetName="手机号码"
                    maxlength="11"
                    type="tel"
                    placeholder="请输入手机号码"
                    :initVal="tel.value"
                    ref="childTel"
                    @listenChild="receiveChildData"/>
            </li>
            <!--图形验证码-->
            <li v-if="imageCode.imgUrl" class="img-code">
                <imageCodeWidget
                    widgetId="imageCode"
                    widgetType="imageCode"
                    widgetName="验证码"
                    maxlength="4"
                    :uuid="imageCode.uuid"
                    :imageCode="imageCode.imgUrl"
                    :initVal="imageCode.value"
                    @listenChild="receiveChildData"/>
            </li>
            <!--限制条件部分（既根据服务返回的字段决定需要填写的字段）-->
            <!--0是单选框、1是多选框、2是文字输入框、3是数字输入框、4是时间控件、5是地址控件、6是详细地址控件、7是城市门店类型-->
            <li v-for="(item, index) in limitFields">
                <template v-if="item.fieldType === '0'">
                    <selectWidget
                        :widgetId="item.fieldId"
                        widgetType="0"
                        :widgetName="item.filedName"
                        :options="item.optionValues"
                        selectType="0"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '1'">
                    <selectWidget
                        widgetType="1"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        :options="item.optionValues"
                        selectType="1"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '2'">
                    <inputWidget
                        widgetType="2"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        maxlength="40"
                        type="text"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '3'">
                    <inputWidget
                        widgetType="3"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        maxlength="30"
                        type="tel"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '4'">
                    <datechooserWidget
                        widgetType="4"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '5'">
                    <addressWidget
                        widgetType="5"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '6'">
                    <detailAddressWidget
                        widgetType="5"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
                <template v-else-if="item.fieldType === '7'">

                    <storeSelectWidget
                        widgetType="7"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        :initSelect="item.value"
                        @listenChild="receiveChildData"
                        :placeholder="item.placeholder"/>
                </template>
            </li>

            <!--只读字段（这里的字段不用提交到服务器，比如山西路店创建的活动，报名信息中不用提交店名）-->
            <li v-for="(item, index) in readOnlyField">
                <div class="read-only-input">
                    <div class="ro-left">{{item.labelName}}</div>
                    <div class="ro-right">
                        <input type="text" :value="item.value" readonly>
                    </div>
                </div>
            </li>
        </ul>

        <div class="vbuy" v-if="v.has">

            <div class="v-switch">
                <p>选择导购服务</p>
                <div class="switch-btn" @click="switchBtn">
                    <span :class="{disabled: v.disabled}"></span>
                </div>
            </div>
            <p>{{showVTips}}</p>

            <ul v-if="v.vPersonList.length > 0" class="lazyimg">
                <li v-for="(item, index) in v.vPersonList" @click="selectPerson(item.guideId)">
                    <span class="status" :class="{active: v.selectGuideId === item.guideId}"></span>
                    <div><img :data-src="item.guidePhoto" alt=""></div>
                    <h3>{{item.guideName}}</h3>
                    <span class="tips">已服务<b>{{item.orderNum}}</b>人</span>
                </li>
            </ul>
        </div>

        <div class="submit-btn" :class="{active: btnStatus}" @click="submitFn">{{btnText}}</div>
    </div>
</template>

<script>

    // 导入widget
    import inputWidget from '@/components/commons/Input';
    import selectWidget from '@/components/commons/Select';
    import imageCodeWidget from '@/components/commons/ImageCode';
    import storeSelectWidget from '@/components/commons/Store';
    import addressWidget from '@/components/commons/Address';
    import detailAddressWidget from '@/components/commons/DetailAddress';
    import datechooserWidget from '@/components/commons/Datechooser';

    import CONF from '../commons/conf';
    import Server from '../services/enroll';
    import {Util} from '../commons/util';

    // 自动提取需要模块只能通过es6方式引用
    import _ from 'lodash';

    // Promise 垫片
    require('core-js/fn/promise');

    let needLogin,
        hasLogin = false,
        /* isBooking 报名的入参
         * 0 报名并立即预约导购（已经登录的情况）
         * 1 报名不预约导购（没有选择导购）
         * 2 报名并延迟预约导购（没有登录，先报名，然后报名成功页再去约导购）
         * 3 不报名，单独预约导购，特殊情况：非门店且无导购：报名不预约导购（接2，在报名成功页直接约导购）
         */
        isBooking;

    export default {
        name: 'Form',
        data () {
            // 页面视图模型
            return {
                tel: {
                    value: ''
                },
                imageCode: {
                    value: '',
                    uuid: '',
                    imgUrl: ''
                },
                limitFields: [],//用于渲染用户需要输入哪些字段
                readOnlyField: [],//有些字段只做展示用，比如门店创建的活动，活动门店字段不可修改也不用提交到服务器
                v: {
                    has: true,
                    storeCode: '',
                    disabled: false, // 导购开关
                    tipText: '', // 提示文案
                    selectGuideId: '',
                    vPersonList: [] // 导购员列表
                },
                btnStatus: false, //提交按钮的状态
                btnText: '提交', //提交 | 签到
            }
        },
        components: {
            inputWidget,
            selectWidget,
            imageCodeWidget,
            storeSelectWidget,
            addressWidget,
            detailAddressWidget,
            datechooserWidget
        },
        // 生命周期钩子
        mounted () {

            // 判断是否登录
            $.probeAuthStatus(() => {
                hasLogin = true;
            }, () => {
                hasLogin = false;
            }, CONF.PASSPORT.CONFIG);
        },
        methods: {

            // 接收子组件传回的数据
            receiveChildData (childData) {

                let _this = this;

                switch(childData.widgetType) {
                    case 'tel':
                        this.tel.value = childData.value;
                        break;
                    case 'imageCode':
                        this.imageCode.value = childData.value;
                        break;
                    default:
                        _.map(_this.limitFields, function (item) {

                            if (item.fieldId === childData.widgetId) {

                                if (item.fieldType === '6') {

                                    // 下面的判断主要针对详细地址控件，传回来的值可能是数组（省市等数据）也可能是字符串（文本框输入的值）
                                    if (typeof childData.value === 'undefined') {

                                        // 修复输入汉字，汉字还在候选区时，把value改成undefined的问题
                                        return;
                                    } else if (typeof childData.value === 'string') {

                                        item.optionValues = childData.value;
                                    } else {

                                        item.value = childData.value;
                                    }
                                } else {
                                    item.value = childData.value;
                                }
                            }
                        });

                        childData.widgetType === '7' && (this.v.storeCode = childData.value[2].storeCode);
                }

                // 取出值为假的字段，即未填写的字段
                let limitFalseValueFields = _.filter(_this.limitFields, item => !item.value);

                //console.log('limitFalseValueFields.length', limitFalseValueFields.length);
                if (limitFalseValueFields.length === 0 && this.tel.value) {

                    if (!this.imageCode.imgUrl) {

                        _this.btnStatus = true;
                    } else {

                        if (this.imageCode.value) {
                            _this.btnStatus = true;
                        } else {
                            _this.btnStatus = false;
                        }
                    }

                } else {

                    _this.btnStatus = false;
                }
            },

            // V购开关
            switchBtn() {

                this.v.disabled = !this.v.disabled;
            },

            // 选择导购
            selectPerson(guideId) {

                this.v.selectGuideId = guideId;
            },

            // 更新V购数据公用方法
            updateVData(storeCode) {

                let _this = this;

                Server.queryVPersonList(storeCode).then(vData => {

                    //console.log('vPersonList', vData);
                    if (vData.guideList.length > 0) {
                        // 默认第一个导购选中
                        _this.v.selectGuideId = vData.guideList[0].guideId;
                        // 更新V购列表数据
                        _this.v.vPersonList = vData.guideList;

                        setTimeout(() => {

                            $(".lazyimg").lazyload();
                        }, 800);
                    } else {

                        // 没有数据
                    }
                });
            },

            // 提交
            submitFn() {

                let telReg = /(^(13\d|14[57]|15[^4,\D]|17[0135678]|18\d)\d{8})$/,

                    // 有没有选择门店
                    storeLimitField = _.filter(this.limitFields, item => item.fieldType === '7');

                if (!telReg.test(this.tel.value)) {

                    AlertBox({
                        type: 'mini',
                        msg: '请输入正确的手机号码'
                    });

                    return;
                }

                let _this = this,
                    urlParams = _this.$route.params,
                    limitContent = [],
                    optionValues,
                    submitData = {
                        activityCode: urlParams.actCode,
                        signupForm: 1, // 报名1 签到2
                        phoneNum: this.tel.value,
                        creatorStoreCode: urlParams.storeCode,
                        schannel: 1,
                        limitContent: ''
                    };

                // 判断是否有验证码
                if (this.imageCode.value) submitData.imageCode = this.imageCode.value;

                // 判断是否预约了导购
                /* isBooking 报名的入参
                 * 0 报名并立即预约导购（已经登录的情况）
                 * 1 报名不预约导购（没有选择导购）
                 * 2 报名并延迟预约导购（没有登录，先报名，然后报名成功页再去约导购）
                 * 3 不报名，单独预约导购，特殊情况：非门店且无导购：报名不预约导购（接2，在报名成功页直接约导购）
                 */
                if (!this.v.disabled && !!this.v.selectGuideId) {

                    submitData.guideId = this.v.selectGuideId;

                    // 这里不可以通过全局变量hasLogin判断登录，防止新开一个标签页退出登录的情况
                    $.probeAuthStatus(function () {

                        // 已经登录
                        isBooking = '0';
                    }, function () {

                        // 未登录
                        isBooking = '2'
                    }, CONF.PASSPORT.CONFIG);
                } else {

                    isBooking = '1';
                }

                // 判断是否选择了门店
                storeLimitField.length > 0 && (submitData.storeCode = storeLimitField[0].value[2].storeCode);

                _.forEach(this.limitFields, item => {

                    switch(item.fieldType) {

                        case '1':
                            // 多选
                            optionValues = item.value.split(',');
                            break;
                        case '4':
                            // 时间控件
                            optionValues = Util.formatDate(item.value, '-');
                            break;
                        case '5':
                            // 地址控件
                            optionValues = item.value[2].distName;
                            break;
                        case '6':
                            // 详细地址控件
                            optionValues =
                                item.value[0].name + ',' +
                                item.value[1].cityName + ',' +
                                item.value[2].distName +
                                item.optionValues;
                            break;
                        case '7':
                            // 门店控件
                            submitData.storeCode = item.value[2].storeCode;
                            optionValues = item.value[2].storeName;
                            break;
                        default:

                            // 单选（0）|文字输入（2）|数字输入（3）
                            optionValues = item.value;
                    }

                    limitContent.push({
                        filedName: item.filedName,
                        fieldType: item.fieldType,
                        optionValues: optionValues
                    });
                });

                submitData.limitContent = JSON.stringify(limitContent);

                // 把submitData存到本地，在报名成功页预约导购
                window.sessionStorage.submitData = JSON.stringify(submitData);

                // 提交
                if (urlParams.sign === '0') {

                    // 签到
                    submitData.signupForm = 2;

                    // 需要登录
                    if (needLogin == 1) {

                        Util.auth(() => {

                            Server.sign(needLogin, submitData).then(data => {

                                if (data.code === '0') {
                                    _this.$router.push({
                                        name: 'success',
                                        params: {
                                            actCode: urlParams.actCode,
                                            sign: '0'
                                        }
                                    });
                                }
                            });
                        });
                    } else {

                        // 不需要登录
                        Server.sign(needLogin, submitData).then(data => {

                           if (data.code === '0') {
                                _this.$router.push({
                                    name: 'success',
                                    params: {
                                        actCode: urlParams.actCode,
                                        sign: '0'
                                    }
                                });
                            }
                        });
                    }

                } else {

                    // 报名
                    submitData.isBooking = isBooking;

                    Server.enroll(needLogin, submitData).then(data => {

                            // 报名成功
                            if (data.code === '0') {

                                // 报名成功页是否显示查看门店按钮
                                let btnStatus = (storeLimitField.length > 0) ? 0 : 1;
                                $.cookie('btnStatus', btnStatus);

                                if (data.v === '2') {

                                    //还需要登录去预约V购
                                    $.cookie('vStatus', '2');
                                } else if (data.v === '1') {

                                    //报名成功
                                    $.cookie('vStatus', '1');
                                } else {

                                    if (data.data.code === '0') {

                                        //预约V购成功
                                        $.cookie('vStatus', '0');
                                    } else{

                                        //预约V购失败
                                        $.cookie('vStatus', '3');
                                        $.cookie('cityId', storeLimitField.value[1].cityId);
                                        $.cookie('storeCode', storeLimitField.value[2].storeCode);
                                    }
                                }

                                _this.$router.push({
                                    name: 'success',
                                    params: {
                                        actCode: urlParams.actCode,
                                        sign: '1'
                                    }
                                });
                            }
                        });
                }
            }
        },
        watch: {
            'v.storeCode': function (val, oldVal) {

                !!val && this.updateVData(val);
            }
        },
        computed: {

            showVTips: function () {

                let vTipsText = '';

                if (this.v.disabled) {
                    // 按钮关
                    vTipsText = '如有需要，可重新打开开关，我们会为您安排接待导购';
                } else {
                    //按钮开
                    if (!this.v.storeCode) {
                        //未定位出城市，显示请选择
                        vTipsText = '请选择活动门店，以便我们为您安排接待导购';
                    } else {
                        //已经定位出城市
                        if (this.v.vPersonList.length === 0) {
                            //该城市下没有V购数据
                            vTipsText = '该门店暂无接待导购，如有需要，可切换活动门店试试看~';
                        } else {
                            //该城市下有V购数据
                            if (hasLogin) {
                                vTipsText = '报名成功后，导购员会拨打您留下的手机号进行确认';
                            } else {
                                vTipsText = '报名成功后登录可完成预约';
                            }
                        }
                    }
                }
                return vTipsText;
            }
        },
        beforeRouteEnter(to, from, next) {

            let _this,
                urlParams = to.params,
                activityCode = urlParams.actCode,
                storeCode = urlParams.storeCode,
                storeType = urlParams.storeType,
                queryLimitFieldsPromise,
                queryIsVbuyPromise;

            // 查询报名限制条件（需要填哪些字段）
            queryLimitFieldsPromise = Server.queryLimitFields(activityCode, storeCode, storeType);

            // 查询报名活动是否门店创建的活动及是否关联了V购
            queryIsVbuyPromise = Server.queryIsVbuy(activityCode, storeType);

            Promise.all([queryLimitFieldsPromise, queryIsVbuyPromise]).then(([limitFieldData, vData]) => {

                let limitFields = JSON.parse(limitFieldData.limitContent);

                // 还未进入组件，没有_this.limitField
                next(vm => {

                    _this = vm;
                    let limitFieldsTemp = [];

                    _.forEach(limitFields, value => {

                        let type = value.fieldType,
                            placeholder;

                        if (type === '0' || type === '1') {

                            placeholder = '请选择（' + value.filedName + '）';
                        } else if (type === '4' || type === '5') {

                            placeholder = '请选择' + value.filedName;
                        } else {

                            placeholder = '请输入' + value.filedName
                        }

                        limitFieldsTemp.push({
                            fieldId: value.fieldId,
                            fieldType: value.fieldType,
                            filedName: value.filedName,
                            optionValues: value.optionValues,
                            placeholder: placeholder,
                            value: ''
                        });
                    });

                    vm.limitFields = limitFieldsTemp;
                    needLogin = limitFieldData.isneedLogin;

                    /**
                     * 如果从签到过来，把签到页的手机号带出来，因为tel字段没有经过v-if判断这个时候，
                     * 在这个时候已经完成了初始化所以不会得到预期的效果
                     */
                    //vm.$route.params.sign == '0' && (vm.tel.value = $.cookie('signTel'));
                    if (vm.$route.params.sign === '0') {

                        vm.tel.value = $.cookie('signTel');
                        vm.$refs.childTel.receivedParentUpdate(vm.tel.value);
                    }
                });

                // 签到

                if (urlParams.sign === '0') {

                    // 签到不关联V购
                    return 0;
                } else {

                    // 报名
                    return vData;
                }

            }).then(vData => {

                if (!vData) {

                    _this.v.has = false;
                    _this.btnText = '签到';
                    return;
                }

                let vType = 1 * vData.flow;

                /*
                 * vType V购的类型
                 * vType === 1 非门店活动，不关联V购 | 门店活动，不关联V购 | 门店活动，关联V购但是此门店下无店员
                 * vType === 2 门店活动，关联V购
                 * vType === 3 非门店（比如总部、大区）创建的活动，关联V购的活动
                 * vType === 4 非门店活动，但是是门店的二维码，关联V购
                 * */
                switch (vType) {

                    case 1:
                        _this.v.has = false;
                        break;

                    case 2:

                        _this.readOnlyField.push({
                            labelName: '活动门店',
                            value: vData.storeName
                        });

                        _this.v.storeCode = vData.storeCode;
                        break;

                    case 3:
                        //非门店（比如总部、大区）创建的活动，关联V购的活动(需要定位当前用户最近的门店)
                        $.loadMod('//res.suning.cn/public/v5/mod/geo/2.0.0/geo.js').done(function(){
                            Wap.Geo(meta => {

                                let cityId = meta.cityNo,
                                    lat = meta.location.lat || meta.location.lati,
                                    lng = meta.location.lng || meta.location.longi;

                                /*
                                 * GeoType有三种取值 ip | Gps | app（易购）
                                 * ip 表示定位失败
                                 * zhaoji 重构之前的版本把ip定位算在定位失败的场景中
                                 * 这个版本做了精简，因为Wap.geo有默认值（南京），不考虑定位失败的场景
                                 */
                                Server.queryStoreByLocation(activityCode, cityId, lng, lat).then(storeData => {

                                    //console.log('queryStoreByLocation', storeData);

                                    if (_.isEmpty(storeData.signUpStore)) {

                                        _this.limitFields.push({
                                            fieldId: 'limit_7',
                                            fieldType: '7',
                                            filedName: '活动门店',
                                            value: []
                                        });
                                    } else {

                                        _this.limitFields.push({
                                            fieldId: 'limit_7',
                                            fieldType: '7',
                                            filedName: '活动门店',
                                            value: [
                                                {}, // 省
                                                {}, // 市
                                                {
                                                    storeCode: storeData.signUpStore.storeCode,
                                                    storeName: storeData.signUpStore.storeName
                                                }
                                            ]
                                        });
                                        _this.v.storeCode = storeData.signUpStore.storeCode;
                                    }
                                })
                            });
                        });
                        break;

                    case 4:

                        _this.limitFields.push({
                            fieldId: 'limit_7',
                            fieldType: '7',
                            filedName: '活动门店',
                            value: [
                                {}, // 省
                                {}, // 市
                                {
                                    storeCode: vData.storeCode,
                                    storeName: vData.storeName
                                }
                            ]
                        });
                        _this.v.storeCode = vData.storeCode;
                        break;
                }
            });
        }
    }
</script>

<style scoped>

    #enroll {
        width: 100%;
        height: 100%;
        background: #f2f2f2;
    }

    .enroll-wrapper {
        height: auto;

        &.hasv {
           padding-bottom: 2rem;
        }

        >  li {
            /*margin-bottom: .56rem;*/
            overflow: hidden;

            &.tel {
                margin-bottom: .56rem;
            }

            &.img-code {
                margin-top: -.56rem;
                margin-bottom: .56rem;
            }

        }

        .read-only-input {
            height: 88px;
            line-height: 88px;
            color: #313131;
            border-bottom: 1px solid #DCDCDC;
            background: #fff;
        }

        .ro-left {
            width: 3.75rem;
            display: block;
            font-size: .6rem;
            padding-left: .5rem;
            float: left;
        }

        .ro-right {
            overflow: hidden;

            input {
                border: 0;
                margin-top: -9px;
                outline: none;
                height: 70px;
                line-height: 70px;
                color: #353d44;
                padding: .5rem 0;
                width: 100%;
                font-size: .6rem;
            }
        }
    }

    .vbuy {
        height: auto;
        overflow: hidden;
        padding-bottom: 2rem;

        .v-switch {
            height: 88px;
            line-height: 88px;
            background: #ffffff;
            color: #313131;
            border-bottom: 1px solid #dcdcdc;
            font-size: .6rem;
            padding-left: .5rem;
            margin-top: .56rem;
            position: relative;
        }
        .switch-btn {
            display: block;
            width: 1.84rem;
            height: 1.1rem;
            position: absolute;
            top: 50%;
            margin-top: -.6rem;
            right: .5rem;
            overflow: hidden;

            span {
                position: absolute;
                top: 0;
                left: -1.84rem;
                width: 3.68rem;
                height: 1rem;
                transition: left .2s ease-in-out;

                &:before, &:after {
                    content: '';
                    display: inline-block;
                    width: 1.84rem;
                    height: 1rem;
                }

                &:before {
                    background: url("../assets/swith-gray.png") no-repeat;
                    background-size: 1.84rem 1rem;
                }

                &:after {
                    background: url("../assets/swith-yellow.png") no-repeat;
                    background-size: 1.84rem 1rem;
                }
            }

            span.disabled{

                left: 0;
            }
        }

        > p {
            font-size: .48rem;
            color: #999;
            line-height: .5rem;
            padding: .48rem;
            display: block;
        }

        ul {
            padding: .4rem .225rem;
            background-color: #f8f8f8;
            height: auto;
            overflow: hidden;
            width: 100%;

            li {
                background-color: #FFF;
                border-radius: .2rem;
                float: left;
                width: 4.3rem;
                height: 5.4rem;
                margin: 0 .275rem .48rem .275rem;
                /*box-shadow: 0 0 0.2rem #EEE;*/
                text-align: center;
                box-sizing: border-box;
                position: relative;

                > div {
                      width: 2.4rem;
                      height: 2.4rem;
                      border-radius: 1.2rem;
                      margin: .6rem auto .3rem auto;
                      border: 1px solid #d8d7d7;
                  }

                  img {
                      width: 100%;
                      height: 100%;
                      border-radius: 50%;
                  }

                  h3 {
                      font-size: .6rem;
                      color: #333;
                  }

                  span.tips {
                      font-size: .48rem;
                      color: #999;

                      b {
                          color: #fa0;
                          font-style: normal;
                      }
                  }

                span.status {
                    display: block;
                    width: 50px;
                    height: 48px;
                    background: url("../assets/close-gray.png") no-repeat;
                    background-size: 50px 48px;
                    position: absolute;
                    top: -15px;
                    right: -18px;

                    &.active {
                         background: url("../assets/close-ligth.png") no-repeat;
                         background-size: 50px 48px;
                     }
                }
            }
        }
    }

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
