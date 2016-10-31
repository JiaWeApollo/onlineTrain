define(['angular'], function(angular) {

    var filters = angular.module('app.filters', []);

    filters.filter('endsWith', function() { //字符中以某字符结尾 
            return function(str, charS) {
                return str.indexOf(charS, str.length - charS.length) !== -1;
            };
        })
        .filter('indexOfStr', function() { //
            return function(oStr, nStr) {
                var nStrAry, oStrAry;
                var isFlagStr = '';

                if (nStr != '' || nStr != null) {
                    nStrAry = nStr.split(',');
                }
                if (oStr != '' || oStr != null) {
                    oStr = oStr.substring(0, oStr.length - 1);
                    console.log('oStr=' + oStr);

                    oStrAry = oStr.split(',');
                }
                console.log('nStr=' + nStr);

                var j = 0;

                for (var i = 0; i < nStrAry.length; i++) {
                    if (nStrAry[i] == '')
                        continue;
                    j += 1;
                    if (oStr.indexOf(nStrAry[i]) !== -1) {
                        isFlagStr += 'true,';
                    } else {
                        isFlagStr += 'false,';
                        break;
                    }
                }
                //console.log(j+'isFlagStr='+isFlagStr+',oStrAry='+oStrAry);

                if (oStrAry.length == j && !(isFlagStr.indexOf('false') !== -1)) {
                    return true;
                } else {
                    return false;
                }
            };
        })
        .filter('renderLitPic', ['$sce','Settings',function($sce,Settings) {

            return function(rPic,dPic) {
                var str = dPic;
                if (rPic)
                    str = Settings.headImgUrl + rPic;

                return $sce.trustAsHtml(str);
            }
        }]);
    return filters;
});
