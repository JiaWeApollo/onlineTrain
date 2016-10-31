/**
 * Created by tianxc on 16-8-3.
 */
define([
    'app'
], function(app) {
    'use strict';

    app.factory('AccountService',['$http','CommonService',function($http,CommonService) {
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
                    //console.log(data);
                    callback(data);
                });
            },
            resetPwd:function(par,callback){//重置密码
                CommonService.getJsonData('api/Account/ResetPwd', par).then(function(data) {
                    //console.log(data);
                    callback(data);
                });
            },
            signOut:function(par,callback){//退出登录
                CommonService.getJsonData('api/Account/SignOut', par).then(function(data) {
                    callback(data);
                });
            },
            getMyIntegralList: function(par, callback) { //获取我的积分列表
                CommonService.getJsonData('api/Account/IntegralList', par).then(function(data) {
                    //console.log(data);
                    callback(data);
                });
            },
            updateAvatar:function(filePath,par,callback){//修改头像
                CommonService.upload('api/Account/UpdateAvatar',filePath,par).then(function(data) {
                    callback(data);
                });
            },
            getUserInfo:function(par,callback){//获取用户基本信息
                CommonService.getJsonData('api/Account/GetUserInfo',par).then(function(data) {
                    callback(data);
                });
            },
            getSurveyList:function(par,callback){ //获取需求调研列表
                CommonService.getJsonData('api/Account/SurveyList',par).then(function(data){
                    callback(data);
                });
            },
            changePwd:function(par,callback){ //修改密码
                CommonService.getJsonData('api/Account/ChangePwd',par).then(function(data){
                    callback(data);
                });
            },
            addFeedback:function(par,callback){ //意见反馈
                CommonService.getJsonData('api/Account/Feedback',par).then(function(data){
                    callback(data);
                });
            },
            getExpenseDetails:function(par,callback){ //获取申请报销详情
                CommonService.getJsonData('api/Account/GetExpenseDetails',par).then(function(data){
                    //console.log(data);
                    callback(data);
                });
            },
            applyExpense:function(par,callback){ //申请报销
                CommonService.getJsonData('api/Account/ApplyExpense',par).then(function(data){
                    callback(data);
                });
            }
        }
    }]);
});