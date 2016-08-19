define(['app'], function(app) {
    app.controller('LearnTypeCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', 'LearnService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, LearnService) {
            $ionicLoading.show();
            LearnService.getLearnTypeList(null, function(data) {
                if (data != null) {
                    $scope.learnTypeList = data.list;
                }
                $ionicLoading.hide();
            });
            $scope.openUrl = function(id) {
                $state.go('app.learnList', { 'id': id });
            }
        }])
        .controller('LearnListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', '$timeout','$window', 'LearnService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, $timeout,$window,LearnService) {
            var id = $stateParams.id;
            $scope.parameter = {
                id:parseInt(id),
                userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8, 
            };
            $scope.goBack = function() { //返回
                $window.location = '#/app/learn';
            }
            $scope.learnList = [];
            $scope.more = true;
            $scope.rowsCount = 0;

            $scope.openUrl = function(id) {
                $state.go('app.learnDetails', {'typeId':$scope.parameter.id,'id': id});
            }

            function getLearnList() {
                $ionicLoading.show();
                LearnService.getLearnList($scope.parameter, function(data) {
                    if (data.list != null) {
                        if (data.total <= $scope.parameter.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.learnList.length) * 2 >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }


                        if (data.list.length % 2 == 0) {
                            $scope.rowsCount = parseInt(data.list.length / 2);
                        } else {
                            $scope.rowsCount = parseInt((data.list.length / 2)) + 1;
                        }
                        var key = 0;
                        for (var i = 0; i < $scope.rowsCount; i++) {
                            var learnModel = { key: i, items: [] };

                            for (var j = 0; j < 2; j++) {
                                if (data.list[key] != undefined) {
                                    learnModel.items.push(data.list[key]);
                                    key += 1;
                                }
                            }
                            $scope.learnList.push(learnModel);
                        }
                    }
                    //console.log($scope.learnList);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.parameter.page++;
                    $ionicLoading.hide();
                });
            };
            //加载更多
            $scope.loadMore = function() {
                try {
                    getLearnList();
                } catch (ex) {
                    $scope.more = false;
                }
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.parameter.page = 1;
                $scope.learnList = [];
                getLearnList();
                $scope.$broadcast('scroll.refreshComplete');
            };

        }])
        .controller('LearnDetails', ['$rootScope', '$scope', '$state','$location', '$cordovaInAppBrowser', '$stateParams', '$ionicLoading', '$ionicHistory', 'LearnService','CommonService', function($rootScope, $scope, $state,$location,$cordovaInAppBrowser, $stateParams, $ionicLoading, $ionicHistory, LearnService,CommonService) {
            $scope.typeId=$stateParams.typeId;

            $scope.goBack = function() { //返回
                //$ionicHistory.goBack();
                //window.history.back();
                $location.url('/app/learn/learnList/'+$scope.typeId);
            }
            var id = $stateParams.id;
            $scope.parameter = {
                id:parseInt(id), //课程ID
                userId: $rootScope.userId, //用户ID
            };
            $scope.learnModel = {
                id: 0,
                name: '',
                hits: 0,
                number: 0,
                points: 0,
                desc: '',
                imgUrl: './img/learn/play.png',
                playUrl: ''
            };

            $ionicLoading.show();
            LearnService.getLearnDetails($scope.parameter, function(data) {
                if (data != null) {
                    $scope.learnModel = data;
                }
                $ionicLoading.hide();
            });
            var options = {
                location: 'yes',
                clearcache: 'yes',
                toolbar: 'no'
            };

            $scope.play = function(url) {//添加播放记录
                console.log($scope.parameter);

                LearnService.addPlayRecord($scope.parameter, function(data) { 
                    if (data == null) {
                       CommonService.showToast("增加播放次数失败",2000);
                    }else if(data.state<=0){
                        CommonService.showToast(data.message,2000);
                    }
                });
                $cordovaInAppBrowser.open(url, '_system', options).then(function(event) {
                   
                })
                .catch(function(event) {
                   
                });
            }
        }]);
});
