/**
 * Created by tianxc on 16-7-29.
 */
define([
    'app'
], function(app) {
    'use strict';

    app.factory('HomeService',['$http','CommonService',function($http,CommonService) {
        return {
            bannerList: function(par,callback) { //banner列表数据
                CommonService.getJsonData('api/home/BannerList', par).then(function(data) {
                    //console.log(data);
                    callback(data);
                });
            },
            homeList: function(par,callback) {//首页模块列表数据
                CommonService.getJsonData('api/home/HomeList', par).then(function(data) {
                    //console.log(data);
                    callback(data);
                });
            }
        }
    }]);
});
