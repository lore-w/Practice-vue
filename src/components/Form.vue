<template>
    <div id="enroll">
        <ul class="enroll-wrapper">
            <!--手机号-->
            <li class="tel">
                <inputWidget
                    widgetName="手机号码"
                    widgetId="tel"
                    maxlength="11"
                    type="tel"
                    @listenChild="receiveChildData"
                    placeholder="请输入手机号码"/>
            </li>
            <!--图形验证码-->
            <li v-if="imageCode" class="img-code">
                <imageCodeWidget
                    widgetName="验证码"
                    :uuid="imageCode.uuid"
                    :imageCode="imageCode.imgUrl"
                    maxlength="4"
                    placeholder="请输入验证码"/>
            </li>
            <!--限制条件部分（既根据服务返回的字段决定需要填写的字段）-->
            <!--0是单选框、1是多选框、2是文字输入框、3是数字输入框、4是时间控件、5是地址控件、6是详细地址控件、7是城市门店类型-->
            <li v-for="(item, index) in limitField">
                <template v-if="item.fieldType === '0'">
                    <selectWidget
                        widgetType="0"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        :options="item.options"
                        isActive="0"
                        selectType="0"
                        @listenChild="receiveChildData"
                        placeholder="请选择" />
                </template>
                <template v-else-if="item.fieldType === '1'">
                    <selectWidget
                        widgetType="1"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        :options="item.options"
                        isActive="0"
                        selectType="1"
                        @listenChild="receiveChildData"
                        placeholder="请选择"
                        />
                </template>
                <template v-else-if="item.fieldType === '2'">
                    <inputWidget
                        widgetType="2"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        maxlength="40"
                        type="text"
                        @listenChild="receiveChildData"
                        placeholder="请输入文本"/>
                </template>
                <template v-else-if="item.fieldType === '3'">
                    <inputWidget
                        widgetType="3"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        maxlength="30"
                        type="tel"
                        @listenChild="receiveChildData"
                        placeholder="请输入数字"/>
                </template>
                <template v-else-if="item.fieldType === '4'">
                    <datechooserWidget
                        widgetType="4"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        @listenChild="receiveChildData"
                        :display="item.display"
                        :beginDate="item.beginDate"
                        :endDate="item.endDate"
                        :defaultDate="item.defaultDate"
                        placeholder="请选择"
                        isActive="0"/>
                </template>
                <template v-else-if="item.fieldType === '5'">5</template>
                <template v-else-if="item.fieldType === '6'">6</template>
                <template v-else-if="item.fieldType === '7'">

                    <storeSelectWidget
                        widgetType="7"
                        :widgetId="item.fieldId"
                        :widgetName="item.filedName"
                        @listenChild="receiveChildData"
                        placeholder="请选择"
                        isActive="0"/>
                </template>
            </li>
        </ul>

    </div>
</template>

<script>

    // 导入widget
    import inputWidget from '@/components/widget/Input';
    import selectWidget from '@/components/widget/Select';
    import imageCodeWidget from '@/components/widget/ImageCode';
    import storeSelectWidget from '@/components/widget/Store';
    import datechooserWidget from '@/components/widget/Datechooser';

    let _ = require('lodash');

    export default {
        name: 'Form',
        data () {
            return {
                //存储需要提交的信息
                'limitContent': {},
                'imageCode': {
                    uuid: 1234,
                    imgUrl: 'http://uimgpre.cnsuning.com/uimg/moss/activeImg/149663512568453334.png'
                },
                //该字段有服务返回，用于渲染用户需要输入哪些字段（不一定必填）
                'limitField': [
                    {
                        fieldId: '4',
                        fieldType: '2',
                        filedName: '文本输入'
                    },
                    {
                        fieldId: '5',
                        fieldType: '3',
                        filedName: '数字输入'
                    },
                    {
                        fieldId: '0',
                        fieldType: '0',
                        filedName: '单选框A',
                        options: [
                            {
                                value: 'A',
                                isActive: '0'
                            },
                            {
                                value: 'B',
                                isActive: '0'
                            }
                        ]
                    },
                    {
                        fieldId: '1',
                        fieldType: '0',
                        filedName: '单选框1',
                        options: [
                            {
                                value: '1',
                                isActive: '0'
                            },
                            {
                                value: '2',
                                isActive: '1'
                            }
                        ]
                    },
                    {
                        fieldId: '3',
                        fieldType: '1',
                        filedName: '多选框1',
                        options: [
                            {
                                value: '1',
                                isActive: '1'
                            },
                            {
                                value: '2',
                                isActive: '1'
                            }
                        ]
                    },
                    {
                        fieldId: '7',
                        fieldType: '7',
                        filedName: '活动门店',
                        initData: []
                    },
                    {
                        fieldId: '4',
                        fieldType: '4',
                        filedName: '时间',
                        display: true,
                        defaultDate: new Date(2017, 4, 3),
                        beginDate: new Date(2011, 4, 3),
                        endDate: new Date(2020, 4, 3)
                    }
                ]
            }
        },
        components: {
            inputWidget,
            selectWidget,
            imageCodeWidget,
            storeSelectWidget,
            datechooserWidget
        },
        // 生命周期钩子
        mounted () {

            let _this = this;

            setTimeout(function () {

                _this.limitField[6].chooserDisplay = true;
            }, 100);

        },
        methods: {

            receiveChildData (childData) {

                console.log(childData);
                this.limitContent['formItem' + childData.widgetId] = childData;
                console.log(this.limitContent);
            }
        }
    }
</script>

<style scoped>
    html, body {
        background: #f2f2f2;
    }
    #enroll {
        width: 100%;
        height: 100%;
    }

    .enroll-wrapper {
        height: auto;

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
    }
</style>
