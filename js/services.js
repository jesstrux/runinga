var sModule =  angular.module('runinga', []);
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
            
            scrapeIt(schedule_url, 
                // {schedule: ".ringtone ~ div:not(.noprint):not(.footer-wrap):not(.smt)"})
                {
                    schedule : {
                        listItem : ".table_schedule .cfix",
                        data : {
                            avatar: {
                                selector: "img"
                              , attr: "src"
                            },
                            name: {
                                selector: "img"
                              , attr: "alt"
                            },
                            link: {
                                selector: ".c1 a",
                                attr: "href",
                                convert: x => "http://www.tvmuse.com/" + x
                            },
                            episode: {
                                selector: ".c2 a",
                                convert: x => x.replace("Season ", "S").replace("Episode ", "E")
                            },
                            episodeName: ".c3 a",
                            time: ".c4",
                            network: ".c5 span"
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