/*
 *@description: 工具库
 *@author: 16071018
 *@email: 16071018@cnsuning.com
 *@time: 2017/04/19 09:21:58
 */

import CONF from './conf';

let Util = {
    
    /**
     * 跳登录页
     */
    redirectToLogin: function () {

        let targetUrl = window.location.href;

        window.location.href = CONF.PASSPORT.AUTH_URL + "/login?service=" +
            encodeURIComponent(CONF.PASSPORT.IDSAUTH_SERVER_URL + "?targetUrl=" +
                encodeURIComponent(targetUrl)) + "&loginTheme=wap_new";
    },

    /**
     * 用户登录认证
     * @param {function} successFn - 用户登录成功后执行的回调函数
     * @return null
     */
    auth: function (successFn) {

        window.passport_config = CONF.PASSPORT.CONFIG;

        $.probeAuthStatus(function () {

            successFn();
        }, function () {
            Util.redirectToLogin();
        }, CONF.PASSPORT.CONFIG);
    },
    
    /**
     * 截取字符串时间
     */
    getStringTime(time) {
        
        let date = time.split(' '),
            YMD = date[0].split('-'),
            HMS = date[1].split(':'),
            Y = YMD[0],
            M = YMD[1],
            D = YMD[2],
            h = HMS[0],
            m = HMS[1],
            s = HMS[2];
        
        return {Y, M, D, h, m, s}
    },
    
    /**
     * 格式化时间
     */
    formatDate(date, connector) {
        
        return date.getFullYear() + connector + (date.getMonth() + 1) + connector + date.getDate();
    },
    
    /**
     * 错误码
     */
    getErrorCodeTips: function (code) {
        
        let tips = "";
        
        switch (code) {
            case "0001":
                tips = "系统异常，请稍后再试！";
                break;
            case "0002":
                tips = "系统异常，请稍后再试";
                break;
            case "4001":
                tips = "您访问的活动不存在";
                break;
            case "4002":
                tips = "您访问的活动已过期";
                break;
            case "4011":
                tips = "验证码错误";
                break;
            case "4013":
                tips = "请先登陆易购账号";
                break;
            case "4015":
                tips = "报名失败，请确认活动时间后重试";
                break;
            case "4016":
                tips = "报名失败，请确认活动时间后重试";
                break;
            case "4017":
                tips = "请输入正确的手机号码";
                break;
            case "4018":
                tips = "报名人数已达上限";
                break;
            case "4019":
                tips = "本活动您的设备可报名次数已满";
                break;
            case "4020":
                tips = "您已经报过名啦";
                break;
            case "4021":
                tips = "报名失败，请稍后再试";
                break;
            case "4023":
                tips = "报名失败，请稍后再试";
                break;
            case "4043":
                tips = "报名失败，请稍后再试";
                break;
            case "4031":
                tips = "现在还不可以签到";
                break;
            case "4032":
                tips = "您还没有报名，请先填写报名表";
                break;
            case "4033":
                tips = "您已经签到过啦";
                break;
            case "4034":
                tips = "报名失败，请稍后再试";
                break;
            case "4024":
                tips = "您的账号已经报过名了";
                break;
        }
        
        return tips;
    },

};
export {Util};


