<template>
    <div>
        <div class="widget-top">
            <div class="widget-left">{{widgetName}}</div>
            <div class="widget-right">
                <input type="text" readonly :placeholder="placeholder" @click="clickInput" :value="selectTime()"/>
                <span class="db-arrow" :class="{active: active}"></span>
            </div>
        </div>
        <div class="widget-bottom animated" v-show="active">
            <div class="datechooser"
                 @touchmove.prevent="moveHandler"
                 @touchend.prevent="endHandler" >
                <div transition="chooser" class="chooser-transition animated" :class="{slideInUp: active}">
                    <h1>
                        <a @touchstart="cancelHandler">取消</a>
                        <b></b>
                        <a :class="{disable: !commitable}" @touchstart="commitHandler">确定</a>
                    </h1>
                    <div class="container">
                        <div class="vs">
                            <!--在Vue2.0中-->
                            <!-- class="{{item | classParser n}}" 报错 Interpolation inside attributes has been removed-->
                            <!--需要v-bind绑定属性-->
                            <ul :style="{marginTop: nTop + 'rem'}">
                                <li v-for="item in n"
                                    v-text="item.value + '年'" :class="item.className"></li>
                            </ul>
                            <ul :style="{marginTop: monthsTop + 'rem'}">
                                <li v-for="item in months"
                                    v-text="item.value + 1 + '月'" :class="item.className"></li>
                            </ul>
                            <ul :style="{marginTop: datesTop + 'rem'}">
                                <li v-for="item in dates"
                                    v-text="item.value + '日'" :class="item.className"></li>
                            </ul>
                        </div>
                        <div class="linear"></div>
                        <div class="ops">
                            <!--年-->
                            <ul name="n"
                                @touchstart.prevent="startHandler">
                                <li class="re3"></li>
                                <li class="re2"></li>
                                <li class="re1"></li>
                                <li class="current"></li>
                                <li class="nxt1"></li>
                                <li class="nxt2"></li>
                                <li class="nxt3"></li>
                            </ul>
                            <!--月-->
                            <ul name="months"
                                @touchstart.prevent="startHandler">
                                <li class="re3"></li>
                                <li class="re2"></li>
                                <li class="re1"></li>
                                <li class="current"></li>
                                <li class="nxt1"></li>
                                <li class="nxt2"></li>
                                <li class="nxt3"></li>
                            </ul>
                            <!--日-->
                            <ul name="dates"
                                @touchstart.prevent="startHandler">
                                <li class="re3"></li>
                                <li class="re2"></li>
                                <li class="re1"></li>
                                <li class="current"></li>
                                <li class="nxt1"></li>
                                <li class="nxt2"></li>
                                <li class="nxt3"></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>

    import _ from 'lodash';

    // li的高度从上到下分别是 1、1.15、1.3、1.75、1.3、1.15、1
    // 因此基线位置是1 + 1.15 + 1.3 = 3.45
    const
        STEP_SIZE = 1,    // 正常li的高度（rem）即不是re1、re2、current、nxt2、nxt1的li
        ZERO_POS = 3.45,    // 基线位置，控件中部的选中区域
        STEP_MAPPING = {
            "re3": -3,
            "re2": -2,
            "re1": -1,
            "current": 0,
            "nxt1": 1,
            "nxt2": 2,
            "nxt3": 3
        };

    export default {
        data() {
            // 视图模型
            return {
                n: [], // 年数据列表
                months: [], // 月数据列表
                dates: [], // 天数据列表
                nTop: 0,
                monthsTop: 0,
                datesTop: 0,
                startPos: 0, // 开始滑动时滑块的位置（还未拖动）
                commitable: true, // 是否可确定
                targetName: null, // 当前拖动的区块（年 | 月 | 天）
                touching: false, // 是否可拖动
                active: this.display,
                selectedDate:  this.defaultDate // 默认选中的时间
            };
        },
        props: {
            widgetType: {
                type: String
            },
            widgetId: {
                type: String
            },
            widgetName: {
                type: String
            },
            display: {
                type: Boolean,
                default: false
            },
            placeholder: {
                type: String
            },
            // 开始日期
            beginDate: {
                type: Date,
                default: () => new Date(1950, 0, 1)
            },
            // 结束日期
            endDate: {
                type: Date,
                default: () => new Date(2020, 11, 31)
            },
            // 选中日期
            defaultDate: {
                type: Date,
                default: () => new Date()
            },
            // 选择完成回调
            complete: {
                type: Function,
                default: date => console.log(date)
            },
            // 不包含的周日期 [0-6]
            excludeDays: {
                type: Array,
                default: () => []
            },
            // 不包含的月日期 ex: 5/1, 10/1
            excludeDates: {
                type: Array,
                default: () => []
            }
        },
        computed: {

            /*
             * 这里的计算属性不会更新
             * 猜测可能是selectedDate是通过setDate、setMonth、setYear更新的
             * 没有触发setter函数
             * 改用method实现
             */
            /*selectTime: function () {

                let selectedDate = this.selectedDate;

                return this.selectedDate.getFullYear() + '-' + (this.selectedDate.getMonth() + 1) + '-' + this.selectedDate.getDate();

            }*/
        },
        methods: {

            selectTime() {

                return this.selectedDate.getFullYear() + '-' + (this.selectedDate.getMonth() + 1) + '-' + this.selectedDate.getDate();
            },

            /**
             * px -> rem 单位转换
             * @param px
             * @returns {number}
             */
            convertPx2Rem(px) {

                return px / this.BASE_SIZE;
            },

            /**
             * 渲染引擎兼容方法
             * @param callback
             */
            renderer(callback) {

                if (!requestAnimationFrame) {

                    setTimeout(callback, (1000 / 60).toFixed(2)); // 属性频率60帧/s
                } else {

                    requestAnimationFrame(callback);
                }
            },


            /**
             * 获取当前月份的天数
             * @param ｛Date｝ date
             * @returns {number} 28/29/30/31
             */
            daysInMonth(date) {

                let d0 = new Date(date.getFullYear(), date.getMonth(), 1),
                    d1 = new Date(d0.getFullYear(), d0.getMonth()+1, 1);

                return (d1.getTime() - d0.getTime()) / 1000 / 60 / 60 / 24;
            },

            /**
             * 当前位置索引需要补偿差值 （元素中存在大小渐进，计算过程中以 STEP_SIZE 作为基准会有偏差值出现）
             * li的高度从上到下分别是 1、1.15、1.3、1.75、1.3、1.15、1
             * @param index
             * @returns {number}
             */
            currentFixed(index) {

                let fixed = 0.3 + 0.15;
                switch(index) {
                    case 0:
                        fixed = 0;
                        break;
                    case 1:
                        fixed = 0.3;
                        break;
                }
                return fixed;
            },

            /**
             * 直接定位到指定的索引位置
             * @param {String} tName 可选值 t | m | d
             * @param {Number} index
             */
            updatePosition(tName, index) {

                //STEP_SIZE 每个li的高度
                let targetPos = -STEP_SIZE * index - this.currentFixed(index) + ZERO_POS;

                targetPos = parseFloat(targetPos.toFixed(2));
                this[tName + "Top"] = targetPos;
            },


            /**
             * 给每个li添加位置class(re2 | re1 | current | nxt1 | nxt2)
             * @param {String} type n | months | dates
             */
            addClassName(type) {

                let selectedIdx = this.currentIndex(type),
                    val;

                _.map(this[type], (item, idx) => {

                    val = selectedIdx - idx;

                    switch (val) {
                        case 2:
                            item.className = "re2";
                            break;
                        case 1:
                            item.className = "re1";
                            break;
                        case 0:
                            item.className = "current";
                            break;
                        case -1:
                            item.className = "nxt1";
                            break;
                        case -2:
                            item.className = "nxt2";
                            break;
                        default:
                            item.className = ''
                    }
                });
            },

            /**
             * 当前滑块所处的位置索引(即第几个li标签处在选中区域)
             * @param {String} type 可选值 n | months | dates
             * @returns {number|Number|*}
             */
            currentIndex(type) {

                // 查找选中的值
                let selectedItem = _.find(this[type], arg => arg.selected),
                    index = _.indexOf(this[type], selectedItem);

                // 修复拨到beginYear，月份（不是从1月开始的月份）错位问题
                // 因为selected不等于true找不到，但是观察数据，数据里是有selected  囧
                index = index < 0 ? 0 : index;

                return index;
            },

            /**
             * 根据当前位置更新视图模型（在拖动的时候，top值不断改变，不断更新视图）
             * 即更新selected
             * @param pos
             * @param models
             */
            updateViewModelByPosition(marginTop, models) {

                let targetPos = marginTop - ZERO_POS,
                    step = Math.abs(parseInt(targetPos / STEP_SIZE));// 滑动的li标签的个数

                //step = step >= models.length ? models.length - 1 : step;

                _.map(models, function(item, idx) {

                    item.selected = idx === step;
                });

                setTimeout(() => {
                    this.addClassName(this.targetName);
                }, 0);
            },

            /**
             * 使用动画过渡到指定的索引位置
             * @param index
             */
            updatePositionWithAnimate(index) {

                let _this = this;

                function recursionAnt () {

                    let endPos = (-STEP_SIZE * index - _this.currentFixed(index) + ZERO_POS).toFixed(3), // ul应该处于的正确坐标
                        currentPos = _this[_this.targetName + 'Top']; // ul的当前坐标
                        //diff = Math.abs(endPos) - Math.abs(currentPos); // 计算两者差值


                    // 这里其实不需要通过动画过渡，因为diff的差值实际上非常小，可以直接移动过去
                    /*if (Math.abs(diff) > 0.05) {
                        diff = diff * 0.8;

                        _this[_this.targetName + "Top"] = _this[_this.targetName + "Top"] - diff;
                        _this.renderer(recursionAnt);
                    } else {*/

                    _this[_this.targetName + "Top"] = endPos;
                    setTimeout(function () {

                        _this.updateByTargetName(_this.targetName);
                    }, 0);
                    //}
                }

                this.renderer(recursionAnt);
            },

            /**
             * 根据选中的年份更新视图模型，并更新位置
             * @param year
             */
            updateYear(year) {

                // 如果初始化的开始时间和默认选中时间一样，但是在过滤规则中的过滤条件恰好过滤掉一年的倒数第一天，
                // 这样就需要对year进行修正，即下面的代码，同样，结束时间需要相同的处理
                // year = this.beginDate.getFullYear() > year ? this.beginDate.getFullYear() : year;

                this.selectedDate.setFullYear(year);
                this.selectedDate.setMonth(0);
                this.selectedDate.setDate(1);

                if (this.n.length > 0) {

                    _.map(this.n, item => {

                        item.selected = item.value === year;
                    });
                } else {

                    let n = [],
                        beginYears = this.beginDate.getFullYear(),
                        endYears = this.endDate.getFullYear();

                    for (; beginYears <= endYears; beginYears++) {

                        n.push({
                            value: beginYears,
                            selected: year === beginYears
                        });
                    }
                    this.n = n;
                }

                // 更新位置，把选中的值定位到中间选中区域
                this.updatePosition("n", this.currentIndex("n"));

                // 添加class属性
                this.addClassName('n');
            },

            /**
             * 根据选中的月份更新视图模型，并更新位置
             * @param month
             */
            updateMonth(month) {

                let months = [],
                    beginMonth = 0,
                    endMonth = 11;

                if (this.selectedDate.getFullYear() === this.beginDate.getFullYear()) {

                    beginMonth = this.beginDate.getMonth();
                    // month = beginMonth > month ? beginMonth : month;
                }

                if (this.selectedDate.getFullYear() === this.endDate.getFullYear()) {

                    endMonth = this.endDate.getMonth();
                }

                this.selectedDate.setMonth(month);
                this.selectedDate.setDate(1);

                // (endMonth - beginMonth) === 11 排除从有12个月的年拨到有不足12个月的年，数据未更新的情况
                if (this.months.length === 12 && (endMonth - beginMonth) === 11) {

                    _.map(this.months, item => {

                        item.selected = item.value === month;
                    });
                } else {

                    for (; beginMonth <= endMonth; beginMonth++) {

                        months.push({
                            value: beginMonth,
                            selected: month === beginMonth
                        });
                    }
                    this.months = months;
                }

                this.updatePosition("months", this.currentIndex("months"));
                this.addClassName('months');
            },


            /**
             * 根据选中日期更新视图模型，并更新位置
             * @param date
             */
            updateDate(date) {

                let dates = [],
                    beginDate = 1,
                    endDate = this.daysInMonth(this.selectedDate),
                    cursor = new Date(this.selectedDate.getTime());

                if (this.selectedDate.getFullYear() === this.beginDate.getFullYear()
                    && this.selectedDate.getMonth() === this.beginDate.getMonth()) {

                    beginDate = this.beginDate.getDate();
                    //date = this.beginDate.getDate() > date ? this.beginDate.getDate() : date;
                }

                if (this.selectedDate.getFullYear() === this.endDate.getFullYear()
                    && this.selectedDate.getMonth() === this.endDate.getMonth()) {

                    endDate = this.endDate.getDate();
                }

                this.selectedDate.setDate(date);


                for (; beginDate <= endDate; beginDate++) {

                    cursor.setDate(beginDate);

                    dates.push({
                        value: beginDate,
                        date: new Date(cursor.getTime()),
                        selected: date === beginDate
                        //disable: this.isExclude(cursor)
                    });
                }

                this.dates = dates;
                this.updatePosition("dates", this.currentIndex("dates"));
                this.addClassName('dates');
            },

            /**
             * 根据年，月，日更新视图及位置
             * @param tName
             */
            updateByTargetName(tName) {

                switch(tName) {
                    case "n":
                        let currentYear = _.find(this.n, arg => arg.selected).value;
                        this.updateYear(currentYear);
                        this.updateMonth(this.selectedDate.getMonth());
                        this.updateDate(this.selectedDate.getDate());
                        break;
                    case "months":
                        let currentMonth = _.find(this.months, arg => arg.selected).value;
                        this.updateMonth(currentMonth);
                        this.updateDate(this.selectedDate.getDate());
                        break;
                    case "dates":
                        let currentDate = _.find(this.dates, arg => arg.selected).value;
                        this.updateDate(currentDate);
                        break;
                }
                this.commitable = true;
            },


            /**
             * [事件监听]开始拖拽动作(初始化需要拖拽的参数)
             * @param event
             */
            startHandler(event) {

                let currentTargetLen;

                this.targetName = event.currentTarget.getAttribute("name");// 当前拖动的对象（年、月、日）
                this.startScreenPos = event.touches[0].screenY; // 拖动起始点
                this.startPos = this[this.targetName + "Top"]; // 当前拖动的（年、月、日）的坐标

                currentTargetLen = this[this.targetName].length - 1;
                this.minPos = -currentTargetLen * STEP_SIZE - this.currentFixed(currentTargetLen) + ZERO_POS;
                this.maxPos = ZERO_POS;

                this.touching = true; // 可拖动
                this.commitable = false;

            },

            /**
             * [事件监听]拖拽动作进行中
             * @param event
             */
            moveHandler(event) {

                if (!this.touching) {
                    return;
                }

                let offsetY = this.convertPx2Rem(event.touches[0].screenY - this.startScreenPos),
                    currentTop = this.startPos + offsetY; // ul的偏移量（marginTop）


                // 向上滑动
                if (currentTop <= this.minPos) {
                    currentTop = this.minPos;
                    //this.offset = 0;
                }

                // 向下滑动
                if (currentTop >= this.maxPos) {
                    currentTop = this.maxPos;
                    //this.offset = 0;
                }
                this[this.targetName + "Top"] = currentTop; // 滑动时改变top值，ul的样式在不断改变

            },

            /**
             * [事件监听]拖拽动作结束
             * @param event
             */
            endHandler(event) {

                if (!this.touching) {
                    return;
                }

                this.touching = false;

                let currentIdx = this.currentIndex(this.targetName),
                    targetPos = this[this.targetName + "Top"];

                // 说明按下没有拖动（点击）
                if (targetPos == this.startPos) {

                    let step = STEP_MAPPING[event.target.className],
                        targetIdx = currentIdx + step;

                    // step === 0 点击了current块
                    // targetIdx < 0 超过了上边界
                    // targetIdx > this[this.targetName].length - 1 超过了下边界
                    if (step === 0 || targetIdx < 0 || targetIdx > this[this.targetName].length - 1) {

                        return;
                    }

                    // 即点击
                    this.updatePositionWithAnimate(targetIdx);
                    return;
                }
                //targetPos = targetPos >= ZERO_POS ? ZERO_POS : targetPos;

                // 需要滚动到的索引位
                //index = parseInt((targetPos + this.currentFixed(currentIdx) - ZERO_POS) / -STEP_SIZE);

                this.updatePositionWithAnimate(currentIdx);
            },

            /**
             * [事件绑定]
             */
            clickInput() {
                this.active = !this.active;
            },

            /**
             * [事件监听]取消选择
             */
            cancelHandler() {
                this.active = false;
            },
            /**
             * [事件监听]确认选择
             */
            commitHandler() {

                if (!this.commitable) {
                    return;
                }

                let _this = this;
                //this.complete(new Date(this.selectedDate.getTime()));
                _this.active = false;

                _this.tellParent();
            },

            /**
             * 把自组建数据传到父组件
             */
            tellParent() {

                let _this = this;

                _this.$emit('listenChild', {
                    widgetType: _this.widgetType,
                    widgetName: _this.widgetName,
                    widgetId: _this.widgetId,
                    value: _this.selectedDate
                });
            },
        },
        watch: {

            'nTop': function (newYTop) {

                let _this = this;

                this.updateViewModelByPosition(newYTop, _this.n);
            },
            'monthsTop': function (newMTop) {

                let _this = this;

                this.updateViewModelByPosition(newMTop, _this.months);
            },
            'datesTop': function (newDTop) {

                let _this = this;

                this.updateViewModelByPosition(newDTop, _this.dates);
            }

        },
        mounted() {

            let _this = this,
                $html = document.getElementsByTagName("html")[0],
                htmlStyle = getComputedStyle($html) || {},
                selectedYear = _this.selectedDate.getFullYear(),
                selectedMonth = _this.selectedDate.getMonth(),
                selectedDate = _this.selectedDate.getDate();

            // rem 单位基数
            _this.BASE_SIZE = parseFloat(htmlStyle["font-size"] || 12);

            // 检查初始化的值
            //_this.checkProperties();

            // 初始化年、月、日、数据
            _this.updateYear(selectedYear);
            _this.updateMonth(selectedMonth);
            _this.updateDate(selectedDate);

            _this.tellParent();
        }

        //Vue 2.x filters can only be used inside mustache interpolations and v-bind expressions (the latter supported since 2.1.0), because filters are primarily designed for text transformation purposes. For more complex data transforms in other directives, you should use Computed properties instead
    };
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
    .datechooser {
        position: fixed;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        z-index: 1;
        background: hsla(0, 0%, 0%, .5);
    }
    .chooser-transition{
        position:fixed;
        width:100%;
        background-color:#f0f0f0;
        height:auto;
        bottom:0;
        left:0;
        z-index:5;

        h1{
            display:-webkit-box;
            height:1.76rem;
            line-height:1.76rem;
            font-size:0.68rem;
            padding:0 0.56rem;
            background-color:#f0f0f0;

            a, b {
                -webkit-box-flex:4;
                display:block;
                font-weight:normal;
                text-align:center;
                min-width:1.38rem;
            }

            a {
                &:first-of-type {
                     -webkit-box-flex:1;
                     color:#353d44;
                     text-align:left;
                 }

                 &:last-of-type {
                      -webkit-box-flex:1;
                      color:#f29400;
                      text-align:right;
                  }
            }
        }

        >div {

        }
    }

    .container {
        position: relative;
        padding: 0 0.56rem;
        width: 100%;
        height: 8.8rem;

        > div {
              /*display:-webkit-box;*/
              position:absolute;
              top:0;
              left: .56rem;
              right: .56rem;
              bottom:0;
              overflow:hidden;
          }

        .linear {
            background-image: linear-gradient(to bottom, #f5f5f5 0, rgba(245, 245, 245, 0.2) 40%, rgba(245, 245, 245, 0) 45%, rgba(245, 245, 245, 0) 55%, rgba(245, 245, 245, 0.2) 60%, #f5f5f5 100%)
        }

        ul {
            text-align: center;
            display: block;
            float: left;
            width: 33.333333%;

        }

        li {
            line-height: 1rem;
            height: 1rem;
            font-size: 0.56rem;
            -webkit-transition: font-size .2s ease;
            width: 100%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;

            color: #a6a6a6;

            &.re2, &.nxt2 {
                 line-height:1.15rem;
                 height:1.15rem;
                 font-size:0.68rem;
            }

            &.re1, &.nxt1 {
                line-height: 1.3rem;
                height: 1.3rem;
                font-size: 0.8rem
            }

            &.current {
                line-height: 1.75rem;
                height: 1.75rem;
                font-size: 0.92rem;
                color: #353d44;
            }
        }

        .ops .current {
            border-top: 1px solid #dcdcdc;
            border-bottom: 1px solid #dcdcdc;
        }
    }
</style>
