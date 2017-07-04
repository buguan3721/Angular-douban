(function (angular) {

    var app = angular.module('app',['ngRoute']);
    app.config(['$routeProvider',function ($routeProvider) {

        $routeProvider.when('/movie/:type',{
            templateUrl:'movie_list_tpl.html',
            controller:"movieController"

        }).when('/detail/:id',{
            templateUrl:'movie_detail_tpl.html',
            controller:'detailController'

        }).when('/search',{
            templateUrl:'movie_list_tpl.html',
            controller:'searchController'

        }).otherwise({
            redirectTo:'/movie/in_theaters'
        });

    }]);
    
    app.controller('searchController',['$scope','wwHttp',function ($scope,xmgHttp) {

        var url = "https://api.douban.com/v2/movie/search";
        var params ={
            q:$scope.search_content
        };
        xmgHttp.jsonp(url,params,function (data) {
            $scope.title = data.title;
            $scope.movieList = data.subjects;
            $scope.isLoading = true;
            $scope.$apply();
        });


    }]);


    app.controller('detailController',['$scope','wwHttp','$routeParams',function ($scope,xmgHttp,$routeParams) {
        var url = "https://api.douban.com/v2/movie/subject/";
        url += $routeParams.id;

        xmgHttp.jsonp(url,null,function (data) {
           console.log(data);
           $scope.movieData = data;
           $scope.$apply();
        });


    }]);


    app.controller('movieController',['$scope','wwHttp',"$routeParams",function ($scope,wwHttp,$routeParams) {
        $scope.isLoading = false;
        $scope.loadData = function (params) {
            /*请求数据*/
            var url = "https://api.douban.com/v2/movie/";
            url += $routeParams.type;

            /*请求数据*/
            wwHttp.jsonp(url,params,function (data) {

                $scope.movieList =  data.subjects;
                $scope.totalPage = Math.ceil(data.total/$scope.count);
                $scope.isLoading = true;
                /*强制刷新列表*/
                $scope.$apply();

            });
        };


        var params={
            start:0,
            count:5
        };
        $scope.loadData(params);


        /*定义属性当前是第几页*/
        $scope.curPage = 1;
        $scope.count = 5;
        $scope.isPrePage = false;
        $scope.isNextPage = true;

        $scope.page = function (type) {
            /*判断上一页下一页*/
            if (type == "prePage"){
                $scope.curPage--;
            }else if(type == "nextPage"){
                $scope.curPage++;
            }

            $scope.isPrePage = $scope.curPage <= 1 ? false : true;
            $scope.isNextPage = $scope.curPage == $scope.totalPage ? false : true;

            /*从哪一页开始*/
            $scope.start = ($scope.curPage -1) * $scope.count;
            var params={
                start:$scope.start,
                count:$scope.count
            };
            $scope.loadData(params);
        };

    }]);

    app.service('wwHttp',['$window',function ($window) {

        this.jsonp = function (url,params,fun) {

            /*1.生成一个函数名称*/
            var callBackName = "callBack"+Math.random().toString().slice(2);
            console.log(callBackName);
            /*2.往window身上添加一个方法*/
            $window[callBackName] = function (data) {
                /*执行回调函数*/
                fun(data);
                /*请求完毕时, 把创建的标签删除*/
                $window.document.body.removeChild(newScript);
            };

            /*3.创建一个script标签*/
            var newScript = $window.document.createElement('script');
            /*3.1 把传入的对象转成查询参数*/
            var queryString = "";
            for (var key in params){
                queryString += key + "=" + params[key] + "&"
            }
            /*3.2 往查询参数后面拼接生成的函数名称*/
            queryString += "callback=" + callBackName;

            /*3.3 拼接url*/
            url  =  url + "?" + queryString;
            newScript.src = url;

            /*4.把创建的标签添加到dom中*/
            $window.document.body.appendChild(newScript);
        };
    }]);

})(angular);
