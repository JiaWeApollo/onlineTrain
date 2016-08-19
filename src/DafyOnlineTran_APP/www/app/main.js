require.config({
    baseUrl: 'app',
    paths: {
        'ionic': '../lib/ionic/js/ionic.bundle.min',
        'ngCordova': '../lib/ngCordova/dist/ng-cordova',
        'ocLazyLoad': '../lib/ocLazyLoad/dist/ocLazyLoad',
        'jquery': '../lib/jquery/jquery',
        'angularAMD': '../lib/angularAMD/angularAMD.min', 
        'ngload': '../lib/angularAMD/ngload.min', 
        'angularUiRouterExtra': '../lib/ui-router-extra/release/ct-ui-router-extras.min', 
        'ui-router': '../lib/ionic/js/angular-ui/angular-ui-router',
        'angular': '../lib/ionic/js/angular/angular',
        'lazy-image': '../lib/angular-lazy-image/lazy-image',
        'file-upload': '../lib/ng-file-upload/ng-file-upload',
        'angular-bootstrap': '../lib/angular-bootstrap/ui-bootstrap-tpls',
        'angularCss': '../lib/angular-css/angular-css.min',
        'bindonce':'../lib/angular-bindonce/bindonce.min',
        'localStorageUsage':'../lib/ng-localStorage/localStorageUsage'
        //'angularMessages':'../lib/angular-messages/angular-messages.min'
    },
    shim: {
        'angular-bootstrap': ['angular'],
        'angularCss': ['angular'],
        'ocLazyLoad': ['angular'],
        'file-upload': ['angular'],
        "angular": { exports: "angular" },
        'ngCordova': ['angular'],
        'lazy-image': ['angular'],
        'bindonce': ['angular'],
        'localStorageUsage':['angular']
        //'angularMessages':['angular']
    },
    deps: ['app']
});
