import {lcdwriter} from "../pythonmsg";

/// <reference path="../typings/ExchangeWebService.d.ts" />
/// <reference path="../typings/node/node.d.ts" />
/// <reference path="../typings/yargs/yargs.d.ts" />
/// <reference path="../typings/gulp/gulp.d.ts" />
/// <reference path="../typings/colors/colors.d.ts" />
import {useCustomPromise, useCustomXhr, Uri, AttendeeInfo, TimeZoneDefinition, TimeWindow, DateTime, TimeSpan, DateTimeKind, TimeZoneInfo, AvailabilityData, EmailMessageSchema, ItemSchema, AggregateType, SortDirection, AutodiscoverService, ExchangeVersion, ExchangeCredentials, ExchangeService, UserSettingName, DomainSettingName, BasePropertySet, PropertySet, EnumHelper, FolderId, WellKnownFolderName, DOMParser, ItemView, Grouping, EwsLogging, AppointmentSchema, CalendarActionResults, EwsUtilities, MeetingCancellation, MeetingRequest, MeetingResponse, Appointment, Item, StringHelper, ResolveNameSearchLocation, Convert, MeetingAttendeeType, AvailabilityOptions, SuggestionQuality, LegacyFreeBusyStatus, ServiceResult} from "ews-javascript-api";

import Table = require("cli-table");
import colors = require("colors");
var colors_black_compile_keep = colors.black("");//to keep in typescript compile
/** meeting suggestions using GetUserAvailablility */
export class inbox1 {
	static lastTotalCount: number = 0;
	static line1 = "checking...";
	static lastCheckTime = DateTime.Now;
	static get line2(): string { return "lst " + inbox1.lastCheckTime.Format("HH:mm:ss") + " " + inbox1.lastTotalCount; }
	static get message(): string { return inbox1.line1 + "\n" + inbox1.line2 }
	static writemsg(): void { lcdwriter.write(inbox1.message); }
	static run(credentials: { userName: string, password: string }, argv: any) {

		var exch = new ExchangeService(ExchangeVersion.Exchange2013);
		exch.Credentials = new ExchangeCredentials(credentials.userName, credentials.password);
		exch.Url = new Uri("https://outlook.office365.com/Ews/Exchange.asmx");

		if (argv && argv["endless"]) {
			var ms = 5000;
			if (argv["ms"]) {
				ms = Convert.toNumber(argv["ms"]);
				if (ms === NaN || ms < 5) ms = 5;
				if (ms > 20) ms = 20;
			}
			setTimeout(function() {
				inbox1.run(credentials, argv);
			}, ms * 1000);
		}
		inbox1.line1 = "checking...";
		inbox1.writemsg();
		exch.BindToFolder(new FolderId(WellKnownFolderName.Inbox), PropertySet.FirstClassProperties)
			.then((folder) => {
				var heads = ["property".cyan, "value".cyan];
				var table = new Table({
					head: heads
					//, colWidths: [100, 50]
				});
				inbox1.line1 = inbox1.lastTotalCount >= folder.TotalCount ? "no new mail" : "new mail:" + (folder.TotalCount - inbox1.lastTotalCount);
				inbox1.lastTotalCount = folder.TotalCount;
				inbox1.lastCheckTime = DateTime.Now;
				inbox1.writemsg();
				table.push(["Display Name", folder.DisplayName]);
				table.push(["Unread Count", folder.UnreadCount]);
				table.push(["Total Count", folder.TotalCount]);
				table.push(["Folder Type", folder.FolderClass]);

				console.log(table.toString());
				console.log(inbox1.message);
				console.log("------ request complete ------");
			}, (ei: any) => {
				EwsLogging.Log(ei, true, true);
				console.log(ei.stack, ei.stack.split("\n"));
				inbox1.line1 = "error...";
				inbox1.writemsg();
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