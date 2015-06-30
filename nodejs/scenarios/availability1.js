/// <reference path="../typings/ExchangeWebService.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/yargs/yargs.d.ts" />
/// <reference path="../typings/gulp/gulp.d.ts" />
/// <reference path="../typings/colors/colors.d.ts" />
var ews_javascript_api_1 = require("ews-javascript-api");
var Table = require("cli-table");
var colors = require("colors");
var colors_black_compile_keep = colors.black(""); //to keep in typescript compile
/** meeting suggestions using GetUserAvailablility */
var availability1 = (function () {
    function availability1() {
    }
    availability1.run = function (credentials, argv) {
        var exch = new ews_javascript_api_1.ExchangeService(ews_javascript_api_1.ExchangeVersion.Exchange2013);
        exch.Credentials = new ews_javascript_api_1.ExchangeCredentials(credentials.userName, credentials.password);
        exch.Url = new ews_javascript_api_1.Uri("https://outlook.office365.com/Ews/Exchange.asmx");
        var attendee1 = new ews_javascript_api_1.AttendeeInfo("gstest@singhspro.onmicrosoft.com");
        attendee1.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Organizer;
        var attendee2 = new ews_javascript_api_1.AttendeeInfo("gs@singhspro.onmicrosoft.com");
        attendee2.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Required;
        var tmw = new ews_javascript_api_1.TimeWindow(ews_javascript_api_1.DateTime.Now.Add(0.6, 'd'), ews_javascript_api_1.DateTime.Now.Add(3, 'd'));
        var attendees = [attendee1];
        if (argv && argv["a"]) {
            var attendeelist = argv["a"];
            if (Array.isArray(attendeelist)) {
                for (var _i = 0; _i < attendeelist.length; _i++) {
                    var entry = attendeelist[_i];
                    var attendee = new ews_javascript_api_1.AttendeeInfo(entry);
                    attendee.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Required;
                    attendees.push(attendee);
                }
            }
            else {
                var attendee = new ews_javascript_api_1.AttendeeInfo(attendeelist);
                attendee.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Required;
                attendees.push(attendee);
            }
        }
        else {
            attendees = [attendee1, attendee2]; //, att3, att4];
        }
        var myOptions = new ews_javascript_api_1.AvailabilityOptions();
        myOptions.MeetingDuration = 30;
        myOptions.MaximumNonWorkHoursSuggestionsPerDay = 4;
        myOptions.GoodSuggestionThreshold = 20;
        myOptions.MinimumSuggestionQuality = ews_javascript_api_1.SuggestionQuality.Poor;
        myOptions.DetailedSuggestionsWindow = new ews_javascript_api_1.TimeWindow(ews_javascript_api_1.DateTime.Now.Add(0.6, 'd'), ews_javascript_api_1.DateTime.Now.Add(3, 'd'));
        exch.GetUserAvailability(attendees, tmw, ews_javascript_api_1.AvailabilityData.FreeBusyAndSuggestions, myOptions)
            .then(function (freeBusyResults) {
            console.log(ews_javascript_api_1.StringHelper.Format("Availability for {0} and {1}", attendees[0].SmtpAddress, attendees[1].SmtpAddress));
            var heads = ["time suggestios".cyan];
            attendees.forEach(function (entry) { heads.push(entry.SmtpAddress.cyan); });
            heads.push("Work Hour".magenta);
            var table = new Table({
                head: heads
            });
            for (var _i = 0, _a = freeBusyResults.Suggestions; _i < _a.length; _i++) {
                var suggestion = _a[_i];
                //console.log(suggestion.Date.Format('YYYY/MM/DD'));
                //console.log();
                for (var _b = 0, _c = suggestion.TimeSuggestions; _b < _c.length; _b++) {
                    var timeSuggestion = _c[_b];
                    //console.log("Suggested meeting time:" + timeSuggestion.MeetingTime.Format('YYYY/MM/DD hh:mm'));
                    //console.log(timeSuggestion.MeetingTime);
                    var row = [timeSuggestion.MeetingTime.Format('YYYY/MM/DD HH:mm')];
                    var timesuggestion = timeSuggestion.MeetingTime.Format('YYYY/MM/DD HH:mm');
                    var laststatus = 0;
                    timeSuggestion.Conflicts.forEach(function (conflict) {
                        var status = ews_javascript_api_1.LegacyFreeBusyStatus[conflict.FreeBusyStatus];
                        //console.log(status);
                        status = status === ews_javascript_api_1.LegacyFreeBusyStatus[ews_javascript_api_1.LegacyFreeBusyStatus.Busy] ? status.red : status === ews_javascript_api_1.LegacyFreeBusyStatus[ews_javascript_api_1.LegacyFreeBusyStatus.Free] ? status.green : status === ews_javascript_api_1.LegacyFreeBusyStatus[ews_javascript_api_1.LegacyFreeBusyStatus.Tentative] ? status.yellow : status === ews_javascript_api_1.LegacyFreeBusyStatus[ews_javascript_api_1.LegacyFreeBusyStatus.OOF] ? status.cyan : status.grey;
                        //console.log(status);
                        row.push(status);
                    });
                    //row.splice(0,1,timesuggestion);
                    while (row.length < attendees.length + 1) {
                        row.push("n/a".grey);
                    }
                    var workhour = timeSuggestion.IsWorkTime ? "true".green : "false".yellow;
                    row.push(workhour);
                    table.push(row);
                }
            }
            console.log(table.toString());
            //console.log(freeBusyResults.AttendeesAvailability);
            var heads = ["Start Time".cyan, "End Time".cyan, "Status".cyan];
            table = new Table({
                head: heads
            });
            for (var _d = 0, _e = freeBusyResults.AttendeesAvailability.Responses; _d < _e.length; _d++) {
                var availability = _e[_d];
                //console.log(ServiceResult[availability.Result]);
                //console.log();
                for (var _f = 0, _g = availability.CalendarEvents; _f < _g.length; _f++) {
                    var calendarItem = _g[_f];
                    row = [];
                    row.push(calendarItem.StartTime.Format('YYYY/MM/DD HH:mm'));
                    row.push(calendarItem.EndTime.Format('YYYY/MM/DD HH:mm'));
                    row.push(ews_javascript_api_1.LegacyFreeBusyStatus[calendarItem.FreeBusyStatus]);
                    table.push(row);
                }
            }
            console.log(table.toString());
            console.log("------ request complete ------");
        }, function (ei) {
            ews_javascript_api_1.EwsLogging.Log(ei, true, true);
            console.log(ei.stack, ei.stack.split("\n"));
            console.log("------------");
        });
        console.log("------------");
        return;
        exch.ResolveName("gstest", ews_javascript_api_1.ResolveNameSearchLocation.DirectoryOnly, true, ews_javascript_api_1.PropertySet.IdOnly)
            .then(function (response) {
            ews_javascript_api_1.EwsLogging.Log(response, true, true);
            console.log(response._getItem(0).Contact.DirectoryPhoto);
            ews_javascript_api_1.EwsLogging.Log("-------------- request complete ----------", true, true);
        });
    };
    return availability1;
})();
exports.availability1 = availability1;
