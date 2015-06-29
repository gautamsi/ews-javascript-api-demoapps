/// <reference path="./typings/ExchangeWebService.d.ts" />
/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/yargs/yargs.d.ts" />
/// <reference path="./typings/gulp/gulp.d.ts" />
var yargs = require('yargs');
var argv = yargs.argv;
var ews_javascript_api_1 = require("ews-javascript-api");
var credentials = require("./credentials");
function exec() {
    var exch = new ews_javascript_api_1.ExchangeService(ews_javascript_api_1.ExchangeVersion.Exchange2013);
    exch.Credentials = new ews_javascript_api_1.ExchangeCredentials(credentials.userName, credentials.password);
    exch.Url = new ews_javascript_api_1.Uri("https://outlook.office365.com/Ews/Exchange.asmx");
    ews_javascript_api_1.EwsLogging.DebugLogEnabled = false;
    var attendee1 = new ews_javascript_api_1.AttendeeInfo("gs@singhspro.onmicrosoft.com");
    attendee1.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Required;
    var attendee2 = new ews_javascript_api_1.AttendeeInfo("gstest@singhspro.onmicrosoft.com");
    attendee2.AttendeeType = ews_javascript_api_1.MeetingAttendeeType.Organizer;
    // var attendee1 = new AttendeeInfo("gautamsi@microsoft.com");
    // var attendee2 = new AttendeeInfo("abhijitp@microsoft.com");
    // var att3 = new AttendeeInfo("pardeb@microsoft.com");
    // var att4 = new AttendeeInfo("bakul.jais@microsoft.com");
    var tmw = new ews_javascript_api_1.TimeWindow(ews_javascript_api_1.DateTime.Now.Add(1, 'd'), ews_javascript_api_1.DateTime.Now.Add(3, 'd'));
    var attendees = [attendee1, attendee2]; //, att3, att4];
    var myOptions = new ews_javascript_api_1.AvailabilityOptions();
    myOptions.MeetingDuration = 60;
    myOptions.MaximumNonWorkHoursSuggestionsPerDay = 0;
    myOptions.GoodSuggestionThreshold = 49;
    myOptions.MinimumSuggestionQuality = ews_javascript_api_1.SuggestionQuality.Good;
    myOptions.DetailedSuggestionsWindow = new ews_javascript_api_1.TimeWindow(ews_javascript_api_1.DateTime.Now.Add(2, 'd'), ews_javascript_api_1.DateTime.Now.Add(3, 'd'));
    exch.GetUserAvailability(attendees, tmw, ews_javascript_api_1.AvailabilityData.Suggestions, myOptions)
        .then(function (results) {
        console.log(ews_javascript_api_1.StringHelper.Format("Availability for {0} and {1}", attendees[0].SmtpAddress, attendees[1].SmtpAddress));
        for (var _i = 0, _a = results.Suggestions; _i < _a.length; _i++) {
            var suggestion = _a[_i];
            console.log(suggestion.Date.Format('YYYY/MM/DD'));
            console.log();
            for (var _b = 0, _c = suggestion.TimeSuggestions; _b < _c.length; _b++) {
                var timeSuggestion = _c[_b];
                console.log("Suggested meeting time:" + timeSuggestion.MeetingTime.Format('YYYY/MM/DD hh:mm'));
                console.log();
            }
        }
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
}
exec();
