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
var nameResolution1 = (function () {
    function nameResolution1() {
    }
    nameResolution1.run = function (credentials, argv) {
        var exch = new ews_javascript_api_1.ExchangeService(ews_javascript_api_1.ExchangeVersion.Exchange2013);
        exch.Credentials = new ews_javascript_api_1.ExchangeCredentials(credentials.userName, credentials.password);
        exch.Url = new ews_javascript_api_1.Uri("https://outlook.office365.com/Ews/Exchange.asmx");
        var searchstring = "gstest";
        if (argv && argv["s"]) {
            searchstring = argv["s"];
        }
        exch.ResolveName(searchstring, ews_javascript_api_1.ResolveNameSearchLocation.DirectoryOnly, true, ews_javascript_api_1.PropertySet.FirstClassProperties)
            .then(function (response) {
            var heads = ["Type".cyan, "DisplayName".cyan, "Alias".cyan, "First Name".cyan, "Last Name".cyan];
            //attendees.forEach((entry) => { heads.push(entry.SmtpAddress.blue) });
            var table = new Table({
                head: heads
            });
            for (var _i = 0, _a = response.Items; _i < _a.length; _i++) {
                var nameResolution = _a[_i];
                var row = [];
                row.push(ews_javascript_api_1.MailboxType[nameResolution.Mailbox.MailboxType].green);
                row.push(nameResolution.Contact.DisplayName || "n/a");
                row.push(nameResolution.Contact.Alias || "n/a");
                row.push(nameResolution.Contact.GivenName || "n/a");
                row.push(nameResolution.Contact.Surname || "n/a");
                table.push(row);
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
    return nameResolution1;
})();
exports.nameResolution1 = nameResolution1;
