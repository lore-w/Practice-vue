<template>
    <div class="widget-top">
        <div class="widget-left">{{widgetName}}</div>
        <div class="widget-right">
            <input id="code"
                   :data-uuid="uuid"
                   :maxlength="maxlength"
                   v-model="inputVal" @input="listenBlur"
                   placeholder="请输入验证码" type="text">
            <span>清空</span>
            <div><img :src="imageCode"></div>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'ImageCodeWidget',
        props: [
            'widgetId',
            'widgetType',
            'widgetName', //控件名称
            'maxlength',
            'uuid', //图形验证码uuid
            'imageCode', //图形验证码url
            'initVal'
        ],
        data () {

            return {
                inputVal: this.initVal
            }
        },
        methods: {
            listenBlur () {
                this.$emit('listenChild', {
                    widgetId: this.widgetId,
                    widgetType: this.widgetType,
                    widgetName: this.widgetName,
                    value: this.inputVal
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
        overflow: hidden;
        display: -webkit-box;

        input#code {
            border: 0;
            height: 70px;
            line-height: 70px;
            color: #353d44;
            padding: .5rem 0;
            font-size: .6rem;
            -webkit-box-flex: 1;
        }

        >  div {
               border-left: 1px solid #DCDCDC;
               margin-left: .5rem;
               text-align: center;
               position: relative;
               -webkit-box-flex: 1;
           }

           span {
               display: none;
               text-indent: -10000px;
           }
           img {
               width: 2.2rem;
               height: .8rem;
               position: absolute;
               top: 50%;
               margin-top: -0.4rem;
               left: 50%;
               margin-left: -1.1rem;
           }
    }
</style>
