/**
 * Created by tianxc on 16-7-29.
 */
define([
    'angular',
    'angularAMD',
    'ngCordova',
    'angularCss',
    'ionic',
    'lazy-image',
    'file-upload',
    'bindonce',
    'localStorageUsage',
    'directive/directives',
    'filters/filters',
    'services/common/commonService'
], function(angular, angularAMD) {
    'use strict';
//  var serviceUrl = 'http://10.10.72.74:8047/';
    var serviceUrl = 'http://10.10.71.121:8080/';

    var app = angular.module('app', [
        'ionic', 'ngCordova', 'ngLocale', 'door3.css', 'afkl.lazyImage', 'ngFileUpload', 'pasvaz.bindonce', 'localStorageUsage', 'app.directives', 'app.filters', 'app.commonService'
    ]);

    app.config(['$httpProvider', '$ionicConfigProvider', function($httpProvider, $ionicConfigProvider) {

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('bottom');
        $ionicConfigProvider.navBar.alignTitle('center');

        // $ionicConfigProvider.views.forwardCache(true); //开启全局缓存
        $ionicConfigProvider.views.maxCache(0); //关闭缓存
        $httpProvider.defaults.headers.put['X-Requested-With'] = 'XMLHttpRequest';
        $httpProvider.defaults.headers.post['X-Requested-With'] = 'XMLHttpRequest';

    }]);
    //全局常量
    app.constant('Settings', {
        apiServiceBaseUrl: serviceUrl,
        clientId: 'OnlineLearnApp',
        version: '1.0.0',
        deBug: true
    });

    // 配置
    app.config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider) {
        var authData = null;
        for (var key in window.localStorage) {
            if (key.indexOf('authorizationData') > 0) {
                authData = window.localStorage.getItem(key);
                authData = eval('(' + authData + ')');
                break;
            }
        }
        // $localStorageUsage.getItem('authorizationData');
        $httpProvider.interceptors.push(function($rootScope, $q) {
            return {
                request: function(config) {
                    config.headers = config.headers || {};
                    if (authData) {
                        config.headers.Authorization = 'Bearer ' + authData.token;
                    }
                    return config;
                },
                requestError: function(rejection) {
                    return $q.reject(rejection);
                },
                response: function(response) {
                    return response;
                },
                responseError: function(rejection) {
                    if (rejection.status === 401) {
                        var authData = $localStorageUsage.getItem('authorizationData');
                        $location.path('/app/home');
                    }
                    if (rejection.status === -1) {

                    }
                    return $q.reject(rejection);
                }
            };
        });
        // default
        if (authData === null) {
            $urlRouterProvider.otherwise('/login');
        } else {
            $urlRouterProvider.otherwise('/app/home');
        }

        $stateProvider

            .state('app', angularAMD.route({
            url: '/app',
            abstract: true,
            templateUrl: 'templates/tabs.html'
        }))

        .state('login', angularAMD.route({ //登录
            url: '/login',
            templateUrl: 'templates/account/login.html',
            css: 'css/account/account.css',
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var accountCtrl = "app/controllers/account/accountCtrl.js";
                        var accountService = "app/services/account/accountService.js";

                        var deferred = $q.defer();
                        require([accountCtrl, accountService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            },
            controllerProvider: function($stateParams) {
                return "LoginCtrl";
            }
        }))

        .state('register', angularAMD.route({ //注册和重置密码
            url: '/register?{state={r|c}}', //?{state={r|c}}
            templateUrl: 'templates/account/register.html',
            css: 'css/account/account.css?v=1.0',
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var accountCtrl = "app/controllers/account/accountCtrl.js";
                        var accountService = "app/services/account/accountService.js";

                        var deferred = $q.defer();
                        require([accountCtrl, accountService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            },
            controllerProvider: function($stateParams) {
                return "RegisterCtrl";
            }
        }))

        .state('app.home', angularAMD.route({ //首页
            url: '/home',
            css: 'css/home/index.css',
            views: {
                'app-home': {
                    templateUrl: 'templates/tab-home.html',
                    controller: 'HomeCtrl'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var homeCtrl = "app/controllers/home/homeCtrl.js";
                        var homeService = "app/services/home/homeService.js";

                        var deferred = $q.defer();

                        require([homeCtrl, homeService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.learn', angularAMD.route({ //学习管理
            url: '/learn',
            css: 'css/learn/learn.css',
            views: {
                'app-learn': {
                    templateUrl: 'templates/learn/tab-learn.html',
                    controller: 'LearnTypeCtrl'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var learnCtrl = "app/controllers/learn/learnCtrl.js";
                        var learnService = "app/services/learn/learnService.js";
                        var deferred = $q.defer();

                        require([learnCtrl, learnService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.learnList', angularAMD.route({ //学习管理课程列表
            url: '/learn/learnList/:id',
            css: 'css/learn/learn.css',
            views: {
                'app-learn': {
                    templateUrl: 'templates/learn/learnList.html',
                    controller: 'LearnListCtrl'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var learnCtrl = "app/controllers/learn/learnCtrl.js";
                        var learnService = "app/services/learn/learnService.js";
                        var deferred = $q.defer();

                        require([learnCtrl, learnService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.learnDetails', angularAMD.route({ //学习管理课程详情
            url: '/learn/learnDetails/:typeId/:id',
            css: 'css/learn/learn.css',
            views: {
                'app-learn': {
                    templateUrl: 'templates/learn/learnDetails.html',
                    controller: 'LearnDetails'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var learnCtrl = "app/controllers/learn/learnCtrl.js";
                        var learnService = "app/services/learn/learnService.js";
                        var deferred = $q.defer();

                        require([learnCtrl, learnService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.train', angularAMD.route({ //培训管理
            url: '/train',
            views: {
                'app-train': {
                    templateUrl: 'templates/train/tab-train.html',
                    controller: 'TrainCtrl'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var trainCtrl = "app/controllers/train/trainCtrl.js";
                        var deferred = $q.defer();

                        require([trainCtrl], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.train.not', { //未完成培训
                url: '/not/:state',
                views: {
                    'tab-train-not': {
                        templateUrl: 'templates/train/not-train.html',
                        controller: 'TrainListCtrl',
                        css: 'css/train/train.css',
                    }
                },
                resolve: {
                    mode: function() {
                        return 'not';
                    },
                    loadController: ['$q', '$stateParams',
                        function($q, $stateParams) {

                            var trainCtrl = "app/controllers/train/trainCtrl.js";
                            var trainService = "app/services/train/trainService.js";
                            var deferred = $q.defer();

                            require([trainCtrl, trainService], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }
                    ]
                }
            })
            .state('app.train.yet', { //已完成培训
                url: '/yet/:state',
                views: {
                    'tab-train-yet': {
                        templateUrl: 'templates/train/yet-train.html',
                        controller: 'TrainListCtrl',
                        css: 'css/train/train.css',
                    }
                },
                resolve: {
                    mode: function() {
                        return 'yet';
                    },
                    loadController: ['$q', '$stateParams',
                        function($q, $stateParams) {

                            var trainCtrl = "app/controllers/train/trainCtrl.js";
                            var trainService = "app/services/train/trainService.js";
                            var deferred = $q.defer();

                            require([trainCtrl, trainService], function() {
                                deferred.resolve();
                            });
                            return deferred.promise;
                        }
                    ]
                }
            })

        .state('app.trainDetails', angularAMD.route({ //培训详情
            url: '/trainDetails/:id',
            views: {
                'app-train': {
                    templateUrl: 'templates/train/not-details.html',
                    controller: 'TrainDetailsCtrl',
                    css: 'css/train/train.css'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var trainCtrl = "app/controllers/train/trainCtrl.js";
                        var trainService = "app/services/train/trainService.js";
                        var deferred = $q.defer();

                        require([trainCtrl, trainService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.exam', angularAMD.route({ //培训考核
            url: '/exam/:questType/:id',
            views: {
                'app-train': {
                    templateUrl: 'templates/train/exam.html',
                    controller: 'TrainExamCtrl',
                    css: 'css/train/train.css'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var trainCtrl = "app/controllers/train/trainCtrl.js";
                        var trainService = "app/services/train/trainService.js";
                        var deferred = $q.defer();

                        require([trainCtrl, trainService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.examDetails', angularAMD.route({ //获取考试答案
            url: '/exam/examDetails/:questType/:id',
            views: {
                'app-train': {
                    templateUrl: 'templates/train/examDetails.html',
                    controller: 'TrainExamDetailsCtrl',
                    css: 'css/train/train.css'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {
                        var trainCtrl = "app/controllers/train/trainCtrl.js";
                        var trainService = "app/services/train/trainService.js";
                        var deferred = $q.defer();

                        require([trainCtrl, trainService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))

        .state('app.account', angularAMD.route({ //用户中心
            url: '/account',
            views: {
                'app-account': {
                    templateUrl: 'templates/account/tab-account.html',
                    controller: 'AccountCtrl',
                    css: 'css/account/account.css'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
                        var deferred = $q.defer();

                        require([loadAccountCtrl], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))
		
		.state('app.myLearn', angularAMD.route({ //我的课程
			url: '/myLearn',
			views: {
				'app-account': {
					templateUrl: 'templates/account/tab-myLearn.html',
					controller: 'AccountCtrl'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
						var deferred = $q.defer();

						require([loadAccountCtrl], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))
		
		.state('app.myLearn.required', {   //必修课程
			url: '/requiredv/:code',
			views: {
				'tab-myLearn-required': {
					templateUrl: 'templates/account/myLearn-required.html',
					controller: 'MyLearnListCtrl',
			        css: 'css/learn/learn.css',					
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
						var learnService = "app/services/learn/learnService.js";
						var deferred = $q.defer();

						require([loadAccountCtrl, learnService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		})
		
		.state('app.myLearn.selective', {   //选修课程
			url: '/selectivev/:code',
			views: {
				'tab-myLearn-selective': {
					templateUrl: 'templates/account/myLearn-selective.html',
					controller: 'MyLearnListCtrl',
			        css: 'css/learn/learn.css',					
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
						var learnService = "app/services/learn/learnService.js";
						var deferred = $q.defer();

						require([loadAccountCtrl, learnService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		})
		
		.state('app.myLearn.subject', {   //专题课程
			url: '/subjectv/:code',
			views: {
				'tab-myLearn-subject': {
					templateUrl: 'templates/account/myLearn-subject.html',
					controller: 'MyLearnListCtrl',
			        css: 'css/learn/learn.css',					
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
						var learnService = "app/services/learn/learnService.js";
						var deferred = $q.defer();

						require([loadAccountCtrl, learnService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		})

        .state('app.myLearnDetails', angularAMD.route({ //学习管理课程详情
            url: '/mylearnDetails/:code/:id',
            css: 'css/learn/learn.css',
            views: {
                'app-account': {
                    templateUrl: 'templates/account/mylearnDetails.html',
                    controller: 'MyLearnDetails'
                }
            },
            resolve: {
                loadController: ['$q', '$stateParams',
                    function($q, $stateParams) {

                        var learnCtrl = "app/controllers/learn/learnCtrl.js";
                        var learnService = "app/services/learn/learnService.js";
                        var deferred = $q.defer();

                        require([learnCtrl, learnService], function() {
                            deferred.resolve();
                        });
                        return deferred.promise;
                    }
                ]
            }
        }))		

		.state('app.refund', angularAMD.route({ //申请报销
			url: '/refund',
			views: {
				'app-account': {
					templateUrl: 'templates/account/refund.html',
					controller: 'AccountCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
//						var timepicker =
						var deferred = $q.defer();

						require([loadAccountCtrl], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	

		.state('app.integral', angularAMD.route({ //积分详情
			url: '/integral',
			views: {
				'app-account': {
					templateUrl: 'templates/account/integral.html',
					controller: 'AccountCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {

						var loadAccountCtrl = "app/controllers/account/accountCtrl.js";
						var deferred = $q.defer();

						require([loadAccountCtrl], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	
		
        .state('app.surveyList', angularAMD.route({ //需求调研列表
			url: '/surveyList',
			views: {
				'app-account': {
					templateUrl: 'templates/account/surveyList.html',
					controller: 'HomeCtrl',
					css:'css/home/index.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var homeCtrl = "app/controllers/home/homeCtrl.js";
						var homeService = "app/services/home/homeService.js";

						var deferred = $q.defer();

						require([homeCtrl, homeService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))
		
        .state('app.myTrain', angularAMD.route({ //我的培训
			url: '/myTrain',
			views: {
				'app-account': {
					templateUrl: 'templates/account/myTrain.html',
					controller: 'myTrainListCtrl',
					css:'css/train/train.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var accountCtrl = "app/controllers/account/accountCtrl.js";
						var trainService = "app/services/train/trainService.js";

						var deferred = $q.defer();

						require([accountCtrl, trainService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))		

        .state('app.setting', angularAMD.route({ //个人设置
			url: '/setting',
			views: {
				'app-account': {
					templateUrl: 'templates/account/setting.html',
					controller: 'myTrainListCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var accountCtrl = "app/controllers/account/accountCtrl.js";
						var trainService = "app/services/train/trainService.js";

						var deferred = $q.defer();

						require([accountCtrl, trainService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	

        .state('app.changePwd', angularAMD.route({ //修改密码
			url: '/changePwd',
			views: {
				'app-account': {
					templateUrl: 'templates/account/changePwd.html',
					controller: 'myTrainListCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var accountCtrl = "app/controllers/account/accountCtrl.js";
						var trainService = "app/services/train/trainService.js";

						var deferred = $q.defer();

						require([accountCtrl, trainService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	
		
        .state('app.feedback', angularAMD.route({ //意见反馈
			url: '/feedback',
			views: {
				'app-account': {
					templateUrl: 'templates/account/feedback.html',
					controller: 'myTrainListCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var accountCtrl = "app/controllers/account/accountCtrl.js";
						var trainService = "app/services/train/trainService.js";

						var deferred = $q.defer();

						require([accountCtrl, trainService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	
		
        .state('app.about', angularAMD.route({ //关于既有培训
			url: '/about',
			views: {
				'app-account': {
					templateUrl: 'templates/account/about.html',
					controller: 'myTrainListCtrl',
					css:'css/account/account.css'
				}
			},
			resolve: {
				loadController: ['$q', '$stateParams',
					function($q, $stateParams) {
						var accountCtrl = "app/controllers/account/accountCtrl.js";
						var trainService = "app/services/train/trainService.js";

						var deferred = $q.defer();

						require([accountCtrl, trainService], function() {
							deferred.resolve();
						});
						return deferred.promise;
					}
				]
			}
		}))	

    }]);

    app.run(['$ionicPlatform', '$state', '$ionicPopup', '$rootScope', '$location', '$timeout', '$ionicHistory', '$cordovaToast', 'CommonService', 'NetworkService', '$localStorageUsage', function($ionicPlatform, $state, $ionicPopup, $rootScope, $location, $timeout, $ionicHistory, $cordovaToast, CommonService, NetworkService, $localStorageUsage) {

        $ionicPlatform.ready(function() {
            $rootScope.userId = 0
            $localStorageUsage.initCheck();
            var authData = $localStorageUsage.getItem("authorizationData");

            if (authData != null) {
                authData = eval('(' + authData + ')');
                $rootScope.userId = authData.userId;
                $rootScope.userName = authData.userName;
                
                var i = authData.userId.toString().indexOf('8');
                if (i == 0) {
                    $rootScope.role = 't';
                } else {
                    $rootScope.role = 'x';
                }
            }

            var isOnline = NetworkService.isOnline();
            if (isOnline != null) {
                isOnline = isOnline.$$state.value;
            }
            if (isOnline === false) {
                $cordovaToast.show('无法连接网络,请检查是否启用网络!', 'short', 'bottom').then(function(success) {}, function(error) {});
            }

            $rootScope.exitConfirm = function() { //退出APP

                var confirmPopup = $ionicPopup.confirm({
                    title: '<strong>退出应用?</strong>',
                    template: '你确定要退出应用吗?',
                    okText: '退出',
                    cancelText: '取消'
                });
                confirmPopup.then(function(res) {
                    if (res) {
                        CommonService.removeStorageItem('authorizationData');
                        ionic.Platform.exitApp();
                    }
                });
            };

            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard && window.cordova.InAppBrowser) {

                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                window.open = window.cordova.InAppBrowser.open;
            }
            if (window.StatusBar) {
                StatusBar.styleLightContent();
            }
        });
    }]);

    return angularAMD.bootstrap(app);
});
