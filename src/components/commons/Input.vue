<template>
    <div class="widget-top">
        <div class="widget-left">{{widgetName}}</div>
        <div class="widget-right">
            <!--v-model不支持动态的type类型-->
            <input v-if="type === 'tel'" id="tel" type="tel"
                   :maxlength="maxlength"
                   :placeholder="placeholder" v-model="inputVal" @input="listenBlur">

            <input v-if="type === 'text'" id="text" type="text"
                   :maxlength="maxlength"
                   :placeholder="placeholder" v-model="inputVal" @input="listenBlur">

            <span>清空</span>
        </div>
    </div>
</template>

<script>

    export default {
        name: 'InputWidget',
        props: [
            'widgetId',
            'widgetType',
            'widgetName', //控件名称
            'maxlength',
            'type', //类型（可选值 tel | text）
            'placeholder',
            'initVal'
        ],
        data (){

            return {
                inputVal: this.initVal
            }
        },
        mounted () {

        },
        methods: {
            listenBlur () {

                this.tellParent();
            },
            receivedParentUpdate (val) {

                this.inputVal = val;
            },
            tellParent() {
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
        height: 100%;
    }
    .widget-right {
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

        >  span {
            display: block;
            width: 10px;
            height: 10px;
            background: #000;
            display: none;
        }
    }
</style>
