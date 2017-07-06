<template>
    <div>
        <div class="widget-top">
            <div class="widget-left">{{widgetName}}</div>
            <div class="widget-right">
                <input type="text" readonly :placeholder="placeholder"
                       @click="clickInput"
                       :value="fields[2].selectedItem.storeName"/>
                <span class="db-arrow" :class="{active: active === '1'}"></span>
            </div>
        </div>
        <div class="widget-bottom" v-show="active">
            <div id="store-chooser-wrapper">
                <div class="store-chooser">
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

    let _ = require('lodash');

    export default {
        name: 'StoreWidget',
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
                selectedField: 'provinceCode',
                // 城市组件是否显示
                active: this.isActive === '1',
                // 省、市、店数据
                fields: [
                    {
                        valueField: 'provinceCode',
                        labelField: 'provinceName',
                        selectedItem: {},
                        items: []
                    },
                    {
                        valueField: 'cityCode',
                        labelField: 'cityName',
                        selectedItem: {},
                        items: []
                    },
                    {
                        valueField: 'storeCode',
                        labelField: 'storeName',
                        selectedItem: {},
                        items: []
                    }
                ],
                translateStyle: {
                    "-webkit-transform": "translate(0px, 0px) translateZ(0px)"
                }
            }
        },
        mounted () {

            let _this = this;

            _this.init();

        },
        methods: {

            /**
             *初始化
             */
            init() {
                let _this = this;

                // 先检查是否传入默认选中的选项
                if (typeof _this.initSelect !== 'undefined' && _this.initSelect.length > 0) {

                    _.forEach(_this.initSelect, (value, index, arr) => {

                        let valueField = _this.fields[index].valueField,
                            labelField = _this.fields[index].labelField;

                        if (!_.has(value, valueField) || !_.has(value, labelField)) {

                            console.info('初始化StoreWidget参数错误');
                        } else {
                            _this.fields[index].selectedItem = value;
                        }
                    })
                }

                // 查询省数据
                _this.queryProvData().then(data => {

                    // 更新省数据列表
                    _this.fields[0].items = data;
                    _.isEmpty(_this.fields[0].selectedItem) && (_this.fields[0].selectedItem = data[0]);

                    return data[0];

                    // 查询市数据
                }).then(data => {
                    return _this.queryCityData().then(cityData => {

                        // 更新市数据列表
                        _this.fields[1].items = cityData;
                        _.isEmpty(_this.fields[1].selectedItem) && (_this.fields[1].selectedItem = cityData[0]);

                        return cityData[0];
                    });

                    // 查询store数据
                }).then(data => {
                    _this.queryStoreData().then(storeData => {

                        // 更新store数据列表
                        _this.fields[2].items = storeData;
                        _.isEmpty(_this.fields[2].selectedItem) && (_this.fields[2].selectedItem = storeData[0]);
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

                        // 查询城市数据
                        _this.queryCityData().then((data) => {

                            _this.fields[drillDownIdx].items = data;
                            _this.fields[drillDownIdx].selectedItem = data[0];
                            _this.switchNav(drillDownIdx);

                            return data;
                        }).then(data => {

                            _this.queryStoreData().then(storeData => {

                                // 更新store数据列表
                                _this.fields[drillDownIdx + 1].items = storeData;
                                _this.fields[drillDownIdx + 1].selectedItem = storeData[0];
                            });
                        });
                        break;
                    case 2:
                        _this.queryStoreData().then((data) => {

                            _this.fields[drillDownIdx].items = data;
                            _this.switchNav(drillDownIdx);
                        });
                        break;
                    default:
                        _this.cancelHandler();

                        _this.$emit('listenChild', {
                            widgetType: _this.widgetType,
                            widgetName: _this.widgetName,
                            widgetId: _this.widgetId,
                            value: _this.fields[2].selectedItem
                        });
                }
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
             * [查询与活动关联的省的数据]
             * @param: {String}
             */
            queryProvData() {

                let reqSuccess = true;
                return new Promise((resolve, reject) => {
                    if (reqSuccess) {
                        setTimeout(() => {
                            resolve([
                                {provinceCode: '1', provinceName: '江苏'},
                                {provinceCode: '2', provinceName: '浙江'},
                                {provinceCode: '3', provinceName: '浙江'},
                                {provinceCode: '4', provinceName: '浙江'},
                                {provinceCode: '5', provinceName: '浙江'},
                                {provinceCode: '6', provinceName: '浙江'},
                                {provinceCode: '7', provinceName: '浙江'},
                                {provinceCode: '8', provinceName: '浙江'},
                                {provinceCode: '9', provinceName: '浙江'},
                                {provinceCode: '0', provinceName: '浙江'}
                            ]);
                        }, 10);
                    } else {
                        reject(new Error(data));
                    }
                })
            },

            /**
             * [查询市的数据]
             * @param: {String}
             */
            queryCityData() {

                let reqSuccess = true;
                return new Promise((resolve, reject) => {
                    if (reqSuccess) {
                        setTimeout(() => {
                            resolve([
                                {cityCode: '1', cityName: '南京'},
                                {cityCdoe: '2', cityName: '上海'},
                            ]);
                        }, 500);
                    } else {
                        reject(new Error(data));
                    }
                })
            },

            /**
             * [查询门店列表的数据]
             * @param: {String}
             */
            queryStoreData() {

                let reqSuccess = true;
                return new Promise((resolve, reject) => {
                    if (reqSuccess) {
                        setTimeout(() => {
                            resolve([
                                {storeCode: '1', storeName: '新街口'},
                                {storeCode: '2', storeName: '江东门'},
                            ]);
                        }, 500);
                    } else {
                        reject(new Error(data));
                    }
                })
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
        display: -webkit-box;
        width: 100%;
        height: 1.76rem;
        line-height: 1.76rem;
        z-index: 1;

        li {
            -webkit-box-flex: 1;
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
