/**
 * Created by tianxc on 16-8-12.
 */
define([
    'app'
], function(app) {
    'use strict';

    app.factory('TrainService', function($q, $http, CommonService) {
        return {
            getTrainList: function(par, callback) { //获取培训列表
                CommonService.getJsonData('api/Train/TrainList', par).then(function(data) {
                    callback(data);
                });
            },
            getTrainDetails:function(par,callback){//获取培训详情列表
                CommonService.getJsonData('api/Train/TrainDetails',par).then(function(data){
                    callback(data);
                });
            },
            getTrainComments:function(par,callback){//获取培训评论列表
                CommonService.getJsonData('api/Train/TrainComments',par).then(function(data){
                    callback(data);
                });
            },
            addComments:function(par,callback){ //添加评论
                CommonService.getJsonData('api/Train/AddComments',par).then(function(data){
                    console.log(par);
                    callback(data);
                });
            },
            signed:function(par,callback){//签到
                CommonService.getJsonData('api/Train/TrainSigned',par).then(function(data){
                    callback(data);
                });
            },
            addLikes:function(par,callback){//点赞
                CommonService.getJsonData('api/Train/AddLikes',par).then(function(data){
                    callback(data);
                });
            },
            getExamQuestions:function(par,callback){//获取考试题目
                CommonService.getJsonData('api/Train/GetExamQuestions',par).then(function(data){
                    callback(data);
                });
            },
            saveAnswer:function(par,callback){//保存答题数据
                CommonService.getJsonData('api/Train/SaveAnswer',par).then(function(data){
                    callback(data);
                });
            },
            getExamDetails:function(par,callback){//获取考试答案
                CommonService.getJsonData('api/Train/GetExamDetails',par).then(function(data){
                    callback(data);
                });
            }
        }
    });
});
