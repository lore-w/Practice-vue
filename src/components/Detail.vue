<template>
    <div id="detail">
        <!--轮播图-->
        <banner v-bind:activityPics="activityPics" v-bind:cur="curIndex"></banner>
        <!--标题-->
        <h2 class="title">{{activityName}}</h2>
        <!--活动介绍-->
        <div class="introduce">
            <p>{{activityIntro}}</p>
        </div>
        <!--活动信息（时间、地点等）-->
        <div class="act-wrapper">
            <ul>
                <li><span>时间</span>{{startTime}} - {{endTime}}</li>
                <li><span>地点</span>{{activityLocation}}</li>
            </ul>
        </div>
        <!--补充（是否支持V购预约）-->
        <div class="v" v-if="vVal">
            <h3>本活动支持”苏宁V购”服务</h3>
            <p>{{vVal}}</p>
        </div>
        <!--报名按钮-->
        <span class="new-zhaoji-btn">{{btnVal}}</span>
    </div>
</template>

<script>

    // 导入组件
    import banner from '@/components/commons/banner';

    export default {
        name: 'Detail',
        data () {
            return {
                'activityPics': [
                    "http://uimgpre.cnsuning.com/uimg/moss/activeImg/149663512568453334.png",
                    "http://uimgpre.cnsuning.com/uimg/moss/activeImg/149663512568453334.png"
                ], // 轮播图图片列表
                'curIndex': '0',  //默认第一个小圆点高亮
                'activityName': '11',
                'activityIntro': '通讯促销活动关联V购通讯促销活动关联V购通讯促销活动关联V购通讯促销活动关联V购',
                'startTime': 'startTime',
                'endTime': 'endTime',
                'activityLocation': 'activityLocation',
                'vVal': '免费定制家电套餐，尊享一对一全程导购服务',
                'btnVal': '立即报名' //可选值 立即报名 | 报名已结束 | 报名未开始 | 报名人数已满
            }
        },
        components: {banner},
        // 生命周期钩子
        mounted () {

        }
    }
</script>

<style scoped>
    #detail {
        width: 100%;
        height: 100%;
    }

    .title {
        line-height: 2rem;
        height: 2rem;
        font-size: .8rem;
        text-align: center;
        font-weight: bold;
        background: #fff url("../assets/bg-title.png") no-repeat center bottom;
        background-size: 8.2rem .12rem;
    }

    .introduce, .act-wrapper {
        background: url("../assets/new-zhao-bg_01.png") no-repeat center bottom;
        background-size: 15rem .6rem;
        padding: .4rem .56rem .76rem;
        font-size: .56rem;
        color: #666;
    }

    .act-wrapper {

        ul {
            height: auto;
            overflow: hidden;
        }

        li {

            &:nth-of-type(1) {
                background: url("../assets/new-zhao-bg_02.png") no-repeat left .2rem;
                background-size: .44rem;
                padding-left: .7rem;
                display: inline-block;
                line-height: 1rem;
                width: 100%;
            }

            &:nth-of-type(2) {
                background: url("../assets/new-zhao-bg_03.png") no-repeat left .2rem;
                background-size: .42rem .48rem;
                padding-left: .7rem;
                display: inline-block;
                line-height: 1rem;
                width: 100%;
            }
        }
    }


    .v {
        width: 14.04rem;
        height: 2.92rem;
        background: url("../assets/new-zhao-bg_04.png") no-repeat center;
        background-size: 14.04rem 2.92rem;
        text-align: center;
        margin: .48rem auto 0;
        padding: .48rem 1rem 0;

        h3 {
            color: #666;
            font-size: .56rem;

            &:before {
                content: "";
                display: inline-block;
                width: .48rem;
                height: .48rem;
                background: url("../assets/new-zhao-bg_06.png") no-repeat center top;
                background-size: .48rem;
                padding-right: .2rem;
            }

        }
        p {
            color: #999;
            font-size: .44rem;
        }
    }

    .new-zhaoji-btn {
        width: 100%;
        height: 1.98rem;
        background: url("../assets/new-zhao-bg_05.png") center no-repeat;
        background-size: 100%;
        font-size: .68rem;
        color: #FFF;
        line-height: 1.98rem;
        font-weight: 700;
        text-align: center;
        position: fixed;
        left: 0;
        bottom: 0;

        &.new-zhao-end {
            background: url("../assets/btn-gray-new.png") center no-repeat;
        }
    }
</style>
