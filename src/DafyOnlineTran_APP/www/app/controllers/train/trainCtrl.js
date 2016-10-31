/**
 * Created by tianxc on 16-8-16.
 */
define(['app'], function(app) {
    app.controller('TrainCtrl', ['$state','$location', '$scope','$window', function($state,$location, $scope,$window) {

        }])
        //培训列表管理
        .controller('TrainListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', 'TrainService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, TrainService) {
            var state; // == 0 ? '0,1,2' : '3';
            //console.log('state='+state);
            if ($stateParams.state == 0 && $rootScope.role == 'x') {
                state = '0,1,2';
            } else if ($stateParams.state != 0 && $rootScope.role == 'x') {
                state = '3';
            } else if ($stateParams.state == 0 && $rootScope.role == 't') {
                state = '0,1';
            } else if ($stateParams.state != 0 && $rootScope.role == 't') {
                state = '2,3';
            }
            $scope.isShow = $rootScope.role == 'x' ? true : false;


            $scope.parameter = {
                state: state,
                //userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8
            };
            //console.log($scope.parameter);
            $scope.trainList = [];
            $scope.more = true;

            $scope.openUrl = function(id) {
                //alert('openUrl id'+id);
                $state.go('app.trainDetails', { 'id': id });
            }

            function getTrainList() {
                $ionicLoading.show();
                TrainService.getTrainList($scope.parameter, function(data) {
                    if (data != null && data.list != null) {
                        if (data.total <= $scope.parameter.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.trainList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }
                        $scope.trainList = data.list;
                    } else {
                        $scope.more = false;
                    }
                    //console.log($scope.learnList);
                    //$scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.parameter.page++;
                    $ionicLoading.hide();
                });
            };
            //加载更多
            $scope.loadMore = function() {
                try {
                    getTrainList();
                } catch (ex) {
                    $scope.more = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.parameter.page = 1;
                $scope.trainList = [];
                getTrainList();
                $scope.$broadcast('scroll.refreshComplete');
            };
        }])
        //培训详情信息
        .controller('TrainDetailsCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', '$cordovaBarcodeScanner', '$timeout', '$window','$ionicHistory','TrainService', 'CommonService', 'HubService', 'Settings', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, $cordovaBarcodeScanner, $timeout, $window,$ionicHistory,TrainService, CommonService, HubService, Settings) {
            var id = $stateParams.id;
            $scope.parameter = { id: parseInt(id) };
            $rootScope.finishAnswerType = '';
            $rootScope.isFinishAnswer = '3,';
            //'$cordovaGeolocation'

            var hubStart = HubService.start();

            $scope.headImgUrl = Settings.deBug == true ? Settings.devUploadImgUrl : Settings.headImgUrl;

            $scope.trainModel = {
                id: 0,
                name: '',
                lecturer: '',
                number: 0,
                datetime: '',
                desc: '',
                address: '',
                imgUrl: './img/train/train_bank.png',
                state: 0,
                score: 0,
                likes: 0,
                isAssessment: true, //是否需要导师评估
                isExamination: true, //是否需要考试
                role: $rootScope.role,
                finishAnswerType: $rootScope.finishAnswerType /// 1:考试   2:需求调研   3:培训反馈  4：导师评估  逗号分隔：1,3
            };

            $scope.goBack = function() { //返回
                $ionicHistory.clearHistory();
                $window.location = '#/app/train/not/0';

                //$state.transitionTo('app.train',{}, {reload: true});
                //console.log($state.current);
                //$state.go('app.train.not',{'state':0},{reload:true});
            }

            $ionicLoading.show();
            TrainService.getTrainDetails($scope.parameter, function(data) {
                if (data != null) {
                    //alert(data.imgUrl);
                    $scope.trainModel = data;
                    $scope.trainModel.role = $rootScope.role;
                    $rootScope.finishAnswerType = data.finishAnswerType;

                    if (data.state == 3)
                        $rootScope.isFinishAnswer = true;
                    else {
                        if (data.isAssessment == true) {
                            $rootScope.isFinishAnswer += '4,';
                        }
                        if (data.isExamination == true) {
                            $rootScope.isFinishAnswer += '1,';
                        }
                    }
                    //console.log('$rootScope.isFinishAnswer=' + $rootScope.isFinishAnswer);
                }
                $ionicLoading.hide();
            });

            // 确认弹出框
            $scope.showConfirm = function(questType) {
                var confirmPopup = $ionicPopup.confirm({
                    title: '提示',
                    template: '是否认同培训?',
                    cancelText: '不认同',
                    okText: '认同'
                }).then(function(res) {
                    if (res) {
                        $state.go('app.exam', { 'questType': questType, 'id': $scope.parameter.id });
                    }
                });
            };
            $scope.operUrl = function(questType) {
                $state.go('app.exam', { 'questType': questType, 'id': $scope.parameter.id });
            }
            $scope.examDetails = function(questType) { //查看考试详情
                $state.go('app.examDetails', { 'questType': questType, 'id': $scope.parameter.id });
            }
            $scope.commentPar = {
                id: parseInt(id),
                page: 1,
                pageSize: 8
            };
            $scope.commentsList = [];
            $scope.more = true;

            function getTrainComments() {

                $ionicLoading.show();
                TrainService.getTrainComments($scope.commentPar, function(data) {
                    if (data != null && data.list != null) {
                        if (data.total <= $scope.commentPar.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.commentsList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }
                        for (var j = 0; j <data.list.length; j++) {
                            $scope.commentsList.push(data.list[j]);
                        }
                    } else {
                        $scope.more = false;
                    }
                    $scope.commentPar.page++;
                    $ionicLoading.hide();
                });
            }
            //加载更多
            $scope.loadMore = function() {
                try {
                    getTrainComments();
                } catch (ex) {
                    $scope.more = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.commentPar.page = 1;
                $scope.commentsList = [];
                getTrainComments();
                $timeout(function() {
                   $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
            $scope.commentsModel = {
                id: $scope.parameter.id,
                content: ''
            };
            $scope.isJoinGroup = false;

            $scope.joinGroup = function() { //加入组
                try {
                    HubService.invoke('joinGroup', $scope.parameter.id, function(data) {
                        $scope.isJoinGroup = true;
                    }).fail(function(error) {
                        CommonService.showToast('加入服务组出错!', 2000);
                    });
                } catch (e) {

                }
            }
            $scope.joinGroup();

            HubService.on("receiveComments", function(data) { //评论回调
                $scope.commentsList.splice(0, 0, data);
            });

            $scope.addComments = function(commentsModel) { //添加评论
                if (commentsModel.content == '') {
                    CommonService.showToast('请输入评论内容!', 2000);
                    return;
                }
                if (commentsModel.content.length>100) {
                    CommonService.showToast('您输入评论内容过多,最多输入100个字!', 2000);
                    return;
                }

                if (!$scope.isJoinGroup) {
                    $scope.joinGroup();
                }

                $ionicLoading.show();
                try {
                    HubService.invoke('addComments', $scope.commentsModel, function(data) {
                        if (data != null && data.state > 0) {
                            $scope.commentsModel.content = '';
                            CommonService.showToast(data.message, 2000);
                            return;
                        }
                    });
                    $ionicLoading.hide();
                } catch (e) {
                    CommonService.showToast('连接摧送服务器出错了!', 2000);
                    $ionicLoading.hide();
                }
            }

            $scope.signed = function() { //签到
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    var value = imageData.text;
                    if (imageData.cancelled == true) {

                    } else if ('' == value) {
                        CommonService.showToast('扫码失败，请重新扫码！', 2000);
                    } else {
                        $ionicLoading.show();
                        TrainService.signed({ "id": $scope.commentPar.id, "code": value, "landMark": "" }, function(data) { //"userId": parseInt($rootScope.userId), 
                            if (data != null) {
                                if (data.state != 2) {
                                    CommonService.showToast(data.message, 2000);

                                } else {
                                    CommonService.showGoToast(data.message, 2000, 'app.trainDetails', { 'id': $scope.parameter.id });
                                }
                                return;
                            }
                            $ionicLoading.hide();
                        });
                    }
                }, function(error) {
                    CommonService.showToast('扫码出错，请重新扫码！', 2000);
                });
            }
            $scope.addLikes = function() { //点赞
                    $ionicLoading.show();
                    TrainService.addLikes({ "id": $scope.commentPar.id }, function(data) { //"userId": parseInt($rootScope.userId) 
                        if (data != null && data.state > 0) {
                            $scope.trainModel.likes += 1;
                            CommonService.showToast(data.message, 2000);
                            return;
                        } else {
                            CommonService.showToast(data.message, 2000);
                            return;
                        }
                        //$ionicLoading.hide();
                    });
                    $ionicLoading.hide();
                }
                // $scope.currentPosition = {
                //     latitude: 0,
                //     longitude: 0
                // };

            // function getCurrentPosition() {//获取当前坐标
            //     var posOptions = { timeout: 10000, enableHighAccuracy: true };
            //     $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
            //         //$rootScope.$broadcast('selfLocation:update', position);
            //         $scope.currentPosition.latitude= position.coords.latitude;//纬度
            //         $scope.currentPosition.longitude= position.coords.longitude;//经度
            //         //alert('lat=' + lat + ',mlong=' + mlong);

            //         alert($scope.currentPosition.latitude + "," + $scope.currentPosition.longitude);

            //     }, function(err) {
            //         alert('err' + err);
            //     });
            //     return $scope.currentPosition;
            // }
            // getCurrentPosition();
            //alert(JSON.stringify(postion));
            // $scope.$on('selfLocation:update', function(_, location) {
            //     $scope.currentPosition = {
            //         latitude: location.latitude,
            //         longitude: location.longitude
            //     };
            // });

        }])
        //考试信息
        .controller('TrainExamCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', '$filter', 'TrainService', 'CommonService', 'ComExamService', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, $filter, TrainService, CommonService, ComExamService) {
            var id = $stateParams.id; //培训ID
            var questType = $stateParams.questType; //题库类型

            $scope.parameter = { id: parseInt(id), questType: questType }; //userId: parseInt($rootScope.userId)

            $scope.questionsList = [];
            $scope.data = [];

            $ionicLoading.show();
            TrainService.getExamQuestions($scope.parameter, function(data) {
                if (data != null && data.list != null) {
                    $scope.questionsList = data.list;
                }
                $ionicLoading.hide();
            });
            $scope.subData = function(questionsList) { //保存答题

                $scope.subSaveData = ComExamService.getExamSubData(questionsList);
                $scope.answerList = { id: $scope.parameter.id, questType: $scope.parameter.questType, list: $scope.subSaveData.list.length > 0 ? $scope.subSaveData.list : [] }; //, userId: $scope.parameter.userId
                // 确认弹出框
                $scope.showConfirm = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '温馨提示',
                        template: $scope.subSaveData.msg,
                        cancelText: '取消',
                        okText: '确定'
                    }).then(function(res) {
                        if (res) {
                            if ($scope.answerList.list.length > 0) {
                                $ionicLoading.show();
                                TrainService.saveAnswer($scope.answerList, function(data) {
                                    //console.log(JSON.stringify($scope.answerList));
                                    if (data != null) { //1:考试   2:需求调研   3:培训反馈  4：导师评估
                                        if ($scope.parameter.questType == 1 || $scope.parameter.questType == 3 || $scope.parameter.questType == 4) {

                                            if ($rootScope.finishAnswerType == '' || $filter('endsWith')($rootScope.finishAnswerType, ',') == true)
                                                $rootScope.finishAnswerType += $scope.parameter.questType;
                                            else
                                                $rootScope.finishAnswerType += ',' + $scope.parameter.questType;

                                            // if($filter('endsWith')($rootScope.finishAnswerType, ',') == true){

                                            // }

                                            var isAnswer = $filter('indexOfStr')($rootScope.isFinishAnswer, $rootScope.finishAnswerType);
                                            console.log('indexOfStrindexOfStr=' + isAnswer);
                                            if (isAnswer == true) {
                                                console.log('indexOfStrindexOfStr');
                                                $rootScope.isFinishAnswer = true;
                                            }
                                            //console.log('TrainExamCtrl $rootScope.finishAnswerType='+$rootScope.finishAnswerType);

                                            CommonService.showGoToast(data.message, 2000, 'app.trainDetails', { 'id': $scope.parameter.id });
                                        } else
                                            CommonService.showToast(data.message, 2000);
                                        return;
                                    }
                                    $ionicLoading.hide();
                                });
                            } else {
                                CommonService.showToast('亲,不会一道题都不会吧,请认真作答！', 3000);
                            }
                        }
                    });
                };
                $scope.showConfirm();
            };
        }])
        //考试详情信息
        .controller('TrainExamDetailsCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', 'TrainService', 'CommonService', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, TrainService, CommonService) {
            var id = $stateParams.id; //培训ID
            var questType = $stateParams.questType; //题库类型

            $scope.parameter = { id: parseInt(id), questType: questType }; //, userId: parseInt($rootScope.userId)

            $scope.questionsList = [];
            $scope.data = [];

            $ionicLoading.show();
            TrainService.getExamDetails($scope.parameter, function(data) { //查看考试详情
                if (data != null) {
                    if (data.state > 0) {
                        $scope.questionsList = data.list;
                    } else {
                        CommonService.showToast(data.message, 2000);
                    }
                }
                $ionicLoading.hide();
            });
        }]);
});
