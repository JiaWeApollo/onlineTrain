/**
 * Created by tianxc on 16-8-3.
 */
define(['app'], function(app) {
    app.controller('AccountCtrl', ['$css', '$scope', '$rootScope', '$state', function($css, $scope, $rootScope, $state) {
            //$css.add('lib/angular-bootstrap/bootstrap.min.css');

        }])
        //登录
        .controller('LoginCtrl', ['$rootScope', '$css', '$scope', '$state', '$ionicLoading', 'CommonService', 'AccountService', function($rootScope, $css, $scope, $state, $ionicLoading, CommonService, AccountService) {
            //$css.add('lib/angular-bootstrap/bootstrap.min.css');

            var authenticationData = CommonService.getAuthorizationData();
            if (authenticationData === null) {
                $rootScope.isLogin = false;
            } else {
                $rootScope.isLogin = true;
                $state.go('app.home');
                return;
            }

            $scope.user = {
                userId: '',
                password: ''
            };

            $scope.login = function(user) { //登录

                if (user.userId == '') {
                    CommonService.showToast('请输入用户名!', 2000);
                    return;
                }else if(!/^[0-9]*$/.test(user.userId)){
                    CommonService.showToast('用户名只能输入数字!', 2000);
                    return;
                }
                if (user.password == '') {
                    CommonService.showToast('请输入密码!', 2000);
                    return;
                }
                $ionicLoading.show();
                AccountService.login(user, function(data) {
                    if (data != null && data.state == 1) {
                        CommonService.setStorageItem('authorizationData', JSON.stringify(data));
                        $rootScope.userId=user.userId;
                        $state.go('app.home');
                    } else {
                        CommonService.removeStorageItem('authorizationData');
                        CommonService.showToast(data.message, 2000);
                    }
                    $ionicLoading.hide();
                });
            };
        }])
        //注册
        .controller('RegisterCtrl', ['$rootScope', '$css', '$scope', '$state', '$stateParams', '$ionicLoading', '$location','$interval','CommonService', 'AccountService', function($rootScope, $css, $scope, $state, $stateParams, $ionicLoading, $location,$interval,CommonService, AccountService) {
            //$css.add('lib/angular-bootstrap/bootstrap.min.css');
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
                            $rootScope.userId=user.userId;
                            $state.go('app.home');
                        } else {
                            CommonService.showToast(data.message, 2000);
                        }
                    });
                }
                if (state === 'c') {
                    AccountService.resetPwd(user, function(data) {
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
            $scope.paraevent=true;

            $scope.getVerifyCode = function(user) { ///获取验证码
                if($scope.paraevent===false){
                    return;
                }
                if (user.mobile === undefined || user.mobile === '') {
                    CommonService.showToast('手机号码错误,请重新输入!', 2000);
                } else {
                    $ionicLoading.show();
                    AccountService.getVerifyCode(user, function(data) {
                        $ionicLoading.hide();
                        if (data != null && data.state == 1) {
                            CommonService.showToast(data.message, 2000);
                        } else {
                            CommonService.showToast(data.message, 2000);
                        }
                        var second = 60,timePromise = undefined;
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
        }]);
        //我的培训列表
        app.controller('myTrainListCtrl', ['$rootScope', '$scope', '$state', '$stateParams', '$ionicLoading', 'TrainService', function($rootScope, $scope, $state, $stateParams, $ionicLoading, TrainService) {
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
});
