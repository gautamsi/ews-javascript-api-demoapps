/// <reference path="./typings/ExchangeWebService.d.ts" />
/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/yargs/yargs.d.ts" />
/// <reference path="./typings/gulp/gulp.d.ts" />

import yargs = require('yargs');
var argv = yargs.argv;
import {useCustomPromise, useCustomXhr, Uri, AttendeeInfo, TimeZoneDefinition, TimeWindow, DateTime, TimeSpan, DateTimeKind, TimeZoneInfo, AvailabilityData, EmailMessageSchema, ItemSchema, AggregateType, SortDirection, AutodiscoverService, ExchangeVersion, ExchangeCredentials, ExchangeService, UserSettingName, DomainSettingName, BasePropertySet, PropertySet, EnumHelper, FolderId, WellKnownFolderName, DOMParser, ItemView, Grouping, EwsLogging, AppointmentSchema, CalendarActionResults, EwsUtilities, MeetingCancellation, MeetingRequest, MeetingResponse, Appointment, Item, StringHelper, ResolveNameSearchLocation, MeetingAttendeeType, AvailabilityOptions, SuggestionQuality} from "ews-javascript-api";

declare var require;
var credentials = require("./credentials");

function exec() {
        var exch = new ExchangeService(ExchangeVersion.Exchange2013);
        exch.Credentials = new ExchangeCredentials(credentials.userName, credentials.password);
        exch.Url = new Uri("https://outlook.office365.com/Ews/Exchange.asmx");
        EwsLogging.DebugLogEnabled = false;


        var attendee1 = new AttendeeInfo("gs@singhspro.onmicrosoft.com");
        attendee1.AttendeeType = MeetingAttendeeType.Required;
        var attendee2 = new AttendeeInfo("gstest@singhspro.onmicrosoft.com");
        attendee2.AttendeeType = MeetingAttendeeType.Organizer;

        // var attendee1 = new AttendeeInfo("gautamsi@microsoft.com");
        // var attendee2 = new AttendeeInfo("abhijitp@microsoft.com");
        // var att3 = new AttendeeInfo("pardeb@microsoft.com");
        // var att4 = new AttendeeInfo("bakul.jais@microsoft.com");

        var tmw = new TimeWindow(DateTime.Now.Add(1, 'd'), DateTime.Now.Add(3, 'd'));
        var attendees = [attendee1, attendee2];//, att3, att4];

        var myOptions = new AvailabilityOptions();
        myOptions.MeetingDuration = 60;
        myOptions.MaximumNonWorkHoursSuggestionsPerDay = 0;
        myOptions.GoodSuggestionThreshold = 49;
        myOptions.MinimumSuggestionQuality = SuggestionQuality.Good;
        myOptions.DetailedSuggestionsWindow = new TimeWindow(DateTime.Now.Add(2, 'd'), DateTime.Now.Add(3, 'd'));

        exch.GetUserAvailability(attendees, tmw, AvailabilityData.Suggestions, myOptions)
                .then((results) => {
                        console.log(StringHelper.Format("Availability for {0} and {1}", attendees[0].SmtpAddress, attendees[1].SmtpAddress));
                        for (var suggestion of results.Suggestions) {
                                console.log(suggestion.Date.Format('YYYY/MM/DD'));
                                console.log();
                                for (var timeSuggestion of suggestion.TimeSuggestions) {
                                        console.log("Suggested meeting time:" + timeSuggestion.MeetingTime.Format('YYYY/MM/DD hh:mm'));
                                        console.log();
                                }
                        }

                        console.log("------ request complete ------");
                }, (ei: any) => {
                        EwsLogging.Log(ei, true, true);
                        console.log(ei.stack, ei.stack.split("\n"));
                        console.log("------------");
                });
        console.log("------------");

        return;
        exch.ResolveName("gstest", ResolveNameSearchLocation.DirectoryOnly, true, PropertySet.IdOnly)
                .then((response) => {
                        EwsLogging.Log(response, true, true);
                        console.log(response._getItem(0).Contact.DirectoryPhoto);
                        EwsLogging.Log("-------------- request complete ----------", true, true);
                });

}
exec();