<template>
    <div class="datechooser"
         @touchmove.prevent="moveHandler"
         @touchend.prevent="endHandler">
        <div v-if="display" transition="chooser">
            <h1>
                <a @touchstart="cancelHandler">取消</a>
                <b></b>
                <a :class="{disable: !commitable}" @touchstart="commitHandler">确定</a>
            </h1>
            <div>
                <div class="vs">
                    <!--在Vue2.0中-->
                    <!-- class="{{item | classParser years}}" 报错 Interpolation inside attributes has been removed-->
                    <!--需要v-bind绑定属性-->
                    <ul :style="yTop">
                        <li v-for="item in years"
                            v-text="item.value | yearFormatter"
                            :class="{{item | classParser years}}"></li>
                    </ul>
                    <ul :style="mTop">
                        <li v-for="item in months"
                            v-text="item.value | monthFormatter"
                            :class="{{item | classParser months}}"></li>
                    </ul>
                    <ul :style="dTop">
                        <li v-for="item in dates"
                            v-text="item.value | dateFormatter item"
                            :class="{{item | classParser dates}}"></li>
                    </ul>
                </div>
                <div class="linear"></div>
                <div class="ops">
                    <!--年-->
                    <ul name="y"
                        @touchstart.prevent="startHandler">
                        <li class="pre3"></li>
                        <li class="pre2"></li>
                        <li class="pre1"></li>
                        <li class="current"></li>
                        <li class="nxt1"></li>
                        <li class="nxt2"></li>
                        <li class="nxt3"></li>
                    </ul>
                    <!--月-->
                    <ul name="m"
                        @touchstart.prevent="startHandler">
                        <li class="pre3"></li>
                        <li class="pre2"></li>
                        <li class="pre1"></li>
                        <li class="current"></li>
                        <li class="nxt1"></li>
                        <li class="nxt2"></li>
                        <li class="nxt3"></li>
                    </ul>
                    <!--日-->
                    <ul name="d"
                        @touchstart.prevent="startHandler">
                        <li class="pre3"></li>
                        <li class="pre2"></li>
                        <li class="pre1"></li>
                        <li class="current"></li>
                        <li class="nxt1"></li>
                        <li class="nxt2"></li>
                        <li class="nxt3"></li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    /*
     * @name: 日期选择控件
     * @description: es6 / vue / rem
     * @author: 15010880
     * @update: 2016/2/1
     */
    const STEP_SIZE = 1,    // 年月日滑块(ul)中的(li)普通高度,不包含存在class的元素
        EASING = 0.8,   // 缓动系
        ZERO_POS = 3.45,    // 基线位置，控件中部的选中区域
        NAME_MAPPING = {
            "y": "years",
            "m": "months",
            "d": "dates"
        },
        STEP_MAPPING = {
            "pre3": -3,
            "pre2": -2,
            "pre1": -1,
            "current": 0,
            "nxt1": 1,
            "nxt2": 2,
            "nxt3": 3
        },
        WEEK_MAPPING = {
            0: "星期日",
            1: "星期一",
            2: "星期二",
            3: "星期三",
            4: "星期四",
            5: "星期五",
            6: "星期六"
        };

    export default {
        data() {
            // 视图模型
            return {
                years: [],
                months: [],
                dates: [],
                yt: 0,
                mt: 0,
                dt: 0,
                commitable: true,
                // y,m,d 年月日滑
                targetName: null,
                // 用户交互
                touching: false,
                // 交互最小边
                minPos: 0,
                // 交互最大边
                maxPos: 0,
                // ul 开始位
                startPos: 0,
                // 屏幕开始位
                startScreenPos: 0,
                // 差值 (屏幕移动位置 - 屏幕开始位置
                offset: 0
            };
        },
        props: {
            // 开始日期
            beginDate: {
                type: Date,
                default: new Date(1950, 0, 1)
            },
            // 结束日期
            endDate: {
                type: Date,
                default: new Date(2020, 11, 31)
            },
            // 选中日期
            selectedDate: {
                type: Date,
                default: new Date()
            },
            // 选择完成回调
            complete: {
                type: Function,
                default: date => console.log(date)
            },
            // 不包含的周日期 [0-6]
            excludeDays: {
                type: Array,
                default: []
            },
            // 不包含的月日期 ex: 5/1, 10/1
            excludeDates: {
                type: Array,
                default: []
            },
            // 是否展示日期选择控件
            display: {
                type: Boolean,
                default: false,
                twoWay: true
            }
        },
        methods: {
            /**
             * px -> rem 单位转换
             * @param px
             * @returns {number}
             */
            convertPx2Rem(px) {
                return px / this.BASE_SIZE
            },
            /**
             * 渲染引擎兼容方法
             * @param callback
             */
            renderer(callback) {
                if (!requestAnimationFrame) {
                    setTimeout(callback, 10);
                } else {
                    requestAnimationFrame(callback);
                }
            },
            /**
             * 获取当前月份的天数
             * @param date
             * @returns {number} 28/29/30/31
             */
            getDaysInMonth(date) {

                alert(212112);
                let d0 = new Date(date.getFullYear(), date.getMonth(), 1);
                let d1 = new Date(d0.getFullYear(), d0.getMonth()+1, 1);
                return (d1.getTime() - d0.getTime()) / 1000 / 60 / 60 / 24;
            },
            /**
             * 当前日期是否需要被过滤 (根据 excludeDays 与 excludeDates 规则匹配)
             * @param date
             * @returns {boolean}
             */
            isExclude(date) {
                let result = _.indexOf(this.excludeDays, date.getDay()) != -1;
                if (!result) {
                    let pattern = (date.getMonth() + 1) + "/" + date.getDate();
                    result = _.indexOf(this.excludeDates, pattern) != -1;
                }
                return result;
            },
            /**
             * 当前滑块所处的位置索引
             * @param tName y,m,d
             * @returns {number|Number|*}
             */
            currentIndex(tName) {
                let propName = NAME_MAPPING[tName],
                    selectedItem = _.find(this[propName], arg => arg.selected),
                    index = _.indexOf(this[propName], selectedItem);
                return index;
            },
            /**
             * 当前位置索引需要补偿差值 （元素中存在大小渐进，计算过程中以 STEP_SIZE 作为基准会有偏差值出现）
             * @param index
             * @returns {number}
             */
            currentFixed(index) {
                let fixed = -0.445;
                switch(index) {
                    case 0:
                        fixed = 0;
                        break;
                    case 1:
                        fixed = -0.3;
                        break;
                }
                return fixed;
            },
            /**
             * 检查预设的属性
             */
            checkProperties() {

                // 周过滤条件不可以超过7个
                if (this.excludeDays.length >= 7) {
                    this.excludeDays = [];
                }
                // 按照过滤规则调校时间选择范围
                let beginDate = this.beginDate, endDate = this.endDate;
                if(beginDate > endDate) {
                    beginDate = new Date(1950, 0, 1);
                    endDate = new Date(2020, 11, 31);
                }
                var days = this.getDaysInMonth(beginDate);
                var bd = new Date(beginDate.getTime());
                var ed = new Date(endDate.getTime());
                for(let i=beginDate.getDate(); i<=days; i++) {
                    bd.setDate(i);
                    if(!this.isExclude(bd)) { // 如果合法则跳过下面的逻辑
                        break;
                    }
                    beginDate.setDate(beginDate.getDate() + 1);
                }
                for(let j=endDate.getDate(); j>=1; j--) {
                    ed.setDate(j);
                    if(!this.isExclude(ed)) { // 如果合法则跳过下面的逻辑
                        break;
                    }
                    endDate.setDate(endDate.getDate() - 1);
                }
                if(beginDate.getTime() == endDate.getTime()) {
                    beginDate = new Date(1950, 0, 1);
                    endDate = new Date(2020, 11, 31);
                }
                // 根据过滤规则及时间范围调校选中的日期
                let preDate = new Date(this.selectedDate.getTime()),
                    nxtDate = new Date(this.selectedDate.getTime()),
                    preSize = 0, nxtSize = 0;
                while(this.isExclude(preDate)) {
                    preDate.setDate(preDate.getDate() - 1);
                    preSize++;
                }
                while(this.isExclude(nxtDate)) {
                    nxtDate.setDate(nxtDate.getDate() - 1);
                    nxtSize++;
                }
                if (preSize >= nxtDate) {
                    this.selectedDate = nxtDate;
                } else {
                    this.selectedDate = preDate;
                }
                if (this.selectedDate < beginDate) {
                    this.selectedDate = beginDate;
                }
                if (this.selectedDate > endDate) {
                    this.selectedDate = endDate;
                }
            },
            /**
             * 使用动画过渡到指定的索引位置
             * @param index
             */
            updatePositionWithAnimate(index) {
                let oldIndex = Math.abs(parseInt((this.startPos - ZERO_POS) / STEP_SIZE));
                // 边界验证
                index = index < 0 ? 0 : index;
                index = index >= this[NAME_MAPPING[this.targetName]].length ?
                    (this[NAME_MAPPING[this.targetName]].length - 1) : index;
                // 此处逻辑为自动跳过不可选择的日期，需求已变更()
                let item = this[NAME_MAPPING[this.targetName]][index];
                if (this.targetName == "d" && item.disable) {
                    index = index < oldIndex ? item.pre : item.nxt;
                    index = index == undefined ? oldIndex : index;
                }
                // 计算目标位置与当前位置差值
                let targetPos = -STEP_SIZE * index + ZERO_POS + this.currentFixed(index);
                this.offset = targetPos - this[this.targetName + "t"];
                this.offset = parseFloat(this.offset.toFixed(2));
                // 若差值为 0 则无需过渡
                if (this.offset == 0) {
                    this.updateByTargetName(this.targetName);
                    return;
                }
                // 开始过渡
                this.renderer(this.doEasing);
            },
            /**
             * 直接定位到指定的索引位置
             * @param tName y,m,d
             * @param index
             */
            updatePosition(tName, index) {
                let targetPos = -STEP_SIZE * index + ZERO_POS + this.currentFixed(index);
                targetPos = parseFloat(targetPos.toFixed(2));
                this[tName + "Top"] = targetPos;
            },
            /**
             * 根据年份更新视图模型，并更新位置
             * @param year
             */
            updateYear(year) {
                year = this.beginDate.getFullYear() > year ? this.beginDate.getFullYear() : year;
                this.selectedDate.setFullYear(year);
                this.selectedDate.setMonth(0);
                this.selectedDate.setDate(1);
                if (this.years.length > 0) {
                    _.map(this.years, function(item) {
                        item.selected = item.value == year;
                    });
                } else {
                    let years = [], i = this.beginDate.getFullYear(), size = this.endDate.getFullYear();
                    for (; i<=size; i++) {
                        years.push({
                            value: i,
                            selected: year == i
                        });
                    }
                    this.years = years;
                }
                this.updatePosition("y", this.currentIndex("y"));
            },
            /**
             * 根据月份更新视图模型，并更新位置
             * @param month
             */
            updateMonth(month) {

                let months = [], i=0, size=11;
                if (this.selectedDate.getFullYear() == this.beginDate.getFullYear()) {
                    i = this.beginDate.getMonth();
                    month = this.beginDate.getMonth() > month ? this.beginDate.getMonth() : month;
                }
                /*
                 *modify by 16071018 at 2016/08/29
                 *description 修复拨到2017年再拨到2016年，可以选到预约当天之前时间的问题
                 */
                this.selectedDate.setMonth(month);
                this.selectedDate.setDate(1);
                if (this.selectedDate.getFullYear() == this.endDate.getFullYear()) {
                    size = this.endDate.getMonth();
                }
                if (this.months.length == 12 && (size - i) == 11) {
                    _.map(this.months, function(item) {
                        item.selected = item.value == month;
                    });
                } else {
                    for (; i<=size; i++) {
                        months.push({
                            value: i,
                            selected: month == i
                        });
                    }
                    this.months = months;
                }
                this.updatePosition("m", this.currentIndex("m"));
            },
            /**
             * 根据日期更新视图模型，并更新位置
             * @param date
             */
            updateDate(date) {

                let daysInMonth = this.getDaysInMonth(this.selectedDate),
                    dates = [], i=1, size=daysInMonth,
                    cursor = new Date(this.selectedDate.getTime());
                // 处理选中日期大于边界值的情况
                if (this.selectedDate.getFullYear() == this.beginDate.getFullYear()
                    && this.selectedDate.getMonth() == this.beginDate.getMonth()) {
                    i = this.beginDate.getDate();
                    date = this.beginDate.getDate() > date ? this.beginDate.getDate() : date;
                }

                this.selectedDate.setDate(date);

                if (this.selectedDate.getFullYear() == this.endDate.getFullYear()
                    && this.selectedDate.getMonth() == this.endDate.getMonth()) {
                    size = this.endDate.getDate();
                }
                // 创建日期列表
                for (; i <= size; i++) {
                    cursor.setDate(i);
                    // 标记可用状态
                    dates.push({
                        value: i,
                        date: new Date(cursor.getTime()),
                        disable: this.isExclude(cursor)
                    });
                }
                // 遍历出不可用状态的日期
                _.map(dates, function(item, idx) {
                    if (!item.disable) {
                        return;
                    }
                    // 筛选出距离该不可用日期最近位置的可用日期
                    for (let i=idx; i>=0; i--) {
                        if (!dates[i].disable) {
                            item.pre = i;
                            break;
                        }
                    }
                    for (let i=idx; i<dates.length; i++) {
                        if (!dates[i].disable) {
                            item.nxt = i;
                            break;
                        }
                    }
                });
                // 获取当前选中日期对象
                let obj = _.find(dates, function(item) {
                    return item.value == date;
                });
                // 处理当前选中日期为不可用日期的情况
                if (obj && obj.disable) {
                    // 选择最近位置的可用日期为新的选中日期
                    date = obj.pre == undefined ? obj.nxt : obj.pre;
                    date += 1;
                    this.selectedDate.setDate(date);
                }
                // 根据选中日期，更新数据选中状态
                _.map(dates, function(item) {
                    item.selected = item.value == date;
                });

                // 根据需求调整为无法使用的日期不显示
                dates = _.filter(dates, function(item) {
                    return !item.disable;
                });
                this.dates = dates;
                this.updatePosition("d", this.currentIndex("d"));
            },
            /**
             * 根据年，月，日更新视图及位置
             * @param tName
             */
            updateByTargetName(tName) {
                switch(tName) {
                    case "y":
                        let currentYear = _.find(this.years, arg => arg.selected).value;
                        this.updateYear(currentYear);
                        this.updateMonth(this.selectedDate.getMonth());
                        this.updateDate(this.selectedDate.getDate());
                        break;
                    case "m":
                        let currentMonth = _.find(this.months, arg => arg.selected).value;
                        this.updateMonth(currentMonth);
                        this.updateDate(this.selectedDate.getDate());
                        break;
                    case "d":
                        let currentDate = _.find(this.dates, arg => arg.selected).value;
                        this.updateDate(currentDate);
                        break;
                }
                this.commitable = true;
            },
            /**
             * 根据当前位置更新视图模型
             * @param pos
             * @param models
             */
            updateViewModelByPosition(pos, models) {
                let targetPos = pos - ZERO_POS;
                let step = parseInt(targetPos / STEP_SIZE);
                step = step > 0 ? 0 : step;
                step = step <= -models.length ? models.length-1 : step;
                step = Math.abs(step);
                _.map(models, function(item, idx) {
                    item.selected = idx == step;
                });
            },

            /**
             * 缓动过渡
             */
            doEasing() {
                let dist = this.offset * EASING;
                // 如果缓动距离大于一缇，则继续进行过渡
                if (Math.abs(dist) > this.TWIP) {
                    this.offset -= dist;
                    this[this.targetName + "Top"] = this[this.targetName + "t"] + dist;
                    this.renderer(this.doEasing);
                    // 缓动距离小于一缇，且offset仍然大于0，则计算当前位置处相邻的索引位置，进行动画过渡补偿
                } else if (Math.abs(this.offset) > 0) {
                    let targetPos = parseFloat((this[this.targetName + "t"] + this.offset).toFixed(2));
                    targetPos = targetPos > ZERO_POS ? ZERO_POS : targetPos;
                    //(targetPos - fixed - ZERO_POS) / -STEP_SIZE
                    let index = (targetPos - this.currentFixed(this.currentIndex(this.targetName)) - ZERO_POS) / -STEP_SIZE;
                    index = Math.round(parseFloat(index.toFixed(2)));
                    this[this.targetName + "Top"] = targetPos;
                    this.updatePositionWithAnimate(index);
                }
            },
            /**
             * [事件监听]开始拖拽动作
             * @param event
             */
            startHandler(event) {
                this.targetName = event.currentTarget.getAttribute("name");
                this.startScreenPos = event.touches[0].screenY;
                this.startPos = this[this.targetName + "t"];
                this.minPos = -this[NAME_MAPPING[this.targetName]].length * STEP_SIZE;
                this.maxPos = ZERO_POS * 2 + 1.76;
                this.touching = true;
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
                this.offset = this.convertPx2Rem(event.touches[0].screenY - this.startScreenPos) * 0.4;
                let currentTop = this.startPos + this.offset;
                if (currentTop <= this.minPos) {
                    currentTop = this.minPos;
                    this.offset = 0;
                }
                if (currentTop >= this.maxPos) {
                    currentTop = this.maxPos;
                    this.offset = 0;
                }
                this[this.targetName + "Top"] = currentTop;
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
                let currentIdx = this.currentIndex(this.targetName);
                let targetPos = this[this.targetName + "t"];
                if (targetPos == this.startPos) {
                    let step = STEP_MAPPING[event.changedTouches[0].target.className];
                    if (step == 0) {
                        return;
                    }
                    this.updatePositionWithAnimate(currentIdx + step);
                    return;
                }
                targetPos = targetPos > ZERO_POS ? ZERO_POS : targetPos;
                let index = parseInt((targetPos - this.currentFixed(currentIdx) - ZERO_POS) / -STEP_SIZE);
                if ((targetPos - this.startPos) < 0) {
                    index++;
                }
                this.updatePositionWithAnimate(index);
            },
            /**
             * [事件监听]取消选择
             */
            cancelHandler() {
                this.display = false;
            },
            /**
             * [事件监听]确认选择
             */
            commitHandler() {
                if (!this.commitable) {
                    return;
                }
                this.complete(new Date(this.selectedDate.getTime()));
                this.display = false;
            },
            initial() {
                this.checkProperties();

                let year = this.selectedDate.getFullYear(),
                    month = this.selectedDate.getMonth(),
                    date = this.selectedDate.getDate();
                this.updateYear(year);
                this.updateMonth(month);
                this.updateDate(date);
            }
        },
        computed: {
            yTop: {
                get() {
                    return {marginTop: `${this.yt}rem`};
                },
                set(val) {
                    val = isNaN(val) ? 0 : val;
                    this.yt = val;
                }
            },
            mTop: {
                get() {
                    return {marginTop: `${this.mt}rem`};
                },
                set(val) {
                    val = isNaN(val) ? 0 : val;
                    this.mt = val;
                }
            },
            dTop: {
                get() {
                    return {marginTop: `${this.dt}rem`};
                },
                set(val) {
                    val = isNaN(val) ? 0 : val;
                    this.dt = val;
                }
            }
        },
        filters: {
            yearFormatter: function(val) {
                return `${val}年`;
            },
            monthFormatter: function(val) {
                return `${val + 1}月`;
            },
            dateFormatter: function(val, item) {
                let date = item.date;
                //str = "",
                //today = new Date()
                //if (today.getFullYear() == date.getFullYear()
                //    && today.getMonth() == date.getMonth()
                //    && today.getDate() == date.getDate()) {
                //    str = "(今天)";
                //}
                return `${val}日${WEEK_MAPPING[date.getDay()]}`;
            },
            classParser: function(item, items) {
                let className = "";
                let current = _.find(items, arg => arg.selected);
                let currentIndex = _.indexOf(items, current);

                let itemIndex = _.indexOf(items, item);
                let val = currentIndex - itemIndex;
                switch (val) {
                    case 2:
                        className = "pre2";
                        break;
                    case 1:
                        className = "pre1";
                        break;
                    case 0:
                        className = "current";
                        break;
                    case -1:
                        className = "nxt1";
                        break;
                    case -2:
                        className = "nxt2";
                        break;
                }
                return className;
            }
        },
        ready() {
            let _this = this,
                $html = document.getElementsByTagName("html")[0],
                htmlStyle = getComputedStyle($html) || {};

            // rem 单位基数
            this.BASE_SIZE = parseFloat(htmlStyle["font-size"] || 12);
            // “缇”单位
            this.TWIP = this.convertPx2Rem(1 / 20);

            let init = _.once(this.initial),
                unwatcher = this.$watch("display", v => {
                    if (!v) {
                        return;
                    }
                    init();
                    unwatcher();
                });

            this.$watch("yt", v => {


                alert(v);
                _this.updateViewModelByPosition(v, _this.years);
            });
            this.$watch("mt", v => {
                _this.updateViewModelByPosition(v, _this.months);
            });
            this.$watch("dt", v => {
                _this.updateViewModelByPosition(v, _this.dates);
            });
        }
    };
</script>
<style>

</style>
