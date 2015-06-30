/// <reference path="../typings/ExchangeWebService.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/yargs/yargs.d.ts" />
/// <reference path="../typings/gulp/gulp.d.ts" />
/// <reference path="../typings/colors/colors.d.ts" />
import {useCustomPromise, useCustomXhr, Uri, AttendeeInfo, TimeZoneDefinition, TimeWindow, DateTime, TimeSpan, DateTimeKind, TimeZoneInfo, AvailabilityData, EmailMessageSchema, ItemSchema, AggregateType, SortDirection, AutodiscoverService, ExchangeVersion, ExchangeCredentials, ExchangeService, UserSettingName, DomainSettingName, BasePropertySet, PropertySet, EnumHelper, FolderId, WellKnownFolderName, DOMParser, ItemView, Grouping, EwsLogging, AppointmentSchema, CalendarActionResults, EwsUtilities, MeetingCancellation, MeetingRequest, MeetingResponse, Appointment, Item, StringHelper, ResolveNameSearchLocation, MeetingAttendeeType, AvailabilityOptions, SuggestionQuality, LegacyFreeBusyStatus, ServiceResult} from "ews-javascript-api";

import Table = require("cli-table");
import colors = require("colors");
var colors_black_compile_keep = colors.black("");//to keep in typescript compile
/** meeting suggestions using GetUserAvailablility */
export class availability1 {
        static run(credentials: { userName: string, password: string }, argv: any) {
                var exch = new ExchangeService(ExchangeVersion.Exchange2013);
                exch.Credentials = new ExchangeCredentials(credentials.userName, credentials.password);
                exch.Url = new Uri("https://outlook.office365.com/Ews/Exchange.asmx");
                
                var attendee1 = new AttendeeInfo("gstest@singhspro.onmicrosoft.com");
                attendee1.AttendeeType = MeetingAttendeeType.Organizer;
                var attendee2 = new AttendeeInfo("gs@singhspro.onmicrosoft.com");
                attendee2.AttendeeType = MeetingAttendeeType.Required;

                var tmw = new TimeWindow(DateTime.Now.Add(0.6, 'd'), DateTime.Now.Add(3, 'd'));

                var attendees = [attendee1];
                if (argv && argv["a"]) {
                        var attendeelist: string[] = argv["a"];
                        if (Array.isArray(attendeelist)) {
                                for (var entry of attendeelist) {
                                        var attendee: AttendeeInfo = new AttendeeInfo(entry);
                                        attendee.AttendeeType = MeetingAttendeeType.Required;
                                        attendees.push(attendee);
                                }
                        }
                        else {
                                var attendee: AttendeeInfo = new AttendeeInfo(<any>attendeelist);
                                attendee.AttendeeType = MeetingAttendeeType.Required;
                                attendees.push(attendee);
                        }
                }
                else {
                        attendees = [attendee1, attendee2]; //, att3, att4];
                }
                var myOptions = new AvailabilityOptions();
                myOptions.MeetingDuration = 30;
                myOptions.MaximumNonWorkHoursSuggestionsPerDay = 4;
                myOptions.GoodSuggestionThreshold = 20;
                myOptions.MinimumSuggestionQuality = SuggestionQuality.Poor;
                myOptions.DetailedSuggestionsWindow = new TimeWindow(DateTime.Now.Add(0.6, 'd'), DateTime.Now.Add(3, 'd'));

                exch.GetUserAvailability(attendees, tmw, AvailabilityData.FreeBusyAndSuggestions, myOptions)
                        .then((freeBusyResults) => {
                                console.log(StringHelper.Format("Availability for {0} and {1}", attendees[0].SmtpAddress, attendees[1].SmtpAddress));
                                var heads = ["time suggestios".cyan];
                                attendees.forEach((entry) => { heads.push(entry.SmtpAddress.cyan) });
                                heads.push("Work Hour".magenta)
                                var table = new Table({
                                        head: heads
                                        //, colWidths: [100, 50]
                                });
                                for (var suggestion of freeBusyResults.Suggestions) {
                                        //console.log(suggestion.Date.Format('YYYY/MM/DD'));
                                        //console.log();
                                        for (var timeSuggestion of suggestion.TimeSuggestions) {
                                                //console.log("Suggested meeting time:" + timeSuggestion.MeetingTime.Format('YYYY/MM/DD hh:mm'));
                                                //console.log(timeSuggestion.MeetingTime);
                                                var row = [timeSuggestion.MeetingTime.Format('YYYY/MM/DD HH:mm')];
                                                var timesuggestion = timeSuggestion.MeetingTime.Format('YYYY/MM/DD HH:mm');
                                                var laststatus = 0;
                                                timeSuggestion.Conflicts.forEach((conflict) => {
                                                        var status = LegacyFreeBusyStatus[conflict.FreeBusyStatus];
                                                        //console.log(status);
                                                        status = status === LegacyFreeBusyStatus[LegacyFreeBusyStatus.Busy] ? status.red : status === LegacyFreeBusyStatus[LegacyFreeBusyStatus.Free] ? status.green : status === LegacyFreeBusyStatus[LegacyFreeBusyStatus.Tentative] ? status.yellow : status === LegacyFreeBusyStatus[LegacyFreeBusyStatus.OOF] ? status.cyan : status.grey;
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
                                        //, colWidths: [100, 50]
                                });
                                for (var availability of freeBusyResults.AttendeesAvailability.Responses) {
                                        //console.log(ServiceResult[availability.Result]);
                                        //console.log();
                                        for (var calendarItem of availability.CalendarEvents) {
                                                row = [];
                                                row.push(calendarItem.StartTime.Format('YYYY/MM/DD HH:mm'));
                                                row.push(calendarItem.EndTime.Format('YYYY/MM/DD HH:mm'));
                                                row.push(LegacyFreeBusyStatus[calendarItem.FreeBusyStatus]);

                                                table.push(row);
                                                // console.log("Free/busy status: " + );
                                                // console.log("Start time: " + calendarItem.StartTime.Format('YYYY/MM/DD HH:mm'));
                                                // console.log("End time: " + calendarItem.EndTime.Format('YYYY/MM/DD HH:mm'));
                                                // console.log();
                                        }
                                }
                                console.log(table.toString());
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
}