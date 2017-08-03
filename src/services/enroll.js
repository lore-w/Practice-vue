/*
 * @author: 16071018
 * @date: 2017/07/06
 */

import Vue from 'vue'
import CONF from '../commons/conf'
import {Util} from '../commons/util'

// Promise 垫片
require('core-js/fn/promise');


let Service = {
    
    /**
     * Promise请求基础方法
     * @params {String} url 请求的url
     * @params {Object} params 请求的参数
     * @return Promise
     * */
    reqPromise(url, params) {
        
        return new Promise((resolve, reject) => {
            Vue.http.jsonp(url, {
                params: params
            }).then(data => {
                if (data.body.code === '0') {
                    
                    resolve(data.body.data);
                } else if (data.body.code === '0001') {
                    reject(new Error(`${url}接口参数错误`));
                } else {
                    reject(new Error(`${url}接口错误`));
                }
            }, data => {
                reject(new Error(data));
            });
        });
    },
    
    /**
     * 查询报名限制条件（需要填哪些字段）
     * @params {String} storeCode    门店Code 必填
     * @params {String} storeType    门店类型  必填
     * @params {String} activityCode 活动Code 必填
     * @return Promise
     */
    queryLimitFields(activityCode, storeCode, storeType) {
        
        return this.reqPromise(CONF.API.limitFields, {
            storeCode: storeCode,
            storeType: storeType,
            activityCode: activityCode
        });
    },
    /**
     * 查询报名活动是否门店创建的活动及是否关联了V购
     * @params {String} storeType    门店类型  必填
     * @params {String} activityCode 活动Code 必填
     * @return Promise
     */
    queryIsVbuy(activityCode, storeType) {
    
        return this.reqPromise(CONF.API.vType, {
            storeType: storeType,
            activityCode: activityCode
        });
    },
    /**
     * 查询导购员列表
     * @params {String} storeCode    门店Code  必填
     * @return Promise
     */
    queryVPersonList(storeCode) {
    
        return this.reqPromise(CONF.API.vPersonList, {
            storeCode: storeCode
        });
    },
    
    /**
     * 根据经纬度查询门店列表
     * @params {String} activityCode 活动Code
     * @params {String} cityId 城市id
     * @params {String | Number} lng
     * @params {String | Number} lat
     * @return Promise
     * */
    queryStoreByLocation(activityCode, cityId, lng, lat) {
        
        let url = CONF.API.locationStore;
    
        url = url
            .replace('{{activityCode}}', activityCode)
            .replace('{{cityId}}', cityId)
            .replace('{{lng}}', lng)
            .replace('{{lat}}', lat)
            .replace('{{callback}}', 'queryStoreCallback');
    
        return new Promise((resolve, reject) => {
            Vue.http.jsonp(url, {
                jsonpCallback: 'queryStoreCallback'
            }).then(data => {
                if (data.body.code === '0') {
                
                    resolve(data.body.data);
                } else {
                    reject(new Error(`${url}接口错误`));
                }
            }, data => {
                reject(new Error(data));
            });
        });
    },
    
    // 获取活动详情
    queryActDetailsInfo(activityCode) {
        
        let url = CONF.API.actDetailsInfo;
    
        url = url
            .replace('{{activityCode}}', activityCode)
            .replace('{{callback}}', 'queryActDetailsCallback');
    
        return new Promise((resolve, reject) => {
            Vue.http.jsonp(url, {
                jsonpCallback: 'queryActDetailsCallback'
            }).then(data => {
                if (data.body.code === '0') {
    
                    resolve(data.body.data);
                } else {
                    reject(new Error(`${url}接口错误`));
                }
            }, data => {
                reject(new Error(data));
            });
        });
    },
    /**
     * 检查签到
     * */
    
    checkSign(activityCode, signupStoreCode, phoneNum) {
    
        return new Promise((resolve, reject) => {
            
            let url = CONF.API.checkSign;
            
            Vue.http.jsonp(url, {
                params: {
                    activityCode,
                    signupStoreCode,
                    phoneNum
                }
            }).then(data => {
                
                resolve(data.body.code);
            }, data => {
                reject(new Error(data));
            });
        });
    },
    
    /**
     * 报名提交
     * */
    enroll(needlogin, data) {
        
        let url = needlogin == 1 ? CONF.API.enrollNeedLogin : CONF.API.enrollUnLogin;
    
        return new Promise((resolve, reject) => {
            Vue.http({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: true,
                emulateJSON: true,
                body: data
            }).then(data => {
    
                let tips = Util.getErrorCodeTips(data.body.code);
    
                if (!!tips) {
        
                    AlertBox({
                        type: 'mini',
                        msg: tips
                    });
                    reject(new Error(`${url}  ${tips}`));
                } else {
        
                    resolve(data.body);
                }
                
            }, data => {
                
                reject(new Error(data));
            });
        });
    },
    /**
     * 签到提交
     */
    sign(needlogin, data) {
        
        let url = needlogin == 1 ? CONF.API.signNeedLogin : CONF.API.signUnLogin;
        
        return new Promise((resolve, reject) => {
            Vue.http({
                url: url,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                credentials: true,
                emulateJSON: true,
                body: data
            }).then(data => {
                
                let tips = Util.getErrorCodeTips(data.body.code);
                
                if (!!tips) {
    
                    AlertBox({
                        type: 'mini',
                        msg: tips
                    });
                    reject(new Error(`${url}  ${tips}`));
                } else {
                    
                    resolve(data.body);
                }
            }, data => {
                
                reject(new Error(data));
            });
        });
    },
    /**
     * [查询门店列表的数据]
     * @param: {String}
     */
    queryStoreData(activityCode, cityId, lng, lat) {
        
        let url = CONF.API.queryStoreList;
        
        url = url
            .replace('{{activityCode}}', activityCode)
            .replace('{{cityId}}', cityId)
            .replace('{{lng}}', lng)
            .replace('{{lat}}', lat)
            .replace('{{callback}}', 'queryStoreDataCallback');
        
        return new Promise((resolve, reject) => {
            Vue.http.jsonp(url, {
                
                jsonpCallback: 'queryStoreDataCallback'
            }).then(data => {
                if (data.body.code === '0') {
                    resolve(data.body.data);
                } else {
                    reject(new Error(`${url}接口错误`));
                }
            }, data => {
                reject(new Error(data));
            });
        });
    }
};
export default Service;
