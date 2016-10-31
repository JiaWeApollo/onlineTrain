/**
 * Created by tianxc on 16-8-3.
 */
define([
    'app'
], function(app) {
    'use strict';

    app.factory('LearnService', ['$q', '$http', 'CommonService',function($q, $http, CommonService) {
        return {
            getLearnTypeList: function(par, callback) { //获取学习模块类型列表
                CommonService.getJsonData('api/Learn/LearnTypeList', par).then(function(data) {
                    callback(data);
                });
            },
            getLearnList: function(par, callback) { //获取学习课程列表
                CommonService.getJsonData('api/Learn/LearnList', par).then(function(data) {
                    //console.log(data);
                    callback(data);
                });
            },
            getLearnDetails: function(par, callback) { //获取学习课程详情
                CommonService.getJsonData('api/Learn/LearnDetails', par).then(function(data) {
                    callback(data);
                });
            },
            addPlayRecord:function(par,callback){ //添加播放记录
                CommonService.getJsonData('api/Learn/AddPlayRecord', par).then(function(data) {
                    callback(data);
                });
            }
        }
    }]);
});
