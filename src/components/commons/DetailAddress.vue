<template>
    <div>
        <addressWidget
            widgetType="5"
            :widgetId="widgetId"
            @listenChild="receiveChildData"
            :widgetName="widgetName"
            :placeholder="placeholder"/>

        <inputWidget
            widgetType="2"
            :widgetId="widgetId"
            widgetName=""
            maxlength="50"
            type="text"
            @listenChild="receiveChildData"
            :placeholder="placeholder"/>
    </div>
</template>

<script>

    // 导入widget
    import addressWidget from '@/components/commons/Address';
    import inputWidget from '@/components/commons/Input';

    export default {
        name: 'DetailAddress',
        props: [
            'widgetType',
            'widgetId',
            'widgetName', // 控件名称
            'initSelect',
            'placeholder'
        ],
        data () {
            return {}
        },
        components: {
            addressWidget,
            inputWidget
        },
        methods: {

            receiveChildData (childData) {

                childData.widgetType = '5';

                this.$emit('listenChild', childData);
            },
        },
        // 生命周期钩子
        mounted (){

        },
    }
</script>

<style scoped>

</style>
