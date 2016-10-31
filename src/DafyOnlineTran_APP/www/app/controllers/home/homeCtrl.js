/**
 * Created by tianxc on 16-7-29.
 */
define(['app'], function(app) {
    app.controller('HomeCtrl', ['$rootScope','$scope', '$ionicPopup', '$location', '$sce', '$ionicSlideBoxDelegate', 'HomeService', 'CommonService', function($rootScope, $scope, $ionicPopup, $location, $sce, $ionicSlideBoxDelegate, HomeService, CommonService) {

        //alert('HomeCtrl $rootScope.token='+$rootScope.token);
        var userModel = null;
        $scope.bannerList = [];

        if (CommonService.getStorageItem('bannerListData') == null || CommonService.getStorageItem('bannerListData') === 'undefined') { //本地化存储
            //$ionicLoading.show();
            HomeService.bannerList(null, function(data) {
                if (data != null) {
                    $scope.bannerList = data.list;
                    $ionicSlideBoxDelegate.update();
                    $ionicSlideBoxDelegate.$getByHandle("slideboximgs").loop(true);

                    CommonService.setStorageItem('bannerListData', JSON.stringify(data.list));
                }
            });
        } else {
            $scope.bannerList = JSON.parse(CommonService.getStorageItem('bannerListData'));
        }

        $scope.homeList = [];
        // if (CommonService.getStorageItem('homeListData') == null) { //本地化存储
        HomeService.homeList(userModel, function(data) {
            if (data != null) {
                $scope.homeList = data.list;
                //CommonService.setStorageItem('homeListData', JSON.stringify(data.list));
            } else {
                var data = { list: [{ 'code': 'train', 'train': [] }, { 'code': 'learn', 'learn': [] }, { 'code': 'survey', 'survey': [] }] };
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
