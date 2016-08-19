define(['app'], function(app) {
    app.controller('TrainCtrl', function($scope) {

        })
        //培训列表管理
        .controller('TrainListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', 'TrainService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, TrainService) {
            var state = $stateParams.state;

            $scope.parameter = {
                state: parseInt(state),
                userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8
            };
            //console.log($scope.parameter);
            $scope.trainList = [];
            $scope.more = true;

            $scope.openUrl = function(id) {
                $state.go('app.trainDetails', { 'id': id });
            }

            function getTrainList() {
                $ionicLoading.show();
                TrainService.getTrainList($scope.parameter, function(data) {
                    if (data.list != null) {
                        if (data.total <= $scope.parameter.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.trainList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }
                        $scope.trainList = data.list;
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
                    getTrainList();
                } catch (ex) {
                    $scope.more = false;
                }
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
        .controller('TrainDetailsCtrl', ['$rootScope', '$cordovaGeolocation', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', '$cordovaBarcodeScanner', '$timeout', '$window', 'TrainService', 'CommonService', function($rootScope, $cordovaGeolocation, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, $cordovaBarcodeScanner, $timeout, $window, TrainService, CommonService) {
            var id = $stateParams.id;
            $scope.parameter = { id: parseInt(id) };

            $scope.trainModel = {
                id: 0,
                name: '',
                lecturer: '',
                number: 0,
                datetime: '',
                desc: '',
                address: '',
                imgUrl: './img/learn/play.png',
                state: 0,
                score: 0,
                likes: 0,
                isAssessment: true, //是否需要导师评估
                isExamination: true //是否需要考试
            };
            $scope.goBack = function() { //返回
                //$ionicHistory.goBack();
                $window.location = '#/app/train/not/0';
            }
            $ionicLoading.show();
            TrainService.getTrainDetails($scope.parameter, function(data) {
                if (data != null) {
                    $scope.trainModel = data;
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
                    if (data.list != null) {
                        if (data.total <= $scope.commentPar.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.commentsList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }
                        $scope.commentsList = data.list;
                    }
                    $scope.$broadcast('scroll.infiniteScrollComplete');
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
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.commentPar.page = 1;
                $scope.commentsList = [];
                getTrainComments();
                $scope.$broadcast('scroll.refreshComplete');
            };
            $scope.commentsModel = {
                id: $scope.parameter.id,
                userId: parseInt($rootScope.userId),
                content: ''
            };

            $scope.addComments = function(commentsModel) { //添加评论
                if (commentsModel.content == '') {
                    CommonService.showToast('请输入评论内容!', 2000);
                    return;
                }

                $ionicLoading.show();
                TrainService.addComments($scope.commentsModel, function(data) {
                    if (data != null) {
                        CommonService.showToast(data.message, 2000);
                        if (data.state > 0) {
                            var a = $timeout(function() {
                                return 'angular'
                            }, 2000);
                            a.then(function(data) {
                                getTrainComments();
                            }, function(data) {
                                //console.log(data)
                            });
                        }
                        return;
                    }
                    $ionicLoading.hide();
                });
            }

            $scope.signed = function() { //签到
                $cordovaBarcodeScanner.scan().then(function(imageData) {
                    var value = imageData.text;
                    if (imageData.cancelled == true) {

                    } else if ('' == value) {
                        CommonService.showToast('扫码失败，请重新扫码！', 2000);
                    } else {
                        $ionicLoading.show();
                        TrainService.signed({ "id": $scope.commentPar.id, "code": value, "userId": parseInt($rootScope.userId), "landMark": "" }, function(data) {
                            if (data != null) {
                                if (data.state != 2) {
                                    CommonService.showToast(data.message, 2000);

                                } else {
                                    CommonService.showToast(data.message, 2000, 'app.trainDetails', { 'id': $scope.parameter.id });
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
                    TrainService.addLikes({ "id": $scope.commentPar.id, "userId": parseInt($rootScope.userId) }, function(data) {
                        if (data != null) {
                            CommonService.showToast(data.message, 2000);
                            return;
                        }
                        $ionicLoading.hide();
                    });
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
        .controller('TrainExamCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', 'TrainService', 'CommonService', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, TrainService, CommonService) {
            var id = $stateParams.id; //培训ID
            var questType = $stateParams.questType; //题库类型

            $scope.parameter = { id: parseInt(id), userId: parseInt($rootScope.userId), questType: questType };

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
                var noAnswerModel = { type: 0, count: 0 };
                $scope.noAnswerList = [];
                for (var n = 1; n <= 3; n++) {
                    noAnswerModel = { type: n, count: 0 };
                    $scope.noAnswerList.push(noAnswerModel);
                }
                $scope.answerList = { id: $scope.parameter.id, userId: $scope.parameter.userId, questType: $scope.parameter.questType, list: [] };
                var flag = false;

                if (questionsList != null) {
                    $scope.answer = [];
                    //console.log(questionsList);
                    for (var i = 0; i < questionsList.length; i++) {
                        var type = questionsList[i].type;
                        for (var j = 0; j < questionsList[i].subjects.length; j++) {
                            var answerModel = { id: 0, check: '', type: 0 };

                            switch (type) {
                                case 1:
                                    {
                                        var checkValue = questionsList[i].subjects[j].checked;
                                        var id = questionsList[i].subjects[j].id;

                                        if (checkValue == '') {
                                            flag = true;
                                            $scope.noAnswerList[0].count += 1;
                                        } else {
                                            answerModel = { id: id, check: checkValue, type: type };
                                            $scope.answerList.list.push(answerModel);
                                        }
                                        break;
                                    }
                                case 2:
                                    {
                                        var checkValue = '';
                                        var id = questionsList[i].subjects[j].id;

                                        for (var d = 0; d < questionsList[i].subjects[j].options.length; d++) {
                                            var check = questionsList[i].subjects[j].options[d].checked;
                                            if (check !== '' && check == true) {
                                                checkValue += questionsList[i].subjects[j].options[d].value;
                                            }
                                        }
                                        if (checkValue == '') {
                                            flag = true;
                                            $scope.noAnswerList[1].count += 1;
                                        } else {
                                            answerModel = { id: id, check: checkValue, type: type };
                                            $scope.answerList.list.push(answerModel);
                                        }
                                        break;
                                    }
                                case 3:
                                    {
                                        var checkValue = '';
                                        var id = questionsList[i].subjects[j].id;
                                        var content = questionsList[i].subjects[j].content;
                                        if (content == '') {
                                            flag = true;
                                            $scope.noAnswerList[2].count += 1;
                                        } else {
                                            answerModel = { id: id, check: content, type: type };
                                            $scope.answerList.list.push(answerModel);
                                        }
                                        break;
                                    }
                            }
                            // if (flag)
                            //     break;
                        }
                    }
                }
                var msg = '';
                if (flag) {
                    for (var n = 0; n < $scope.noAnswerList.length; n++) {
                        var count = $scope.noAnswerList[n].count;
                        var type = $scope.noAnswerList[n].type;

                        switch (type) {
                            case 1:
                                {
                                    if (count > 0) {
                                        msg += "选择题,你有" + count + "道题没有答;<br>";
                                    }
                                    break;
                                }
                            case 2:
                                {
                                    if (count > 0) {
                                        msg += "多选题,你有" + count + "道题没有答;<br>";
                                    }
                                    break;
                                }
                            case 3:
                                {
                                    if (count > 0) {
                                        msg += "简答题,你有" + count + "道题没有答;<br>";
                                    }
                                    break;
                                }
                        }

                    }
                }
                if (msg == '') {
                    msg = '你确定要提交?';
                } else {
                    msg += '你确定要提交?';
                }
                // 确认弹出框
                $scope.showConfirm = function() {
                    var confirmPopup = $ionicPopup.confirm({
                        title: '温馨提示',
                        template: msg,
                        cancelText: '取消',
                        okText: '确定'
                    }).then(function(res) {
                        if (res) {
                            if ($scope.answerList.list.length > 0) {
                                $ionicLoading.show();
                                TrainService.saveAnswer($scope.answerList, function(data) {
                                    //console.log(JSON.stringify($scope.answerList));
                                    if (data != null) {
                                        if ($scope.parameter.questType == 1 || $scope.parameter.questType == 3 || $scope.parameter.questType == 4)
                                            CommonService.showToast(data.message, 2000, 'app.trainDetails', { 'id': $scope.parameter.id });
                                        else
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

            $scope.parameter = { id: parseInt(id), userId: parseInt($rootScope.userId), questType: questType };

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
