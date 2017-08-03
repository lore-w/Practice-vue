<template>
    <div>
        <div class="widget-top">
            <div class="widget-left">{{widgetName}}</div>
            <div class="widget-right">
                <input type="text" readonly :placeholder="placeholder"
                       @click="clickInput"
                       :value="fullAddress"/>
                <span class="db-arrow" :class="{active: active === '1'}"></span>
            </div>
        </div>
        <div class="widget-bottom" v-show="active">
            <div id="store-chooser-wrapper">
                <div class="store-chooser animated" :class="{slideInUp: active}">
                    <!--标题-->
                    <h1 class="chooser-header">
                        <div class="nav-title">选择门店</div>
                        <div class="right-menu" @click="cancelHandler"></div>
                    </h1>
                    <!--导航-->
                    <ul class="tab-nav">
                        <li :class="{selected: navItem.valueField === selectedField}"
                            v-for="(navItem, index) in fields" v-text="navItem.selectedItem[navItem.labelField]"
                            @click="switchNav(index)">
                        </li>
                    </ul>
                    <!--主体-->
                    <div class="container">
                        <div class="content" :style="translateStyle">
                            <div class="tab" v-for="(field, index) in fields">
                                <div class="scroll">
                                    <ul>
                                        <li :class="{selected: field.selectedItem[field.valueField] === item[field.valueField]}"
                                            v-for="item in field.items" @click="drillDown(index, item)"
                                            v-text="item[field.labelField]">
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>

    import Vue from 'vue';
    import vueResource from 'vue-resource';
    import CONF from '../../commons/conf';
    import LISTPROVINCE from '../../commons/listProvince';

    import _ from 'lodash';

    // Promise 垫片
    require('core-js/fn/promise');

    export default {
        name: 'AddressWidget',
        props: [
            // 控件类型 0是单选框、1是多选框、2是文字输入框、3是数字输入框、4是时间控件、5是地址控件、6是详细地址控件、7是城市门店类型
            'widgetType',
            'widgetId',
            'widgetName', // 控件名称
            'isActive',
            'initSelect',
            'placeholder'
        ],
        data () {

            //视图模型
            return {
                selectedField: 'mdmId',
                // 城市组件是否显示
                active: this.isActive,
                // 省、市、区数据
                fields: [
                    {
                        valueField: 'mdmId',
                        labelField: 'name',
                        selectedItem: {},
                        items: []
                    },
                    {
                        valueField: 'cityNo',
                        labelField: 'cityName',
                        selectedItem: {},
                        items: []
                    },
                    {
                        valueField: 'distCode',
                        labelField: 'distName',
                        selectedItem: {},
                        items: []
                    }
                ],
                translateStyle: {
                    "-webkit-transform": "translate(0px, 0px) translateZ(0px)"
                }
            }
        },
        computed: {

            fullAddress () {

                if (!!this.fields[2].selectedItem.distName) {

                    return (this.fields[0].selectedItem.name + ',' + this.fields[1].selectedItem.cityName + ',' + this.fields[2].selectedItem.distName);
                }
            }
        },
        mounted () {

            this.init();

        },
        methods: {

            init() {
                let _this = this;

                // 先检查是否传入默认选中的选项
                if (typeof _this.initSelect !== 'undefined' && _this.initSelect.length > 0) {

                    _.forEach(_this.initSelect, (value, index, arr) => {

                        let valueField = _this.fields[index].valueField,
                            labelField = _this.fields[index].labelField;

                        if (!_.has(value, valueField) || !_.has(value, labelField)) {

                            console.info('初始化StoreWidget参数错误或参数不全');
                        } else {
                            _this.fields[index].selectedItem = value;
                        }
                    });

                    _this.tellParent();
                }

                // 初始化省数据（本地文件）
                _this.fields[0].items = LISTPROVINCE;
                _.isEmpty(_this.fields[0].selectedItem) && (_this.fields[0].selectedItem = LISTPROVINCE[0]);

                _this.queryCityByProvCode(_this.fields[0].selectedItem.mdmId).then(cityData => {
                    _this.fields[1].items = cityData;
                    _.isEmpty(_this.fields[1].selectedItem) && (_this.fields[1].selectedItem = cityData[0]);

                    return cityData[0];
                }).then(cityData => {
                    _this.queryDistrictByCityCode(cityData.cityNo).then(storeData => {
                        _this.fields[2].items = storeData;
                        _.isEmpty(_this.fields[2].selectedItem) && (_this.fields[2].selectedItem = storeData[0]);
                        _this.tellParent();
                    });
                });
            },

            /**
             * [事件监听] 下钻
             * @param {Number} index
             * @param {Object} item
             * @return null
             */
            drillDown(index, item) {

                let _this = this,
                    drillDownIdx = index + 1;

                _this.fields[index].selectedItem = item;

                switch (drillDownIdx) {
                    case 1:

                        _this.queryCityByProvCode(item.mdmId).then(data => {

                            _this.fields[drillDownIdx].items = data;

                            !_this.checkHasItem(data, _this.fields[drillDownIdx].selectedItem) &&
                            (_this.fields[drillDownIdx].selectedItem = data[0]);

                            _this.switchNav(drillDownIdx);

                            return data[0];
                        }).then(data => {
                            _this.queryDistrictByCityCode(data.cityNo).then(data => {

                                _this.fields[drillDownIdx + 1].items = data;

                                !_this.checkHasItem(data, _this.fields[drillDownIdx + 1].selectedItem) &&
                                (_this.fields[drillDownIdx + 1].selectedItem = data[0]);
                            });
                        });
                        break;
                    case 2:
                        _this.queryDistrictByCityCode(item.cityNo).then(data => {

                            _this.fields[drillDownIdx].items = data;

                            !_this.checkHasItem(_this.fields[drillDownIdx].selectedItem) &&
                            (_this.fields[drillDownIdx].selectedItem = data[0]);

                            _this.switchNav(drillDownIdx);
                        });
                        break;
                    default:
                        _this.tellParent();
                        _this.cancelHandler();
                }
            },

            /**
             * 在指定的集合中查找某一项是否存在
             */
            checkHasItem(itemList, checkItem) {

                _.find(itemList, item => {

                    return checkItem === item;
                })
            },

            /**
             * [事件绑定]
             */
            clickInput() {
                this.active = !this.active;
            },
            /**
             * [事件绑定] 取消
             */
            cancelHandler() {

                this.active = false;
            },

            /**
             * [事件绑定] tab切
             */
            switchNav(index) {

                let _this = this,
                    currentField = _this.fields[index],
                    htmlStyle = getComputedStyle(document.getElementsByTagName("html")[0]) || {},
                    width = -index * parseFloat(htmlStyle["width"]);

                _this.selectedField = currentField.valueField;

                _this.translateStyle = {
                    "-webkit-transform": `translate(${width}px, 0px) translateZ(0px)`
                };
            },

            /**
             * 把自组建数据传到父组件
             */
            tellParent() {

                let _this = this;

                _this.$emit('listenChild', {
                    widgetType: _this.widgetType,
                    widgetName: _this.widgetName,
                    widgetId: _this.widgetId,
                    value: [
                        _this.fields[0].selectedItem,
                        _this.fields[1].selectedItem,
                        _this.fields[2].selectedItem
                    ]
                });
            },

            /**
             * 根据省code查询市
             * @param: {String} code
             * @return Promise
             */
            queryCityByProvCode(code) {

                return new Promise((resolve, reject) => {
                    Vue.http.jsonp(CONF.API.queryCityList, {
                        params: {
                            storeId: 10052,
                            provinceCode: code
                        }
                    }).then(data => {

                        if (data.body.cityList.length > 0) {

                            resolve(data.body.cityList);
                        } else {
                            reject(new Error(`${CONF.API.queryCityList}接口错误`));
                        }
                    }, data => {
                        reject(new Error(data));
                    });
                });
            },

            /**
             * 根据市code查询区
             * @param: {String} code
             * @return Promise
             */
            queryDistrictByCityCode(code) {

                return new Promise((resolve, reject) => {
                    Vue.http.jsonp(CONF.API.queryDistrictList, {
                        params: {
                            storeId: 10052,
                            cityID: code
                        }
                    }).then(data => {

                        if (data.body.districtList.length > 0) {

                            resolve(data.body.districtList);
                        } else {
                            reject(new Error(`${CONF.API.queryDistrictList}接口错误`));
                        }
                    }, data => {
                        reject(new Error(data));
                    });
                });
            }
        }
    }
</script>

<style scoped>
    .widget-top {
        height: 88px;
        line-height: 88px;
        color: #313131;
        border-bottom: 1px solid #DCDCDC;
        background: #fff;
    }
    .widget-left {
        width: 3.75rem;
        display: block;
        font-size: .6rem;
        padding-left: .5rem;
        float: left;
    }
    .widget-right {
        position: relative;
        overflow: hidden;

        input {
            border: 0;
            outline: none;
            height: 70px;
            line-height: 70px;
            color: #353d44;
            padding: .5rem 0;
            width: 100%;
            font-size: .6rem;
            display: block;
            margin-top: 8px;
        }

        >  span {
               display: block;
               width: 10px;
               height: 10px;
               background: #000;
               display: none;
           }

        .db-arrow {
            width: .28rem;
            height: .28rem;
            border: 1px solid #909090;
            transform: rotate(-135deg);
            border-right: 0;
            border-bottom: 0;
            display: inline-block;
            position: absolute;
            right: .5rem;
            top: 50%;
            margin-top: -.14rem;
            background: transparent;

            &.active {
                 transform: rotate(-315deg);
             }
        }
    }

    .widget-bottom {
        height: auto;
        background: #f2f2f2;
    }

    #store-chooser-wrapper {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        background: hsla(0, 0%, 0%, .5);
        z-index: 1;
    }

    .store-chooser {
        position: fixed;
        width: 100%;
        background-color: #f0f0f0;
        height: auto;
        bottom: 0;
        left: 0;
        z-index: 5;
    }

    .chooser-header {
        background-color: #FFF;
        border: 0;
        height: 1.76rem;
        line-height: 1.76rem;
        border-bottom: 1px solid #dcdcdc;

        .nav-title {
            width: 60%;
            margin: 0 auto;
            color: #333;
            text-align: center;
            word-break: break-all;
            white-space: nowrap;
            overflow: hidden;
        }

        .right-menu {
            position: absolute;
            top: -2.4rem;
            right: 0;

            &::after {
                content: '';
                display: block;
                width: 2rem;
                height: 2.8rem;
                background: url("../../assets/close-addr.png") center top no-repeat;
                background-size: 1rem 2.8rem;
            }

        }
    }
    .tab-nav {
        display: block;
        width: 100%;
        height: 1.76rem;
        line-height: 1.76rem;
        z-index: 1;

        li {
            width: 33.3333%;
            float: left;
            background-color: #fff;
            color: #353d44;
            font-size: .52rem;
            text-align: center;
            border-bottom: .12rem solid #fff;

            &.selected {
                border-bottom-color: #eda200;
                color: #f29400;
                font-size: .6rem;
            }

        }
    }
    .container {
        width: 100%;
        height: 11.5rem;

        .content {
            display: -webkit-box;
            width: 300%;
            height: 100%;
            transition: all .2s linear;
        }

        div.tab {
            -webkit-box-flex: 1;
            height: 100%;
            width: 100%;
            overflow: auto;
            overflow-x: hidden;
        }

        .scroll {
            width: 100%;
            height: auto;
        }

        li {
            height: auto;
            padding: .41rem .56rem;
            font-size: .6rem;
            border-bottom: 1px solid #dcdcdc;

            &.selected {
                background-color: #dcdcdc;
                color: #f29400;
            }
        }
    }
</style>
