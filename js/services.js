var sModule =  angular.module('runinga.services', []);
const scrapeIt = require("scrape-it");
const {dialog} = require('electron').remote;

sModule.factory('Muse', function($http, $q) {
    return {
        getSchedule: function(date){
            var def = $q.defer();
            var schedule_url = "http://www.tvmuse.com/schedule.html?date="+date;
            console.log(schedule_url);
            
            scrapeIt(schedule_url, {
                schedule : {
                    listItem : ".table_schedule .cfix",
                    data : {
                        poster: {selector: "img", attr: "src"},
                        name: {selector: "img", attr: "alt"},
                        link: {selector: ".c1 a",attr: "href",
                            convert: x => "http://www.tvmuse.com/" + x
                        },
                        episode: {selector: ".c2 a",
                            convert: x => x.replace("Season ", "S").replace("Episode ", "E")
                        },
                        episodeName: ".c3 a", time: ".c4", network: ".c5 span"
                    }
                },
            })
            .then(page => {
                def.resolve(page.schedule);
            })
            .catch(err => {
                def.reject(err);
            });

            return def.promise;
        }
    }
});

sModule.factory('ShowService', function($http, $q, $rootScope, $localForage, Favorites) {
    var thisService = {
        fetchShowsOnlineNew: function(p){
            var def = $q.defer();
            var BASE_URL = "https://www.tvmaze.com/";
            var full_url = p ? BASE_URL+"shows?page=" + p + "&" : BASE_URL+"shows?";
            // var x = require('x-ray')();
            // x(full_url + 'Show%5Bsort%5D=1', {
            //   shows: x('.pricing-table', [{
            //     name: '.bullet-item a',
            //     poster: 'img@src'
            //   }])
            // })
            // // .paginate('.pagination .next a@href')
            // // .limit(2)
            // (function (err, obj) {
            //   // console.log(err, JSON.stringify(obj));
            //   if(err != null){
            //     def.reject(err);
            //   }else{
            //     // def.resolve(obj[0].shows.concat(obj[1].shows));
            //     def.resolve(obj.shows);
            //   }
            // });

            scrapeIt(full_url + 'Show%5Bsort%5D=1', {
                shows: {
                    listItem: ".pricing-table",
                    data: {
                        name: '.bullet-item a',
                        poster: {
                            selector: 'img',
                            attr: 'src'
                        }
                    }
                }
            })
            .then(page => {
                def.resolve(page.shows);
            })
            .catch(err => {
                def.reject(err);
            });

            return def.promise;
        },
        fetchShowsOnline: function(p){
            var def = $q.defer();
            var BASE_URL = "http://api.tvmaze.com/";
            var full_url = p ? BASE_URL+"shows?page=" + p : BASE_URL+"shows";

            $http({
                method: "GET",
                url: full_url,
                // +"&apikey="+API_KEY
            }).then(function(response) {
                if(response.status != 200){
                    def.reject("Failed to fetch show listings!");
                    return;
                }
                var shows = response.data
                .map(function(info){
                    return {
                        poster: info.image ? info.image.original : info.image,
                        name: info.name,
                        network: info.network ? info.network.name : "",
                        day: info.schedule.days.join(", "),
                        time: info.schedule.time,
                        genre: info.genres.join(", "),
                        premiered: info.premiered ? info.premiered.substring(0,4) : info.premiered,
                        status: info.status,
                        continuing: info.status == "Running",
                        popular: info.weight > 80,
                        age: Math.round((Date.now() - new Date(info.premiered))/(1000*60*60*24*365)),
                        description: info.summary ? info.summary.replace(/(<([^>]+)>)/ig, '') : info.summary,
                        rating: info.rating.average / 2,
                        _links: info._links
                    };
                });
                def.resolve(shows);
            })
            .catch(function(error){
                console.log(error);
                def.reject("Failed to fetch show listings!");
            });

            return def.promise;
        },

        searchShows: function(query){
            var def = $q.defer();
            var BASE_URL = "http://api.tvmaze.com/search/shows?q=";

            $http({
                method: "GET",
                url: BASE_URL+query
                // +"&apikey="+API_KEY
            }).then(function(response) {
                if(response.status != 200){
                    def.reject("Failed to fetch show listings!");
                    return;
                }
                
                var shows = response.data
                .map(function(data){
                    var info = data.show;
                    // return info;
                    return {
                        poster: info.image ? info.image.original : "",
                        name: info.name,
                        network: info.network ? info.network.name : "",
                        day: info.schedule.days.join(", "),
                        time: info.schedule.time,
                        genre: info.genres.join(", "),
                        premiered: info.premiered,
                        status: info.status,
                        continuing: info.status == "Running",
                        popular: info.weight > 80,
                        age: Math.round((Date.now() - new Date(info.premiered))/(1000*60*60*24*365)),
                        description: info.summaru ? info.summary.replace(/(<([^>]+)>)/ig, '') : "",
                        rating: info.rating.average / 2,
                        _links: info._links
                    };
                });
                def.resolve(shows);
            })
            .catch(function(error){
                console.log(error);
                def.reject("Failed to fetch show listings!");
            });

            return def.promise;
        },

        getDetails: function(name){
            var def = $q.defer();

            thisService.fetchFromCache(name)
            .then(function(info){
                console.log("Found cached version!");
                def.resolve(info);
            })
            .catch(function(err){
                console.log("Show not cached");
                thisService.fetchOnline(name)
                .then(function(info){
                    def.resolve(info);
                    thisService.fetchTrailers({_links: info._links});
                    thisService.cacheShow(info);
                })
                .catch(function(error){
                    console.log(error);
                    def.reject("Failed to fetch show details!");
                });
            });

            return def.promise;
        },
        
        fetchOnline: function(name){
            var def = $q.defer();
            var BASE_URL = "http://api.tvmaze.com/";

            $http({
                method: "GET",
                url: BASE_URL+"singlesearch/shows?q="+name
                // +"&apikey="+API_KEY
            }).then(function(response) {
                if(response.status != 200){
                    def.reject("Failed to fetch show details!");
                    return;
                }
                var info = response.data;
                var show = {
                    poster: info.image.original,
                    name: info.name,
                    network: info.network.name,
                    day: info.schedule.days.join(", "),
                    time: info.schedule.time,
                    genre: info.genres.join(", "),
                    premiered: info.premiered,
                    status: info.status,
                    description: info.summary.replace(/(<([^>]+)>)/ig, ''),
                    rating: info.rating.average / 2,
                    _links: info._links
                };

                Favorites.isFavorite(info.name)
                    .then(function(state){
                        show.faved = state;
                        def.resolve(show);
                    });
            })
            .catch(function(error){
                console.log(error);
                def.reject("Failed to fetch show details!");
            });

            return def.promise;
        },

        fetchFromCache: function(name){
            var def = $q.defer();
            $localForage
            .getItem('cachedShows')
            .then(function(shows){
                console.log("Cached shows", shows);

                if(!shows){
                    def.reject();
                }else{
                    var perma = name.replace("'", "").replace(" ", "_");
                    var show = shows[perma];
                    if(show)
                        def.resolve(show);
                    else
                        def.reject();
                }
            });
            return def.promise;
        },

        fetchTrailers: function(info){
            if(!info || !info._links)
                return;
            
            var show_trailers = {};
            var count = 0;

            if(info._links.nextepisode)
                thisService.getShowTrailerLink(info._links.nextepisode.href)
                .then(function(next){
                    if(!next)
                        return;

                    next = next.substring(next.indexOf("embed/") + 6, next.length);

                    show_trailers['next'] = {title: "Next Episode", id: next};
                    count+=1;
                    
                    $rootScope.$broadcast('trailersFetched',{trailers:show_trailers});

                    info.trailers = show_trailers;

                    if(info.name)
                        thisService.cacheShow(info);
                });
            else
                count+=1;

            thisService.getShowTrailerLink(info._links.previousepisode.href)
            .then(function(prev){
                if(!prev)
                    return;

                prev = prev.substring(prev.indexOf("embed/") + 6, prev.length);
                show_trailers['previous'] = {title: "Previous Episode", id: prev};
                count+=1;
                console.log("Prev trailer id: " + prev);
                $rootScope.$broadcast('trailersFetched',{trailers:show_trailers});

                info.trailers = show_trailers;
                if(info.name)
                    thisService.cacheShow(info);
            });
        },

        getShowTrailerLink: function(show_path){
            var show_path = show_path.replace("api", "www");
            var def = $q.defer();
            
            scrapeIt(show_path, {
                trailer: {
                    selector: "#episode-video iframe", 
                    attr: "src"
                    // , convert: x => !x || x.indexOf("//") != -1 ? x.replace("//", "http://") : x
                }
            })
            .then(page => {
                def.resolve(page.trailer);
            });

            return def.promise;
        },
        cacheShow: function(show){
            var def = $q.defer();
            $localForage
            .getItem('cachedShows')
            .then(function(shows){
                if(!shows)
                    shows = {};

                console.log(show.name);
                return;
                var perma = show.name.replace("'", "").replace(" ", "_");

                shows[perma] = show;
                
                $localForage
                    .setItem('cachedShows', shows)
                    .then(function(){
                        console.log("Show cached");
                        def.resolve(true);
                    });
            });
            return def.promise;
        },
        clearShowsCache: function(show){
            var def = $q.defer();
            $localForage
                .setItem('cachedShows', {})
                .then(function(){
                    console.log("Show cached");
                    def.resolve(true);
                });

            return def.promise;    
        }
    }

    return thisService;
});


sModule.factory('Favorites', function($q, $localForage, $rootScope) {
    var thisService = {
        isFavorite: function(name){
            var def = $q.defer();
            $localForage
            .getItem('favoriteShows')
            .then(function(shows){
                if(!shows || !shows.length)
                    def.resolve(false);
                else 
                    def.resolve(shows.findIndex(f => f.name === name) != -1);
            });

            return def.promise;
        },
        toggleFavorite: function(show){
            var name = show.name;
            var def = $q.defer();
            thisService.getFavorites()
            .then(function(shows){
                if(!shows)
                    shows = [];

                var showIndex = shows.findIndex((f) => f.name === name);
                console.log(showIndex);

                var faved = showIndex != -1;
                if(faved)
                    shows.splice(showIndex, 1);
                else
                    shows.push(show);

                thisService.setFavorites(shows)
                .then(function(c){
                    def.resolve(!faved);
                });;
            });

            return def.promise;
        },
        getFavorites: function(){
            var def = $q.defer();
            $localForage
            .getItem('favoriteShows')
            .then(function(shows){
                if(!shows)
                    shows = [];

                def.resolve(shows);
            });
            return def.promise;
        },
        setFavorites: function(favs){
            var def = $q.defer();
            $localForage
            .setItem('favoriteShows', favs)
            .then(function(){
                $rootScope.$broadcast('favorites-changed', favs);
                def.resolve(true);
            });
            return def.promise;
        }
    }

    return thisService;
});