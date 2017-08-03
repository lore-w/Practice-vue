<template>
    <div>
        <div class="widget-bottom" v-show="active">
            <div id="store-chooser-wrapper">
                <div class="store-chooser animated" :class="{slideInUp: active}">
                    <!--标题-->
                    <h1 class="chooser-header">
                        <div class="nav-title">选择城市</div>
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
    import CONF from '../../commons/conf';
    import listProvince from '../../commons/conf';

    import _ from 'lodash';

    // Promise 垫片
    require('core-js/fn/promise');

    // 省市关系映射表（省市数据从一个接口取得）
    let mapProvCity = {};

    export default {
        name: 'CityWidget',
        props: [
            'isActive', // 是否显示
            'initSelect' // 初始化省市
        ],
        data () {

            //视图模型
            return {
                selectedField: 'provinceCode',
                // 城市组件是否显示
                active: this.isActive,
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
                    }
                ],
                translateStyle: {
                    "-webkit-transform": "translate(0px, 0px) translateZ(0px)"
                }
            }
        },
        mounted () {
            this.init();
        },
        methods: {

            init() {
                let _this = this,
                    activityCode = _this.$route.params.actCode;

                // 先检查是否传入默认选中的选项
                if (typeof _this.initSelect !== 'undefined' && _this.initSelect.length > 0) {

                    _.forEach(_this.initSelect, (value, index, arr) => {

                        let valueField = _this.fields[index].valueField,
                            labelField = _this.fields[index].labelField;

                        if (!_.has(value, valueField) || !_.has(value, labelField)) {

                            console.warn('初始化StoreWidget默认选中参数错误或参数不全');
                        } else {
                            _this.fields[index].selectedItem = value;
                        }
                    });

                    _this.tellParent();
                }

                // 查询省市数据
                _this.queryProvinceCityData(activityCode).then(data => {

                    mapProvCity = data.mapProvCity;

                    // 更新省数据列表
                    _this.fields[0].items = data.listProv;
                    _.isEmpty(_this.fields[0].selectedItem) && (_this.fields[0].selectedItem = data.listProv[0]);

                    // 更新市数据列表
                    _this.fields[1].items = mapProvCity[_this.fields[0].selectedItem.provinceCode];
                    _.isEmpty(_this.fields[1].selectedItem) && (_this.fields[1].selectedItem = _this.fields[1].items[0]);
                })
            },


            /**
             * [事件监听] 下钻
             * @param {Number} index
             * @param {Object} item
             * @return null
             */
            drillDown(index, item) {

                let _this = this,
                    drillDownIdx = index + 1,
                    activityCode = _this.$route.params.actCode;

                _this.fields[index].selectedItem = item;

                switch (drillDownIdx) {
                    case 1:

                        // 更新市数据列表
                        _this.fields[1].items = mapProvCity[_this.fields[0].selectedItem.provinceCode];
                        _.isEmpty(_this.fields[1].selectedItem) && (_this.fields[1].selectedItem = _this.fields[1].items[0]);
                        _this.switchNav(drillDownIdx);

                        break;
                    default:
                        _this.tellParent();
                        _this.cancelHandler();
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

            updateActive () {

                this.active = true;
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
                    value: _this.fields[1].selectedItem
                });
            },

            /**
             * [查询与活动关联的省市的数据]
             * @param: {String} activityCode 活动Code
             * @return Promise
             */
            queryProvinceCityData(activityCode) {

                let url = CONF.API.queryProvinceCityList;

                url = url
                    .replace('{{activityCode}}', activityCode)
                    .replace('{{callback}}', 'queryProvinceCityCallback');

                return new Promise((resolve, reject) => {
                    Vue.http.jsonp(url, {

                        jsonpCallback: 'queryProvinceCityCallback'
                    }).then(data => {
                        if (data.body.code === '0') {

                            let d = data.body.data,
                                listProv = [],
                                mapProvCity = {};

                            _.forEach(d, (item, index, arr) => {

                                listProv.push({
                                    provinceCode: 'id_' + index,
                                    provinceName: item.provinceName
                                });

                                mapProvCity['id_' + index] = item.signUpCityInfos;
                            });
                            resolve({mapProvCity, listProv});
                        } else {
                            reject(new Error(`${url}接口错误`));
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
            width: 50%;
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
            width: 200%;
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
