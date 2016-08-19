(function() {
    "use strict";
    /**
     * 本地化存储扩展
     * @version v1.0.0
     */
    var storage = angular.module('localStorageUsage', []);

    storage.factory('$localStorageUsage', ['$q', '$window', function($q, $window) {
        var storageKeys = {},
            regStorageKey = /^localstorage\_\_\_(.*)+\_\_\_\d*$/,
            prefixText = "localstorage",
            space = "___";

        function getRealKey(key) {
            var tempArr = key.split(space),
                realKey = {};

            realKey['realkey'] = tempArr[1];
            realKey['expires'] = tempArr[2] || "";

            return realKey;
        };
        function isExpires(key, expires) {
            var now = +new Date();
            if (!expires) {
                return false;
            }
            if (now > parseInt(expires, 10)) {
                return true;
            }
            return false;
        };

        return {
            clear: function() {
                for (var key in $window.localStorage) {
                    if (regStorageKey.test(key)) {
                        $window.localStorage.removeItem(key);
                    }
                }
                return this;
            },
            removeItem: function(key) {
                var item = storageKeys[key];
                if (item) {
                    $window.localStorage.removeItem(item['key']);
                }
                return this;
            },
            getItem: function(key) {
                var item = storageKeys[key];
                if (item) {
                    // 如果过期了，那么就返回空字符串
                    if (isExpires(key, item['expires'])) {
                        return null;
                    }
                    return $window.localStorage[item['key']];
                }
                return null;
            },
            setItem: function(key, value, expires) {
                if (!key) {
                    return this;
                }

                expires = expires || 0;

                this._key = key;
                var now = (+new Date()),
                    localKey = prefixText + space + key + space + (expires ? expires * 1000*60*60*24 + now : "");

                $window.localStorage.setItem(localKey, value);
                storageKeys[key] = { "key": localKey, "expires": expires ? expires * 1000*60*60*24 + now : "" };

                return this;
            },
            expires: function(seconds) {
                if (!seconds) {
                    return this;
                }

                var key = this._key,
                    item = storageKeys[key] || {},
                    value = $window.localStorage[item['key']],
                    now = (+new Date());

                if (!key) {
                    return this;
                }

                this.removeItem(key);
                this.setItem(key, value, seconds);

                return this;
            },
            initCheck: function() {
                var realKey;
                for (var key in $window.localStorage) {
                    if (regStorageKey.test(key)) {
                        realKey = getRealKey(key);

                        // 如果已经过期的local data，则删掉
                        if (isExpires(realKey['realkey'], realKey['expires'])) {
                            $window.localStorage.removeItem(key);
                            continue;
                        }
                        storageKeys[realKey['realkey']] = { "key": key, "expires": realKey['expires'] };
                    }
                }
            }
        };
    }]);

})();
