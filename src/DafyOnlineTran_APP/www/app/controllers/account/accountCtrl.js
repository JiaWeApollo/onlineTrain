/**
 * Created by tianxc on 16-8-3.
 */
define(['app'], function(app) {
    app.controller('AccountCtrl', ['$css', '$scope', '$rootScope', '$state', '$ionicActionSheet', '$ionicLoading', 'CommonService', 'AccountService', 'Settings', function($css, $scope, $rootScope, $state, $ionicActionSheet, $ionicLoading, CommonService, AccountService, Settings) {
            //$css.add('lib/angular-bootstrap/bootstrap.min.css');
            $scope.userId = $rootScope.userId;
            $scope.userName = $rootScope.userName;
            $scope.role = $rootScope.role;

            $scope.headImg = "./img/account/head-bg.png";
            $scope.courses = 0; //我的课程数
            $scope.points = 0; //我的积分
            $scope.likes = 0; //我的点赞数

            $scope.user = null; //{userId: parseInt($rootScope.userId)};

            $scope.initUserInfo = function() {
                $ionicLoading.show();
                AccountService.getUserInfo($scope.user, function(data) {
                    //console.log(data);
                    if (data != null) {
                        var avatar = CommonService.getStorageItem('AvatarUrlData');
                        if (avatar == null) {
                            if (data.headImg != null)
                                CommonService.setStorageItem('AvatarUrlData', data.headImg);
                            else
                                CommonService.setStorageItem('AvatarUrlData', $scope.headImg);
                        }
                        //$scope.headImg=data.headImg;
                        $scope.headImg = CommonService.getStorageItem('AvatarUrlData');
                        $scope.courses = data.courses;
                        $scope.points = data.points;
                        $scope.isShowPoints = $rootScope.role == 'x' ? true : false;
                        $scope.likes = data.likes;
                        $scope.isShowLikes = $rootScope.role == 't' ? true : false;
                    }
                    $ionicLoading.hide();
                });
            }
            $scope.initUserInfo();
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.initUserInfo();
                $scope.$broadcast('scroll.refreshComplete');
            };

            $scope.uploadImgUrl = Settings.deBug == true ? Settings.devUploadImgUrl : Settings.headImgUrl;
            $scope.showActionSheet = function() {
                $scope.returnedText = '';
                var hideSheet = $ionicActionSheet.show({
                    buttons: [
                        { text: '选择图片' },
                        { text: '拍照' }
                    ],
                    cancelText: '取消',
                    cancel: function() {
                        return true;
                    },
                    buttonClicked: function(index) {

                        var params = {}; //{'Authorization':'Bearer ' + $rootScope.token};// { UserId: $rootScope.userId };

                        if (index == 0) { //选择图片
                            CommonService.getPicture(200, 200).then(function(imageURI) {
                                //alert('imageURI='+imageURI);
                                if (imageURI != undefined) {
                                    AccountService.updateAvatar(imageURI, params, function(result) {
                                        //alert(result);
                                        var data = JSON.parse(result.response);
                                        if (data.state > 0) {
                                            CommonService.showToast(data.Message, 2000);
                                            //$scope.headImg = $scope.uploadImgUrl + data.HeadImgUrl;
                                            $scope.headImg = data.HeadImgUrl;
                                            CommonService.setStorageItem('AvatarUrlData', data.HeadImgUrl);
                                            var image = document.getElementById('headImg');
                                            image.src = $scope.headImg;
                                        } else {
                                            CommonService.showToast(data.Message, 3000);
                                        }
                                    });
                                }
                                return true;
                            }).catch(function(err) {
                                CommonService.showToast('选择图片出错了!' + err, 2000);
                            });
                        } else {

                            CommonService.getCamera(200, 200).then(function(imageURI) {
                                if (imageURI != undefined) {
                                    AccountService.updateAvatar(imageURI, params, function(result) {
                                        var data = JSON.parse(result.response);
                                        if (data.state > 0) {
                                            CommonService.showToast(data.message, 2000);
                                            //$scope.headImg = $scope.uploadImgUrl + data.HeadImgUrl;
                                            $scope.headImg = data.HeadImgUrl;
                                            CommonService.setStorageItem('AvatarUrlData', $scope.headImg);
                                            var image = document.getElementById('headImg');
                                            image.src = $scope.headImg;
                                        } else {
                                            CommonService.showToast(data.message, 3000);
                                        }
                                    });
                                }
                                return true;
                            }).catch(function(err) {
                                CommonService.showToast('拍照获取图片出错了!' + err, 2000);
                            });
                        }
                    }
                });
            };
        }])
        //登录
        .controller('LoginCtrl', ['$rootScope', '$css', '$scope', '$state', '$ionicLoading', 'CommonService', 'AccountService','NetworkService','HubService','JPushService', function($rootScope, $css, $scope, $state, $ionicLoading, CommonService, AccountService,NetworkService,HubService,JPushService) {

            var authenticationData = CommonService.getAuthorizationData();
            if (authenticationData === null) {
                $rootScope.isLogin = false;
            } else {
                $rootScope.isLogin = true;
                $state.go('app.home');
                return;
            }

            var device=NetworkService.getDeviceInfo();

            $scope.user = {
                userId: '',
                password: '',
                uuid:device.$$state.value.uuid
            };

            $scope.login = function(user) { //登录

                if (user.userId == '') {
                    CommonService.showToast('请输入用户名!', 2000);
                    return;
                } else if (!/^[0-9]*$/.test(user.userId)) {
                    CommonService.showToast('用户名只能输入数字!', 2000);
                    return;
                }
                if (user.password == '') {
                    CommonService.showToast('请输入密码!', 2000);
                    return;
                }
                if(user.userId.toString().indexOf('8')!==0 && user.userId.toString().indexOf('1')!==0){
                    CommonService.showToast(user.userId.toString()+'该帐号无法登录该系统!', 2000);
                    return;
                }

                $ionicLoading.show();
                AccountService.login(user, function(data) {
                    if (data != null && data.state == 1) {
                        CommonService.setStorageItem('authorizationData', JSON.stringify(data));
                        $rootScope.userId = data.userId;
                        $rootScope.token = data.token;
                        $rootScope.userName = data.userName;

                        var roleId=data.roleId;

                        var i = data.userId.toString().indexOf('8');
                        if (i == 0) {
                            $rootScope.role = 'x';
                        } else {
                            $rootScope.role = 't';
                            roleId='Teacher';
                        }
                        $ionicLoading.hide();
                        JPushService.setTagsWithAlias(roleId,user.uuid);

                        $state.go('app.home');
                        HubService.start();
                    } else {
                        CommonService.removeStorageItem('authorizationData');
                        CommonService.showToast(data.message, 2000);
                    }
                });
            };
        }])
        //注册
        .controller('RegisterCtrl', ['$rootScope', '$css', '$scope', '$state', '$stateParams', '$ionicLoading', '$location', '$interval', 'CommonService', 'AccountService', function($rootScope, $css, $scope, $state, $stateParams, $ionicLoading, $location, $interval, CommonService, AccountService) {

            $scope.user = {
                userId: '',
                mobile: '',
                verifyCode: '',
                password: ''
            };
            var state = $stateParams.state;
            $scope.state = state;
            $scope.title = (state === 'c' ? '忘记密码' : '注册');

            $scope.isShow = function(s) {
                if (state === s) {
                    return true;
                } else {
                    return false;
                }
            }
            $scope.doRegister = function(user) { //注册或重置密码

                if (user.userId === null || user.userId === '') {
                    CommonService.showToast('销售人员ID不能为空!', 2000);
                    return
                }
                if (user.mobile === undefined || user.mobile === '') {
                    CommonService.showToast('手机号码输入错误!', 2000);
                    return
                }
                if (user.verifyCode === null || user.verifyCode === '') {
                    CommonService.showToast('验证码不能为空!', 2000);
                    return
                }
                if (user.password === null || user.password === '') {
                    CommonService.showToast('密码不能为空!', 2000);
                    return
                }
                if (user.password.length < 6) {
                    CommonService.showToast('密码长度必须大于6位!', 2000);
                    return
                }
                $ionicLoading.show();
                if (state === 'r') {
                    AccountService.register(user, function(data) {
                        $ionicLoading.hide();
                        if (data != null && data.state == 1) {
                            CommonService.setStorageItem('authorizationData', JSON.stringify(data));
                            $rootScope.userId = data.userId;
                            $rootScope.token = data.token;
                            $rootScope.userName = data.userName;

                            var i = data.userId.toString().indexOf('8');
                            if (i == 0) {
                                $rootScope.role = 'x';
                                CommonService.setStorageItem('Role', 'x');
                            } else {
                                $rootScope.role = 't';
                                CommonService.setStorageItem('Role', 't');
                            }

                            $state.go('app.home');
                        } else {
                            CommonService.showToast(data.message, 2000);
                        }
                    });
                }
                if (state === 'c') {
                    AccountService.resetPwd({ mobile: user.mobile, verifyCode: user.verifyCode, password: user.password }, function(data) {
                        $ionicLoading.hide();
                        if (data != null && data.state == 1) {
                            var authData = window.localStorage.getItem('authorizationData');
                            if (authData !== null) {
                                CommonService.removeStorageItem('authorizationData');
                            }
                            //$state.go('login');
                            $location.path('/login');
                        } else {
                            CommonService.showToast(data.message, 2000);
                        }
                    });
                }
            };
            $scope.verifyContent = "获取验证码";
            $scope.paraevent = true;

            $scope.getVerifyCode = function(user) { ///获取验证码
                if ($scope.paraevent === false) {
                    return;
                }
                if (user.userId === null || user.userId === '') {
                    CommonService.showToast('销售人员ID不能为空!', 2000);
                } else if (user.mobile === undefined || user.mobile === '') {
                    CommonService.showToast('手机号码错误,请重新输入!', 2000);
                } else {
                    $ionicLoading.show();
                    AccountService.getVerifyCode({ userId: user.userId, mobile: user.mobile }, function(data) {
                        $ionicLoading.hide();
                        if (data != null && data.state == 1) {
                            CommonService.showToast(data.message, 2000);
                        } else {
                            CommonService.showToast(data.message, 2000);
                        }
                        var second = 60,
                            timePromise = undefined;
                        timePromise = $interval(function() {
                            if (second <= 0) {
                                $interval.cancel(timePromise);
                                timePromise = undefined;

                                second = 60;
                                $scope.verifyContent = "重发验证码";
                                $scope.paraevent = true;
                            } else {
                                $scope.verifyContent = second + "秒后可重发";
                                $scope.paraevent = false;
                                second--;

                            }
                        }, 1000, 100);
                    });
                }
            };
        }])
        //我的课程列表
        .controller('MyLearnListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', '$timeout', '$window', 'LearnService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, $timeout, $window, LearnService) {
            var code = $stateParams.code;

            $scope.parameter = {
                id: 0,
                code: code,
                //userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8,
            };
            $scope.goBack = function() { //返回
                $window.location = '#/app/account';
            }
            $scope.learnList = [];
            $scope.more = true;
            $scope.rowsCount = 0;

            $scope.openUrl = function(id) {
                $state.go('app.myLearnDetails', { 'code': $scope.parameter.code, 'id': id });
            }

            function getLearnList() {
                $ionicLoading.show();
                LearnService.getLearnList($scope.parameter, function(data) {
                    if (data != null && data.list != null) {
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
                    } else {
                        $scope.more = false;
                    }
                    //console.log($scope.learnList);
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
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.parameter.page = 1;
                $scope.learnList = [];
                getLearnList();
                $timeout(function() {
                   $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };

        }])
        //我的课程详情
        .controller('MyLearnDetails', ['$rootScope', '$scope', '$state', '$location', '$cordovaInAppBrowser', '$stateParams', '$ionicLoading', '$ionicHistory', 'LearnService', 'CommonService', function($rootScope, $scope, $state, $location, $cordovaInAppBrowser, $stateParams, $ionicLoading, $ionicHistory, LearnService, CommonService) {
            $scope.code = $stateParams.code;

            $scope.goBack = function() { //返回
                //$ionicHistory.goBack();
                //window.history.back();
                $location.url('/app/myLearn/' + $scope.code + 'v/' + $scope.code);
            }
            var id = $stateParams.id;
            $scope.parameter = {
                id: parseInt(id) //课程ID
                    //userId: $rootScope.userId, //用户ID
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

            $scope.play = function(url) { //添加播放记录
                //console.log($scope.parameter);

                LearnService.addPlayRecord($scope.parameter, function(data) {
                    if (data == null) {
                        CommonService.showToast("增加播放次数失败", 2000);
                    } else if (data.state <= 0) {
                        CommonService.showToast(data.message, 2000);
                    }
                });
                $cordovaInAppBrowser.open(url, '_system', options).then(function(event) {

                    })
                    .catch(function(event) {

                    });
            }
        }])
        //我的培训列表
        .controller('MyTrainListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading','$timeout','TrainService', function($rootScope, $scope, $state, $stateParams, $ionicLoading,$timeout,TrainService) {
            $scope.isSx = $stateParams.state;

            $scope.parameter = {
                state: '-1,0,2,3', //4:已完成培训; 5:取消培训;  6:已申请报销
                //userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8
            };

            $scope.trainList = [];
            $scope.more = true;

            $scope.openUrl = function(id, state) {

                //if (state == -1 || state == 1 || state == 2) {
                $state.go('app.myTrainDetails', { 'id': id,'state':state});
                // }
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
                $timeout(function() {
                   $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
            if ($scope.isSx != '' || $scope.isSx == 1) {
                $scope.doRefresh();
            }
        }])
        //个人设置
        .controller('PersonalCtrl', ['$rootScope', '$css', '$scope', '$state', '$stateParams', '$ionicLoading', '$location', '$ionicPopup', 'CommonService', 'AccountService', function($rootScope, $css, $scope, $state, $stateParams, $ionicLoading, $location, $ionicPopup, CommonService, AccountService) {
            $scope.exitConfirm = function() { //退出APP

                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>退出应用?</strong>',
                    template: '你确定要退出应用吗?',
                    okText: '退出',
                    cancelText: '取消'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        var par = { token: $rootScope.token };
                        //console.log(par);
                        AccountService.signOut(par, function(data) {
                            if (data != null && data.state == 1) {
                                CommonService.removeStorageItem('authorizationData');
                                CommonService.clearStorage();
                                ionic.Platform.exitApp();
                            } else {
                                CommonService.showToast(data.message, 2000);
                            }
                        });
                    }
                });
            };
        }])
        //我获取的积分列表
        .controller('IntegralCtrl', ['$rootScope', '$css', '$scope', '$state', '$stateParams', '$ionicLoading', '$location', '$ionicPopup','$timeout','CommonService', 'AccountService', function($rootScope, $css, $scope, $state, $stateParams, $ionicLoading, $location, $ionicPopup,$timeout,CommonService, AccountService) {
            $scope.parameter = {
                //userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8,
            };

            $scope.integralList = [];
            $scope.more = true;
            $scope.rowsCount = 0;

            function getMyIntegralList() {
                $ionicLoading.show();
                AccountService.getMyIntegralList($scope.parameter, function(data) {
                    //console.log(data);
                    if (data != null && data.list != null) {
                        if (data.total <= $scope.parameter.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.integralList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }

                        $scope.integralList = data.list;
                    } else {
                        $scope.more = false;
                    }
                    $scope.parameter.page++;
                    $ionicLoading.hide();
                });
            };
            //加载更多
            $scope.loadMore = function() {
                try {
                    getMyIntegralList();
                } catch (ex) {
                    $scope.more = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.parameter.page = 1;
                $scope.integralList = [];
                getMyIntegralList();
                $timeout(function() {
                   $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
        }])
        //我的需求调研列表
        .controller('SurveyListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', '$location','$timeout','AccountService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, $location,$timeout,AccountService) {
            $scope.isSx = $stateParams.state;

            $scope.parameter = {
                //userId: parseInt($rootScope.userId),
                page: 1,
                pageSize: 8
            };
            $scope.goBack = function() { //返回
                //$ionicHistory.goBack();
                $location.url('/app/account');
            }

            $scope.openUrl = function(id) {
                    $state.go('app.surveyExam', { 'questType': 2, 'id': id });
                }
                //console.log($scope.parameter);
            $scope.surveyList = [];
            $scope.more = true;

            function getSurveyList() {
                $ionicLoading.show();
                AccountService.getSurveyList($scope.parameter, function(data) {
                    if (data != null && data.list != null) {
                        if (data.total <= $scope.parameter.pageSize)
                            $scope.more = false;
                        else if (parseInt($scope.surveyList.length) >= data.total) {
                            $scope.more = false;
                        } else {
                            $scope.more = true;
                        }
                        $scope.surveyList = data.list;
                    } else {
                        $scope.more = false;
                    }
                    //console.log($scope.learnList);
                    $scope.parameter.page++;
                    $ionicLoading.hide();
                });
            };
            //加载更多
            $scope.loadMore = function() {
                try {
                    getSurveyList();
                } catch (ex) {
                    $scope.more = false;
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            };
            // // 下拉刷新
            $scope.doRefresh = function() {
                $scope.parameter.page = 1;
                $scope.surveyList = [];
                getSurveyList();
                $timeout(function() {
                   $scope.$broadcast('scroll.refreshComplete');
                }, 1000);
            };
            
            if ($scope.isSx != '' || $scope.isSx == 1) {
                $scope.doRefresh();
            }
        }])
        //需求调研填写调研
        .controller('SurveyExamCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', '$ionicHistory', 'TrainService', 'CommonService', 'ComExamService', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, $ionicHistory, TrainService, CommonService, ComExamService) {
            var id = $stateParams.id; //调研ID
            var questType = $stateParams.questType; //题库类型
            //console.log('id=' + id + ',questType=' + questType);
            $scope.goBack = function() { //返回
                $ionicHistory.goBack();
            }

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
                $scope.answerList = { id: $scope.parameter.id, questType: $scope.parameter.questType, list: $scope.subSaveData.list.length > 0 ? $scope.subSaveData.list : [] };
                //userId: $scope.parameter.userId,
                //console.log($scope.answerList);
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

                                    if (data != null) {
                                        if ($scope.parameter.questType == 1 || $scope.parameter.questType == 3 || $scope.parameter.questType == 4)
                                            CommonService.showGoToast(data.message, 2000, 'app.trainDetails', { 'id': $scope.parameter.id });
                                        else if ($scope.parameter.questType == 2)
                                            CommonService.showGoToast(data.message, 2000, 'app.surveyList', {'state':1});
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
        //培训详情信息
        .controller('MyTrainDetailsCtrl', ['$rootScope', '$scope', '$ionicPopup', '$state', '$stateParams', '$ionicLoading', '$timeout', '$window', 'TrainService', 'CommonService', 'AccountService', function($rootScope, $scope, $ionicPopup, $state, $stateParams, $ionicLoading, $timeout, $window, TrainService, CommonService, AccountService) {
            var id = $stateParams.id;
            $scope.isSx=$stateParams.state;

            $scope.parameter = { id: parseInt(id) };
            //$rootScope.myTrainState=0;

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

            $scope.expenseModel = {
                startCity: '',
                toCity: '',
                startDate: '',
                endDate: '',
                days: 0,
                tollCharge: '',
                trafficFee: '',
                totalAccommodation: '',
                totalMeals: '',
                total: ''
            };

            function getExpenseDetails() { //获取报销详情
                AccountService.getExpenseDetails({ trainId: $scope.parameter.id }, function(data) { //userId: parseInt($rootScope.userId), 
                    if (data != null) {
                        $scope.expenseModel = data;
                    }
                });
            };
            $scope.getTrainDetails = function() {
                $ionicLoading.show();
                TrainService.getTrainDetails($scope.parameter, function(data) {
                    //console.log(data);
                    if (data != null) {
                        $scope.trainModel = data;
                        //$rootScope.myTrainState=$scope.trainModel.state;

                        if ($scope.trainModel.state == 3) {
                            getExpenseDetails();
                        }
                    }
                    $ionicLoading.hide();
                });
            }
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
            if ($scope.isSx != '' || $scope.isSx == 1) {
                $scope.getTrainDetails();
            }
            $scope.getTrainDetails();
        }])
        //修改密码
        .controller('ChangePwdCtrl', ['$css', '$scope', '$rootScope', '$state', '$ionicLoading', 'CommonService', 'AccountService', function($css, $scope, $rootScope, $state, $ionicLoading, CommonService, AccountService) {
            $scope.userId = $rootScope.userId;
            $scope.user = { oldPwd: '', newPwd: '', rNewPwd: '' }; //userId: parseInt($scope.userId), 

            $scope.changePwd = function(user) {
                if (user.oldPwd === null || user.oldPwd === '') {
                    CommonService.showToast('原密码不能为空!', 2000);
                    return;
                }
                if (user.oldPwd.length < 6) {
                    CommonService.showToast('原密码长度必须大于6位!', 2000);
                    return;
                }
                if (user.newPwd === null || user.newPwd === '') {
                    CommonService.showToast('新密码不能为空!', 2000);
                    return;
                }
                if (user.newPwd.length < 6 && user.newPwd.length > 20) {
                    CommonService.showToast('新密码长度必须大于6位小于20位!', 2000);
                    return;
                }
                if (user.newPwd != user.rNewPwd) {
                    CommonService.showToast('两次密码输入不一致,请重新输入!', 2000);
                    return;
                }
                if (user.newPwd == user.oldPwd) {
                    CommonService.showToast('新密码与旧密码不能相同,请重新输入!', 2000);
                    return;
                }

                $ionicLoading.show();
                AccountService.changePwd({ oldPwd: user.oldPwd, newPwd: user.newPwd }, function(data) { //userId: $scope.user.userId, 
                    $ionicLoading.hide();
                    if (data != null && data.state == 1) {
                        CommonService.removeStorageItem('authorizationData');
                        CommonService.showGoToast(data.message, 2000, 'login', {});
                    } else {
                        CommonService.showToast(data.message, 2000);
                    }
                });
            }
        }])
        //意见反馈
        .controller('FeedbackCtrl', ['$css', '$scope', '$rootScope', '$state', '$ionicLoading', 'CommonService', 'AccountService', 'Settings', function($css, $scope, $rootScope, $state, $ionicLoading, CommonService, AccountService, Settings) {
            $scope.userId = $rootScope.userId;
            $scope.user = { content: '' }; //userId: parseInt($scope.userId), 

            $scope.addFeedback = function(user) {
                if (user.content === null || user.content === '') {
                    CommonService.showToast('反馈意见不能为空!', 2000);
                    return;
                }
                if (user.content.length < 10) {
                    CommonService.showToast('反馈意见必须大于10个字符!', 2000);
                    return;
                }
                if (user.content.length > 200) {
                    CommonService.showToast('反馈意见不能超过200个字符!', 2000);
                    return;
                }

                $ionicLoading.show();
                AccountService.addFeedback({ content: user.content }, function(data) { //userId: $scope.user.userId, 
                    $ionicLoading.hide();
                    if (data != null && data.state == 1) {
                        CommonService.showGoToast(data.message, 2000, 'app.setting', {});
                    } else {
                        CommonService.showToast(data.message, 2000);
                    }
                });
            }

        }])
        //申请报销
        .controller('ExpenseCtrl', ['$stateParams', '$scope', '$rootScope', '$state', '$ionicLoading', '$filter', 'CommonService', 'AccountService', 'TrainService', function($stateParams, $scope, $rootScope, $state, $ionicLoading, $filter, CommonService, AccountService, TrainService) {
            $scope.userId = $rootScope.userId;
            $scope.trainId = $stateParams.id;

            $scope.costTypes = {};

            $scope.getCostTypes = function() {
                $ionicLoading.show();
                TrainService.getCostTypes(null, function(data) {
                    if (data != null && data.list.length > 0) {
                        $scope.costTypes = data.list;
                    }
                    $ionicLoading.hide();
                });
            }
            $scope.getCostTypes();

            //console.log($filter('date')(new Date('2016-09-09'), 'yyyy-MM-dd'));
            //console.log(new Date('2016-09-09'));

            $scope.expenseModel = {
                //userId: parseInt($rootScope.userId),
                trainId: parseInt($scope.trainId),
                costType: '',
                startCity: '',
                toCity: '',
                startDate: '',
                endDate: '',
                days: '',
                tollCharge: '',
                trafficFee: '',
                totalAccommodation: '',
                totalMeals: ''
            };
            $scope.selectDatePicker = function(t) {
                if (t == 'startDate') {
                    CommonService.getDatePicker('date').then(function(date) {
                        $scope.expenseModel.startDate = $filter('date')(new Date(date), 'yyyy-MM-dd');
                        return true;
                    }).catch(function(err) {
                        CommonService.showToast('选择日期出错!' + err, 2000);
                    });
                } else {
                    CommonService.getDatePicker('date').then(function(date) {
                        $scope.expenseModel.endDate = $filter('date')(new Date(date), 'yyyy-MM-dd');
                        return true;
                    }).catch(function(err) {
                        CommonService.showToast('选择日期出错!' + err, 2000);
                    });
                }
            }

            $scope.applyExpense = function(expenseModel) {
                //alert(JSON.stringify(expenseModel));

                if (expenseModel.costType === null || expenseModel.costType === '') {
                    CommonService.showToast('请选择费用类型!', 2000);
                    return;
                }
                if (expenseModel.startCity === null || expenseModel.startCity === '') {
                    CommonService.showToast('请输入出发城市!', 2000);
                    return;
                }
                if (expenseModel.toCity === null || expenseModel.toCity === '') {
                    CommonService.showToast('请输入目的地城市!', 2000);
                    return;
                }
                if (expenseModel.startDate === null || expenseModel.startDate === '') {
                    CommonService.showToast('请输入开始日期!', 2000);
                    return;
                }
                if (expenseModel.endDate === null || expenseModel.endDate === '') {
                    CommonService.showToast('请输入结束日期!', 2000);
                    return;
                }
                if (expenseModel.startDate != expenseModel.endDate && expenseModel.startDate > expenseModel.endDate) {
                    CommonService.showToast('开始日期不能大于结束日期!', 2000);
                    return;
                }
                if (expenseModel.days === null || expenseModel.days === '' || expenseModel.days == 0) {
                    CommonService.showToast('请输入天数!', 2000);
                    return;
                } else if (!/^[0-9]*$/.test(expenseModel.days)) {
                    CommonService.showToast('天数只能输入数字!', 2000);
                    return;
                }

                if ((expenseModel.tollCharge !== null || expenseModel.tollCharge !== '') && !/^[0-9]+(.[0-9]{2})?$/.test(expenseModel.tollCharge)) {
                    CommonService.showToast('长途交通费只能输入数字,小数点后只能保留两位!', 2000);
                    return;
                }
                if ((expenseModel.trafficFee !== null || expenseModel.trafficFee !== '') && !/^[0-9]+(.[0-9]{2})?$/.test(expenseModel.trafficFee)) {
                    CommonService.showToast('市内交通费只能输入数字,小数点后只能保留两位!', 2000);
                    return;
                }
                if ((expenseModel.totalAccommodation !== null || expenseModel.totalAccommodation !== '') && !/^[0-9]+(.[0-9]{2})?$/.test(expenseModel.totalAccommodation)) {
                    CommonService.showToast('总住宿费只能输入数字,小数点后只能保留两位!', 2000);
                    return;
                }
                if ((expenseModel.totalMeals !== null || expenseModel.totalMeals !== '') && !/^[0-9]+(.[0-9]{2})?$/.test(expenseModel.totalMeals)) {
                    CommonService.showToast('总餐费只能输入数字,小数点后只能保留两位!', 2000);
                    return;
                }

                $ionicLoading.show();
                AccountService.applyExpense(expenseModel, function(data) {
                    if (data != null && data.state == 1) {
                        CommonService.showGoToast(data.message, 2000, 'app.myTrain', { state: 1 });
                    } else {
                        CommonService.showToast(data.message, 3000);
                    }
                });
            }

        }]);
});
