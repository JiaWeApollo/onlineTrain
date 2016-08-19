/**
 * Created by tianxc on 16-7-29.
 */
define(['app'], function(app) {
    app.controller('HomeCtrl', ['$rootScope', '$cordovaGeolocation', '$css', '$scope', '$ionicPopup', '$location', '$sce', '$ionicSlideBoxDelegate', 'HomeService', 'CommonService', function($rootScope, $cordovaGeolocation, $css, $scope, $ionicPopup, $location, $sce, $ionicSlideBoxDelegate, HomeService, CommonService) {

        var userModel = {
            userId: $rootScope.userId
        };
        $scope.bannerList=[];
        HomeService.bannerList(null, function(data) {
            if (data != null) {
                $scope.bannerList = data.list;
                //console.log($scope.bannerList);
                $ionicSlideBoxDelegate.update();
                $ionicSlideBoxDelegate.$getByHandle("slideboximgs").loop(true);
            }
        });
        $scope.homeList=[];
        HomeService.homeList(userModel, function(data) {
            if (data != null) {
                $scope.homeList = data.list;
            }
        });
        // 显示定制弹出框
        $scope.showPopup = function() {
            $scope.data = {}

            // 调用$ionicPopup弹出定制弹出框
            $ionicPopup.show({
                    template: "<input type='password' ng-model='data.wifi'>",
                    title: "入职培训需求调研",
                    subTitle: "您对入职培训有什么需求？",
                    scope: $scope,
                    buttons: [{
                        text: "<b>立即填写</b>",
                        type: "button-default",
                        onTap: function(e) {
                            return $scope.data.wifi;
                        }
                    }]
                })
                .then(function(res) {
                    $scope.status = ["Wi-Fi密码到手了", ":", res].join(" ");
                });
        };
        //$scope.url=$sce.trustAsResourceUrl('http://10.10.72.71:8047/index.html');

        // $scope.openLink = function(url) {
        //     window.open(url);
        // };
        // $scope.versionNumber=JSON.stringify(NetworkService.getDeviceInfo());
        // alert($scope.versionNumber);
        // $scope.versionCode=JSON.stringify(NetworkService.isOnline());
        // alert($scope.versionCode);
        //var json= DeviceService.getDeviceInfo();
        //$scope.deviceInfo='test:'+JSON.stringify(json)+' ~~';

        //清空所有样式
        // $css.removeAll();
        // //加载样式
        //$css.add('lib/angular-bootstrap/bootstrap.min.css');

    }]);
});
