export default {
    "PASSPORT": {
        "CONFIG": {"base": "//moispre.cnsuning.com/", "loginTheme": "wap_new"},
        "AUTH_URL": "https://passportpre.cnsuning.com/ids",
        "IDSAUTH_SERVER_URL": "https://aqpre.cnsuning.com/asc/auth"
    },
    "API": {
        //报名限制条件
        "limitFields": "//moispre.cnsuning.com/signup/gateway/queryActivityLimitAndStoreMobileNum.do",
        //活动是否关联V购
        "vType": "//moispre.cnsuning.com/signUpTemplet/getSVFlow.do",
        //查询导购员列表
        "vPersonList": '//moissit.cnsuning.com/signUpTemplet/getSVGuiders.do',
        //根据经纬度查询门店
        "locationStore": '//moissit.cnsuning.com/signupV2/activity/getActivityStoreGuide-{{activityCode}}-{{cityId}}-{{lng}}-{{lat}}-{{callback}}.html',
        //省和市数据（与业务相关）
        "queryProvinceCityList": "//moispre.cnsuning.com/mois-web/signupV2/activity/getCity-{{activityCode}}-{{callback}}.html",
        //市数据（全国）
        "queryCityList": "//www.suning.com/webapp/wcs/stores/servlet/SNiPhoneCityView",
        //区数据（全国）
        "queryDistrictList": '//www.suning.com/webapp/wcs/stores/servlet/SNiPhoneDistrictView',
        //门店数据
        "queryStoreList": "//moispre.cnsuning.com/signupV2/activity/getStore-{{activityCode}}-{{cityId}}-{{lng}}-{{lat}}-{{callback}}.html",
        //报名提交接口（需要登录）
        "enrollNeedLogin": "//moispre.cnsuning.com/signup/private/addPrivateSignUpVBooking.do",
        //报名提交接口（不需要登录）
        "enrollUnLogin": "//moispre.cnsuning.com/signup/gateway/addSignUpVBooking.do",
        //活动详情
        "actDetailsInfo": "//moispre.cnsuning.com/mois-web/signupV2/activity/info-{{activityCode}}-{{callback}}.html",
        //签到
        "checkSign": "//moispre.cnsuning.com/mois-web/signup/updateSignUpInfo.do",
        //签到提交（不需要登录）
        "signUnLogin": "//moispre.cnsuning.com/mois-web/signup/gateway/addSignUpInfo.do",
        //签到提交（需要登录）
        "signNeedLogin": "//moispre.cnsuning.com/mois-web/signup/private/addSignUpInfo.do"
    }
};
