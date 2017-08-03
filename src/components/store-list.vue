<template>
    <div id="store-list">
        <template v-if="err">
            <div class="err-tips">暂未获取到您所在城市参与此活动的门店信息</div>
            <span class="select-city" @click="selectCity">请选择城市</span>
        </template>
        <template v-else="err">
            <h2 class="store-header">
                <span class="geo-icon"></span>
                <span class="store-name" @click="selectCity" :class="{active: isActive}">{{cityName}}</span>
                <i>以下门店均可参与此活动</i>
            </h2>
            <ul class="srore-list-wrapper">
                <li v-for="item in storeList">
                    <div class="store-list-left"></div>
                    <div class="store-list-right">
                        <h3>{{item.storeName}}</h3>
                        <p>{{item.address}}</p>
                    </div>
                </li>
            </ul>
        </template>
        <cityWidget
            ref="childCity"
            @listenChild="receiveChildData"
            :isActive="isActive"/>
    </div>
</template>

<script>

    // 导入widget
    import inputWidget from '@/components/commons/Input';
    import cityWidget from '@/components/commons/City';

    import Server from '../services/enroll';

    let lng,
        lat;


    export default {
        name: 'Detail',
        data () {
            return {
                err: false,
                isActive: false,
                cityName: "",
                cityCode: "",
                storeList: []
            }
        },
        components: {
            inputWidget,
            cityWidget
        },
        // 生命周期钩子
        mounted () {

        },
        beforeRouteEnter(to, from, next) {

            let _this,
                urlParams = to.params;

            // 定位当前城市
            $.loadMod('//res.suning.cn/public/v5/mod/geo/2.0.0/geo.js').done(function () {
                Wap.Geo(meta => {

                    let cityId = meta.cityNo,
                        cityName = meta.cityName;

                    lat = meta.location.lat || meta.location.lati;
                    lng = meta.location.lng || meta.location.longi;

                    Server.queryStoreData(urlParams.actCode, cityId, lng, lat).then(data => {

                        next(vm => {
                            vm.cityName = cityName;
                            vm.storeList = data;

                        });
                    });

                })
            })
        },
        watch: {
            'cityCode': function (val, oldVal) {

                if (!val) {

                    return;
                }

                let _this = this;

                Server.queryStoreData(_this.$route.params.actCode, val, lng, lat).then(data => {

                    _this.storeList = data;
                });
            }
        },
        methods: {

            // 接收父组件传回的数据
            receiveChildData (childData) {

                console.log('childData', childData);

                this.cityCode = childData.value.cityId;
                this.cityName = childData.value.cityName;
            },

            selectCity () {

                this.$refs.childCity.updateActive();
            }
        }
    }
</script>

<style scoped>

    .err-tips {
        width: 100%;
        height: 9.6rem;
        margin-top: 4.6rem;
        padding-top: 8rem;
        color: #999;
        font-size: .6rem;
        text-align: center;
        background: url("//res.m.suning.com/common/images/ico-empty.png") center center no-repeat;
        background-size: 4.7rem 5.44rem;
    }

    .select-city {
        height: 1.2rem;
        line-height: 1.2rem;
        text-align: center;
        border: 1px solid #999;
        color: #444;
        font-size: .52rem;
        margin: .5rem auto 0;
        box-sizing: border-box;
        overflow: hidden;
        white-space: nowrap;
        position: relative;
        display: block;
        max-width: 4.5rem;
    }

    #store-list {
        padding: 0 .56rem;
    }
    .store-header {
        box-sizing: border-box;
        line-height: 1.76rem;
        overflow: hidden;
        white-space: nowrap;
        font-size: .6rem;
        color: #313131;
        position: relative;
        text-indent: 1.12rem;

        > span.store-name {

            position: relative;
            padding-right: .7rem;

            &:after {
                width: .28rem;
                height: .28rem;
                border: 1px solid #909090;
                -webkit-transform: rotate(-135deg);
                transform: rotate(-135deg);
                border-right: 0;
                border-bottom: 0;
                display: inline-block;
                top: 50%;
                background: transparent;
                content: '';
                position: absolute;
                margin-top: -.18rem;
                right: .1rem;
            }
        }

        .geo-icon {
            height: 100%;
            position: absolute;
            top: 0;
            right: 13.2rem;
            bottom: 0;
            left: 0;
            z-index: 1;

            &:before {
                content: '';
                display: block;
                border-left: 1px solid #dbdbdd;
                width: 1px;
                height: 50%;
                position: absolute;
                bottom: 0;
                left: 50%;
            }

            &:after {
                 width: .6rem;
                 height: .78rem;
                 background: url("../assets/ico-address.png") no-repeat;
                 background-size: .6rem .78rem;
                 right: .6rem;
                 content: '';
                 display: block;
                 position: absolute;
                 left: 50%;
                 margin-left: -.25rem;
                 top: 50%;
                 margin-top: -.52rem;
             }

         }

        > i {
              color: #f29400;
              font-size: .48rem;
          }
    }
    .srore-list-wrapper {

        li {
            height: auto;
            overflow: hidden;
            position: relative;

            h3 {
                font-size: .6rem;
                line-height: .85rem;
                font-weight: 700;
            }
            p {
                font-size: .52rem;
                line-height: .7rem;
                max-height: 1.4rem;
                overflow: hidden;
                color: #909090;
            }
        }

        .store-list-left {
            height: 100%;
            position: absolute;
            top: 0;
            right: 13.2rem;
            bottom: 0;
            left: 0;
            z-index: 1;

            &:before {
                content: '';
                display: block;
                border-left: 1px solid #dbdbdd;
                width: 1px;
                height: 100%;
                position: absolute;
                top: 0;
                left: 50%;
            }

            &:after {
                content: '';
                display: block;
                border-radius: 50%;
                width: .4rem;
                height: .4rem;
                box-sizing: border-box;
                border: .12rem solid #EEB63C;
                background: #ffffff;
                position: absolute;
                top: 38%;
                left: 50%;
                margin-left: -.18rem;
            }

        }
        .store-list-right {
            background: #ffffff;
            padding: .48rem;
            margin-bottom: .5rem;
            display: block;
            overflow: hidden;
            position: relative;
            border-left: 1.12rem solid #f2f2f2;
            box-sizing: border-box;
        }
    }
</style>
