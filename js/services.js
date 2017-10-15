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
        fetchShowsOnline: function(name){
            var def = $q.defer();
            var BASE_URL = "http://api.tvmaze.com/";

            $http({
                method: "GET",
                url: BASE_URL+"shows"
                // +"&apikey="+API_KEY
            }).then(function(response) {
                if(response.status != 200){
                    def.reject("Failed to fetch show listings!");
                    return;
                }
                
                var shows = response.data
                .filter(e => e.weight > 80 && e.status == "Running")
                .sort( (a, b) => b.weight - a.weight)
                .map(function(info){
                    return {
                        poster: info.image.original,
                        name: info.name,
                        network: info.network ? info.network.name : "",
                        day: info.schedule.days.join(", "),
                        time: info.schedule.time,
                        genre: info.genres.join(", "),
                        premiered: info.premiered,
                        status: info.status,
                        description: info.summary.replace(/(<([^>]+)>)/ig, ''),
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

                    thisService.cacheShow(info);

                    var show_trailers = {};
                    var count = 0;

                    if(info._links.nextepisode)
                        thisService.getShowTrailerLink(info._links.nextepisode.href)
                        .then(function(next){
                            next = next.substring(next.indexOf("embed/") + 6, next.length);

                            show_trailers['next'] = {title: "Next Episode", id: next};
                            count+=1;
                            
                            $rootScope.$broadcast('trailersFetched',{trailers:show_trailers});

                            info.trailers = show_trailers;
                            thisService.cacheShow(info);
                        });
                    else
                        count+=1;

                    thisService.getShowTrailerLink(info._links.previousepisode.href)
                    .then(function(prev){
                        prev = prev.substring(prev.indexOf("embed/") + 6, prev.length);
                        show_trailers['previous'] = {title: "Previous Episode", id: prev};
                        count+=1;

                        $rootScope.$broadcast('trailersFetched',{trailers:show_trailers});

                        info.trailers = show_trailers;
                        thisService.cacheShow(info);
                    });
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

        getShowTrailerLink: function(show_path){
            var show_path = show_path.replace("api", "www");
            var def = $q.defer();
            scrapeIt(show_path, {
                trailer: {
                    selector: "#episode-video iframe", 
                    attr: "src", convert: x => !x || x.indexOf("//") != -1 ? x.replace("//", "http://") : x
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
                console.log(shows);
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
                    console.log(faved);
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