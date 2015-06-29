/// <reference path="../typings/ExchangeWebService.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/yargs/yargs.d.ts" />
/// <reference path="../typings/gulp/gulp.d.ts" />
/// <reference path="../typings/colors/colors.d.ts" />
import {useCustomPromise, useCustomXhr, Uri, AttendeeInfo, TimeZoneDefinition, TimeWindow, DateTime, TimeSpan, DateTimeKind, TimeZoneInfo, AvailabilityData, EmailMessageSchema, ItemSchema, AggregateType, SortDirection, AutodiscoverService, ExchangeVersion, ExchangeCredentials, ExchangeService, UserSettingName, DomainSettingName, BasePropertySet, PropertySet, EnumHelper, FolderId, WellKnownFolderName, DOMParser, ItemView, Grouping, EwsLogging, AppointmentSchema, CalendarActionResults, EwsUtilities, MeetingCancellation, MeetingRequest, MeetingResponse, Appointment, Item, StringHelper, ResolveNameSearchLocation, MeetingAttendeeType, AvailabilityOptions, SuggestionQuality, LegacyFreeBusyStatus, ServiceResult, MailboxType} from "ews-javascript-api";

import Table = require("cli-table");
import colors = require("colors");
var colors_black_compile_keep = colors.black("");//to keep in typescript compile
/** meeting suggestions using GetUserAvailablility */
export class nameResolution1 {
        static run(credentials: { userName: string, password: string }, argv: any) {
                var exch = new ExchangeService(ExchangeVersion.Exchange2013);
                exch.Credentials = new ExchangeCredentials(credentials.userName, credentials.password);
                exch.Url = new Uri("https://outlook.office365.com/Ews/Exchange.asmx");
                EwsLogging.DebugLogEnabled = false;

                var searchstring: string = "gstest";
                if (argv && argv["s"]) {
                        searchstring = argv["s"];
                }

                exch.ResolveName(searchstring, ResolveNameSearchLocation.DirectoryOnly, true, PropertySet.FirstClassProperties)
                        .then((response) => {

                                var heads = ["Type".cyan, "DisplayName".cyan, "Alias".cyan, "First Name".cyan, "Last Name".cyan];
                                //attendees.forEach((entry) => { heads.push(entry.SmtpAddress.blue) });
                                var table = new Table({
                                        head: heads
                                        //, colWidths: [100, 50]
                                });
                                for (var nameResolution of response.Items) {
                                        var row = [];
                                        row.push(MailboxType[nameResolution.Mailbox.MailboxType].green);
                                        row.push(nameResolution.Contact.DisplayName || "n/a");
                                        row.push(nameResolution.Contact.Alias || "n/a");
                                        row.push(nameResolution.Contact.GivenName || "n/a");
                                        row.push(nameResolution.Contact.Surname || "n/a");
                                        table.push(row);
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