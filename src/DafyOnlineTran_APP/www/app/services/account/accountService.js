/**
 * Created by tianxc on 16-8-3.
 */
define([
    'app'
], function(app) {
    'use strict';

    app.factory('AccountService', function($http,CommonService) {
        return {
            login: function(par,callback) { //登录
                CommonService.getJsonData('api/Account/Login', par).then(function(data) {
                    callback(data);
                });
            },
            register:function(par,callback){//注册
                CommonService.getJsonData('api/Account/Register', par).then(function(data) {
                    callback(data);
                });
            },
            getVerifyCode:function(par,callback){//获取验证码
                CommonService.getJsonData('api/Account/VerifyCode', par).then(function(data) {
                    callback(data);
                });
            },
            resetPwd:function(par,callback){//重置密码
                CommonService.getJsonData('api/Account/ResetPwd', par).then(function(data) {
                    callback(data);
                });
            },
            getmyTrainList: function(par, callback) { //获取我的培训列表
                CommonService.getJsonData('api/Train/TrainList', par).then(function(data) {
                    callback(data);
                });
            },            
        }
    });
});