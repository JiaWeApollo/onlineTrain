/**
 * Created by tianxc on 16-8-2.
 */
define(['angular'], function(angular) {

    var commonService = angular.module('app.commonService', ['ngCordova']);

    commonService.service('NetworkService', ['$q', '$cordovaNetwork', '$cordovaDevice', '$cordovaAppVersion', function($q, $cordovaNetwork, $cordovaDevice, $cordovaAppVersion) {
            return {
                getNetworkType: function() { // 获取网络类型
                    /*
                     Connection.UNKNOWN
                     Connection.ETHERNET //以太网
                     Connection.WIFI    WiFi
                     Connection.CELL_2G
                     Connection.CELL_3G
                     Connection.CELL_4G
                     Connection.CELL  //蜂窝网络
                     Connection.NONE
                     */
                    var deferred = $q.defer();
                    document.addEventListener("deviceready", function() {
                        deferred.resolve($cordovaNetwork.getNetwork())
                    }, false);
                    return deferred.promise;
                },
                isOnline: function() { // 是否启用网络
                    var deferred = $q.defer();
                    document.addEventListener("deviceready", function() {
                        deferred.resolve($cordovaNetwork.isOnline());
                    }, false);
                    return deferred.promise;
                },
                getDeviceInfo: function() { //获取用户设备信息JSON
                    // platform:平台
                    // version:系统版本
                    // uuid:设备ID
                    // model:手机型号
                    // manufacturer:制造商
                    var deferred = $q.defer();
                    document.addEventListener("deviceready", function() {
                        deferred.resolve($cordovaDevice.getDevice());
                    }, false);
                    return deferred.promise;
                },
                getVersionNumber: function() { //获取版本号
                    var deferred = $q.defer();
                    $cordovaAppVersion.getVersionNumber().then(function(version) {
                        deferred.resolve(version);
                    });
                    return deferred.promise;
                },
                getVersionCode: function() { //获取版本名称
                    var deferred = $q.defer();
                    $cordovaAppVersion.getVersionCode().then(function(build) {
                        deferred.resolve(build);
                    });
                    return deferred.promise;
                }
            }
        }])
        .service('CommonService', ['$q', '$ionicLoading', '$timeout', '$http','$state','Settings','$localStorageUsage', function($q, $ionicLoading, $timeout, $http,$state,Settings,$localStorageUsage) {
            var serviceBase = Settings.apiServiceBaseUrl;

            function showToast(string, duration) {
                $ionicLoading.show({
                    template: string,
                    noBackdrop: true
                });
                $timeout(function() {
                    $ionicLoading.hide();
                }, duration);
            }

            return {
                showToast: function(string, duration) { //消息提示框
                    showToast(string,duration);
                },
                showToast:function(string,duration,url,par){//消息提示,后自动跳转
                    $ionicLoading.show({
                        template: string,
                        noBackdrop: true
                    });
                    $timeout(function() {
                        $ionicLoading.hide();
                        $state.go(url,par);
                    }, duration);
                },
                getAuthorizationData: function() { //获取用户信息
                    var authData = $localStorageUsage.getItem('authorizationData');
                    if (authData!=null) {
                        authData = eval('(' + authData + ')');
                    } else {
                        authData = null;
                    }
                    return authData;
                },
                setStorageItem: function(key, value) { //存储数据
                    $localStorageUsage.setItem(key, value,1);
                },
                getStorageItem: function(key) { //获取本地存储数据
                    return $localStorageUsage.getItem(key);
                },
                removeStorageItem:function(key){//删除本地存储数据
                    $localStorageUsage.removeItem(key);
                },
                getJsonData: function(url, par) { //获取JSON数据
                    var deferred = $q.defer();
                    var num=Settings.version;
                    var dataJs = Settings.deBug === true ? '.json?v='+num: '';

                    $http({
                        url: serviceBase + url + dataJs,
                        method: (Settings.deBug === true ? "get" : "post"),
                        data: par
                    }).success(function(data) {
                        deferred.resolve(data);
                    }).error(function(error) {
                        showToast('获取数据出现错误!',5000);
                        deferred.reject(error);
                    }).finally(function() {

                    });
                    return deferred.promise;
                }
            }
        }]);

    return commonService;
});
