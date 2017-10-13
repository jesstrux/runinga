var sModule =  angular.module('runinga.services', []);
const scrapeIt = require("scrape-it");
const {dialog} = require('electron').remote;
const globParent = require('glob-parent');
const mainPath = require('path');
const url = require('url');

sModule.factory('Muse', function($http, $q) {
    return {
        getSchedule: function(date){
            var def = $q.defer();
            var schedule_url = "http://www.tvmuse.com/schedule.html?date="+date;
            
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

                    var show_trailers = [];
                    var count = 0;

                    if(info._links.nextepisode)
                        thisService.getShowTrailerLink(info._links.nextepisode.href)
                        .then(function(next){
                            next = next.substring(next.indexOf("embed/") + 6, next.length);

                            show_trailers.push({title: "Next Episode", id: next});
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
                        show_trailers.push({title: "Previous Episode", id: prev});
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
                    genre: info.genres.join(", "),
                    premiered: info.premiered,
                    status: info.status,
                    description: info.summary.replace('<p>', '').replace('</p>', ''),
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
                    attr: "src", convert: x => x.indexOf("//") != -1 ? x.replace("//", "http://") : x
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


sModule.factory('Favorites', function($q, $localForage) {
    var thisService = {
        isFavorite: function(name){
            var def = $q.defer();
            $localForage
            .getItem('favoriteShows')
            .then(function(shows){
                if(!shows || !shows.length)
                    def.resolve(false);
                else 
                    def.resolve(shows.indexOf(name) != -1);
            });

            return def.promise;
        },
        toggleFavorite: function(name){
            var def = $q.defer();
            thisService.getFavorites()
            .then(function(shows){
                if(!shows)
                    shows = [];

                var showIndex = shows.indexOf(name);
                var faved = showIndex != -1;
                if(faved)
                    shows.splice(showIndex, 1);
                else
                    shows.push(name);

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
                def.resolve(true);
            });
            return def.promise;
        }
    }

    return thisService;
});