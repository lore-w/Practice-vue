<template>
    <div>
        <div class="widget-top">
            <div class="widget-left">{{widgetName}}</div>
            <div class="widget-right">
                <input type="text" readonly
                       :placeholder="placeholder"
                       :value="selectValue"
                       @click="clickInput"/>
                <span class="db-arrow" :class="{active: active}"></span>
            </div>
        </div>
        <div class="widget-bottom" v-show="active">
            <ul>
                <li v-for="(opts, index) in options"
                    @click="selectOpt"
                    :class="{multiple: selectType == 1, active: opts.isActive === '1'}">{{opts.value}}</li>
            </ul>
        </div>
    </div>
</template>

<script>

    let _ = require('lodash');

    export default {
        name: 'SelectWidget',
        props: [
            // 控件类型 0是单选框、1是多选框、2是文字输入框、3是数字输入框、4是时间控件、5是地址控件、6是详细地址控件、7是城市门店类型
            'widgetType',
            'widgetId',
            'widgetName', // 控件名称
            'options', // 待选项
            'isActive', // 是否展开下拉列表（0 折叠、1展开）
            'selectType', // 单选还是多选（0 单选、1多选）
            'placeholder'
        ],
        data() {
            return {
                active: this.isActive === '1',
                selectText: []
            }
        },
        computed: {
            selectValue: function () {

                let selectArr = [];

                _.forEach(this.options, (value, index, arr) => {

                    if (value.isActive === '1') {

                        selectArr.push(value.value);
                    }
                });

                return selectArr.join(' ');
            }
        },
        methods: {
            clickInput() {
                this.active = !this.active;
            },
            selectOpt(e) {

                let selectText = e.target.innerText,
                    opts = this.options, // **opts是引用类型，修改会改变父作用域的值**
                    _this = this;

                let newOpts = _.forEach(opts, (value, index, arr) => {

                    let isActive = arr[index].isActive === '1';

                    if (_this.selectType === '1') {
                        //多选
                        if (value.value === selectText) {
                            arr[index].isActive = isActive ? '0' : '1';
                        }
                    } else {
                        //单选
                        if (value.value === selectText) {
                            arr[index].isActive = isActive ? '0' : '1';
                        } else {
                            arr[index].isActive = '0';
                        }
                    }
                    _this.selectText.push(selectText);
                });


                this.$emit('listenChild', {
                    widgetType: this.widgetType,
                    widgetName: this.widgetName,
                    widgetId: this.widgetId,
                    value: newOpts
                });
            }
        },
        mounted() {

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

        ul {
            padding: 0 .5rem;
            font-size: .6rem;
        }

        li {
            height: 88px;
            line-height: 88px;
            position: relative;
            border-bottom: 1px solid #DCDCDC;

            &:after {
                position: absolute;
                top: 50%;
                margin-top: -18px;
                right: 0;
                content: '';
                display: block;
                width: 36px;
                border: 1px solid #dcdcdc;
                height: 36px;
            }

            &.active {
                color: #ffc001;

                &:after {
                    background-color: #ffc001;
                    background-image: url("data:image/png;charset=utf-8;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAARBAMAAAA4SAFEAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAAkUExURQAAAP///////////////////////////////////////////7QJjekAAAAMdFJOUwD+jrvwDD1UbCga4AzsdzgAAAB8SURBVBjTY2BABpwKKFyGEnEULpOgKTKX1VCCgYE9AM6fLZLAwKAIV8LuaAUkVwvD+IpCIKWcjlA7Fgs2gOkUITDFtnEbRJwNIt4ovACqrxDkiCBBuNM4BBMYuAzdEe5QdGNIkZ6A5EyRGagONXQUQvFHsEgBCp9VE84EABN5EA+ig9/6AAAAAElFTkSuQmCC");
                    background-repeat: no-repeat;
                    background-position: 50% 50%;
                    background-size: 100%;
                     border: 1px solid #ffc001;
                }
            }

            &:nth-last-of-type(1) {

                border-bottom: none;
            }

        }
    }
</style>
