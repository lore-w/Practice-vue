<template>
    <!--轮播图-->
    <div class="banner index-slide lazyimg" id="D_index_slide">
        <ul class="banner-slide">
            <li v-for="item in activityPics">
                <a href="javascript:void(0)">
                    <img :data-src="item.picUrl" alt="">
                </a>
            </li>
        </ul>
        <!--轮播图小圆点-->
        <div class="img-show-pagation">
            <ul class="index-slide-trigger nav-slide-trigger trigger">
                <li :class="{cur: index === currentIndex}" v-for="(item, index) in activityPics"></li>
            </ul>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Detail',
        props: ['activityPics', 'cur'],
        data () {

            return {
                'currentIndex': this.cur, //当前激活的图片
            }
        },
        // 生命周期钩子
        mounted () {

            setTimeout(() => {

                $(".lazyimg").lazyload();
            }, 800);

            let _this = this;

            $.loadMod(MOD_URL.swipe).done(() => {

                Swipe(document.getElementById("D_index_slide"), {
                    startSlide: 0,
                    auto: false,
                    continuous: false,
                    disableScroll: false,
                    stopPropagation: true,
                    callback: function (index, elem) {

                        _this.currentIndex = index;
                    }
                });
            });
        }
    }
</script>

<style scoped>

    .index-slide {
        position: relative;
        width: 100%;
        height: 450px;
        margin: 0 auto;
        overflow: hidden;

        ul.banner-slide {
            margin: 0 auto;
            overflow: hidden;
            height: 100%;
        }

        li {
            position: relative;
            float: left;
            width: 100%;
            height: 100%;
        }

        img {
            width: 100%;
            height: 100%;
        }
    }

    .img-show-pagation {
        position: absolute;
        left: 0;
        bottom: .3rem;
        display: block;
        width: 100%;
        text-align: center;
        z-index: 100;

        ul {
            display: inline-block;
        }

        li {
            display: inline-block;
            margin: 0 .25rem;
            width: .32rem;
            height: .32rem;
            border-radius: 50%;
            background-color: #fff;

            &.cur {
                background-color: #f60;
            }

        }
    }
</style>
