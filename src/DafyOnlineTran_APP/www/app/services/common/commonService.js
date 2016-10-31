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
                }
            }
        }])
        .service('CommonService', ['$rootScope', '$q', '$ionicLoading', '$timeout', '$http', '$state', 'Settings', '$localStorageUsage', '$cordovaImagePicker', '$cordovaCamera', '$cordovaFileTransfer', '$cordovaDatePicker','$cordovaFileOpener2', function($rootScope, $q, $ionicLoading, $timeout, $http, $state, Settings, $localStorageUsage, $cordovaImagePicker, $cordovaCamera, $cordovaFileTransfer, $cordovaDatePicker,$cordovaFileOpener2) {
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
                getDatePicker: function(type) {
                    var deferred = $q.defer();
                    var options = {
                        date: new Date(),
                        mode: type, //'date', // or 'time'
                        maxDate: new Date() - 10000,
                        allowOldDates: false,
                        allowFutureDates: false,
                        doneButtonLabel: 'DONE',
                        doneButtonColor: '#F2F3F4',
                        cancelButtonLabel: 'CANCEL',
                        cancelButtonColor: '#000000'
                    };
                    $cordovaDatePicker.show(options).then(function(date) {
                        deferred.resolve(date);
                    });
                    return deferred.promise;
                },
                showToast: function(string, duration) { //消息提示框
                    showToast(string, duration);
                },
                showGoToast: function(string, duration, url, par) { //消息提示,后自动跳转
                    $ionicLoading.show({
                        template: string,
                        noBackdrop: true
                    });
                    $timeout(function() {
                        $ionicLoading.hide();
                        $state.go(url, par);
                    }, duration);
                },
                getPicture: function(width, height) { //浏览图片
                    var deferred = $q.defer();
                    var options = {
                        maximumImagesCount: 1,
                        width: width,
                        height: height,
                        quality: 80
                    };

                    $cordovaImagePicker.getPictures(options)
                        .then(function(results) {
                            deferred.resolve(results[0]);
                        }, function(error) {
                            //showToast('选择图片错误!', 5000);
                            deferred.reject(error);
                        });

                    return deferred.promise;
                },
                getCamera: function(width, height) { //拍照
                    var deferred = $q.defer();
                    var options = {
                        quality: 80,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        targetWidth: width,
                        targetHeight: height
                    };
                    $cordovaCamera.getPicture(options).then(function(imageURI) {
                        deferred.resolve(imageURI);
                    }, function(err) {
                        //showToast('获取图片错误!', 5000);
                        deferred.reject(error);
                    });
                    return deferred.promise;
                },
                upload: function(url, filePath, params) { //上传文件
                    var deferred = $q.defer();
                    $rootScope.uploadProgress = 0;
                    var server = Settings.deBug === true ? 'http://10.10.72.55:8083/api/FileUpload/ImgUpload' : serviceBase + url;

                    var options = new FileUploadOptions();
                    options.params = params;
                    options.headers = {
                        'Authorization': 'Bearer ' + $rootScope.token,
                        'X-Requested-With': 'XMLHttpRequest'
                    };

                    $cordovaFileTransfer.upload(server, filePath, options)
                        .then(function(result) {
                            deferred.resolve(result);
                            $ionicLoading.hide();
                        }, function(err) {
                            $ionicLoading.hide();
                            deferred.reject(error);
                        }, function(progress) {
                            $timeout(function() {
                                $rootScope.uploadProgress = (progress.loaded / progress.total) * 100;
                                $ionicLoading.show({
                                    template: '正在上传中,已上传' + Math.floor($rootScope.uploadProgress) + '%...'
                                });
                            });
                        });
                    return deferred.promise;
                },
                getAuthorizationData: function() { //获取用户信息
                    var authData = $localStorageUsage.getItem('authorizationData');
                    if (authData != null) {
                        authData = eval('(' + authData + ')');
                    } else {
                        authData = null;
                    }
                    return authData;
                },
                clearStorage: function() {
                    $localStorageUsage.clear();
                },
                setStorageItem: function(key, value) { //存储数据
                    $localStorageUsage.setItem(key, value, 1);
                },
                getStorageItem: function(key) { //获取本地存储数据
                    return $localStorageUsage.getItem(key);
                },
                removeStorageItem: function(key) { //删除本地存储数据
                    $localStorageUsage.removeItem(key);
                },
                getJsonData: function(url, par) { //获取JSON数据

                    if ($rootScope.token == '') {
                        var authData = $localStorageUsage.getItem('authorizationData') == null ? JSON.stringify({ 'token': '' }) : $localStorageUsage.getItem('authorizationData');
                        authData = eval('(' + authData + ')');

                        $rootScope.token = authData.token != "" ? authData.token : '';
                    }

                    var deferred = $q.defer();
                    var num = Settings.version;
                    var dataJs = Settings.deBug === true ? '.json?v=' + num : '';

                    $http({
                        url: serviceBase + url + dataJs,
                        method: (Settings.deBug === true ? "get" : "post"),
                        headers: {
                            'Authorization': 'Bearer ' + $rootScope.token
                        },
                        data: par
                    }).success(function(data) {

                        if (data.Message == '已拒绝为此请求授权。') {
                            $localStorageUsage.clear();
                            $state.go('login');
                        } else {
                            deferred.resolve(data);
                        }
                    }).error(function(error, status) {
                        var msg = '获取数据出现错误!';
                        if (status == 500)
                            msg = '系统错误!';
                        showToast(msg, 5000);
                        deferred.reject(error);
                    }).finally(function() {

                    });
                    return deferred.promise;
                },
                getUpdateData:function(url){//获取更新数据
                    var deferred = $q.defer();
                    $http({
                        url:url,
                        method:"get"
                    }).success(function(data) {
                        deferred.resolve(data);
                    }).error(function(error, status) {
                        deferred.reject(error);
                    }).finally(function() {

                    });
                    return deferred.promise;
                },
                updateApk:function(data){ //更新APK包
                    $ionicLoading.show({
                        template: "已经下载：0%"
                    });
                    var url =data.url;
                    var targetPath =data.targetPath;
                    var trustHosts = true;
                    var options = {};

                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts).then(function (result) {
                            $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive').then(function () {}, function (err) {

                            });
                            $ionicLoading.hide();

                    }, function (err) {
                            $ionicLoading.show({
                              template: "下载失败"
                            });
                            $ionicLoading.hide();
                    }, function (progress) {
                            $timeout(function () {
                              var downloadProgress = (progress.loaded / progress.total) * 100;
                              $ionicLoading.show({
                                template: "已经下载：" + Math.floor(downloadProgress) + "%"
                              });
                              if (downloadProgress > 99) {
                                $ionicLoading.hide();
                              }
                            });
                    });
                }
            }
        }])
        .service('ComExamService', [function() {
            return {
                getExamSubData: function(questionsList) {

                    var noAnswerModel = { type: 0, count: 0 };
                    var noAnswerList = [];
                    for (var n = 1; n <= 3; n++) {
                        noAnswerModel = { type: n, count: 0 };
                        noAnswerList.push(noAnswerModel);
                    }
                    var answerList = { list: [] };
                    var flag = false;

                    if (questionsList != null) {
                        var answer = [];
                        for (var i = 0; i < questionsList.length; i++) {
                            var type = questionsList[i].type;
                            for (var j = 0; j < questionsList[i].subjects.length; j++) {
                                var answerModel = { id: 0, check: '', type: 0 };

                                switch (type) {
                                    case 1:
                                        {
                                            var checkValue = questionsList[i].subjects[j].check;
                                            var id = questionsList[i].subjects[j].id;

                                            if (checkValue == null) {
                                                flag = true;
                                                noAnswerList[0].count += 1;
                                            } else {
                                                answerModel = { id: id, check: checkValue, type: type };
                                                answerList.list.push(answerModel);
                                            }
                                            break;
                                        }
                                    case 2:
                                        {
                                            var checkValue = '';
                                            var id = questionsList[i].subjects[j].id;

                                            for (var d = 0; d < questionsList[i].subjects[j].options.length; d++) {
                                                var check = questionsList[i].subjects[j].options[d].check;
                                                if (check !== null && check == true) {
                                                    checkValue += questionsList[i].subjects[j].options[d].value;
                                                }
                                            }
                                            if (checkValue == '') {
                                                flag = true;
                                                noAnswerList[1].count += 1;
                                            } else {
                                                answerModel = { id: id, check: checkValue, type: type };
                                                answerList.list.push(answerModel);
                                            }
                                            break;
                                        }
                                    case 3:
                                        {
                                            var checkValue = '';
                                            var id = questionsList[i].subjects[j].id;
                                            var content = questionsList[i].subjects[j].content;
                                            if (content == null || content == '') {
                                                flag = true;
                                                noAnswerList[2].count += 1;
                                            } else {
                                                answerModel = { id: id, check: content, type: type };
                                                answerList.list.push(answerModel);
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
                        for (var n = 0; n < noAnswerList.length; n++) {
                            var count = noAnswerList[n].count;
                            var type = noAnswerList[n].type;

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
                    var subData = { msg: msg, list: answerList.list };
                    console.log(subData);
                    return subData;
                }
            };
        }])
        .service('HubService', ['$rootScope', 'Settings', function($rootScope, Settings) {
            var signalrServerUrl = Settings.signalrServerUrl;
            var hubName = Settings.hubName;
            var hubConnection, proxy;

            $rootScope.isHubStart = false;
            //hubConnection.logging = true;

            function start() {
                try {
                    if ($rootScope.isHubStart == true)
                        return;
                    hubConnection = $.hubConnection(signalrServerUrl, {
                        useDefaultPath: false
                    });
                    hubConnection.qs = {
                        'DafyBearer': $rootScope.token
                    };
                    proxy = hubConnection.createHubProxy(hubName);
                    //console.log('HubService $rootScope.token='+$rootScope.token);

                    hubConnection.start().done(function() {
                        console.log("APP启动连接ID" + hubConnection.id + "与服务器成功建立了连接");
                        $rootScope.isHubStart = true;
                    }).fail(function() {
                        console.log("连接SignalR服务器失败");
                    });

                    hubConnection.reconnecting(function() {
                        $rootScope.isHubStart = true;
                    });
                    hubConnection.reconnected(function() {
                        $rootScope.isHubStart = false;
                    });
                    hubConnection.disconnected(function() {
                        console.log('与SignalR服务器断开了链接');
                        if (!$rootScope.isHubStart) {
                            setTimeout(function() {
                                start();
                            }, 3000);
                        }
                    });
                    hubConnection.error(function(error) {
                        //alert('SignalR error: ' + error);
                    });

                } catch (e) {

                }
            }

            return {
                getHubConnection: function() {
                    return hubConnection;
                },
                start: function() {
                    start();
                },
                getHubProxy: function() {
                    if (!$rootScope.isHubStart)
                        start();
                    return hubConnection.createHubProxy(hubName);
                },
                invoke: function(methodName, par, callback) { //调用服务端方法
                    proxy.invoke(methodName, par)
                        .done(function(result) {
                            $rootScope.$apply(function() {
                                if (callback) {
                                    callback(result);
                                }
                            });
                        });
                },
                on: function(eventName, callback) { //客户端回调方法
                    proxy.on(eventName, function(result) {
                        $rootScope.$apply(function() {
                            if (callback) {
                                callback(result);
                            }
                        });
                    });
                }
            };
        }])
        .service('JPushService', ['$window', 'Settings', function($window, Settings) {

            return {
                initJPush: function() { //初始化摧送服务
//                  $window.plugins.jPushPlugin.init();
//                  $window.plugins.jPushPlugin.setDebugMode(Settings.deBug == true ? true : false);
                },
                stopJPush: function() { //停止摧送服务
                    $window.plugins.jPushPlugin.stopPush();
                },
                restartJPush: function() { //重启摧送服务
                    $window.plugins.jPushPlugin.resumePush();
                },
                setAlias: function(alias) { //设置别名
                    $window.plugins.jPushPlugin.setAlias(alias);
                },
                setTags: function(tags) { //设置标签
                    $window.plugins.jPushPlugin.setTags(tags.split(','));
                },
                setTagsWithAlias: function(tags, alias) { //设置标签与别名
                    $window.plugins.jPushPlugin.setTagsWithAlias(tags.split(','), alias);
                }
            };
        }])

    return commonService;
});
