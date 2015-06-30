var pythonmsg_1 = require("../pythonmsg");
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
var inbox1 = (function () {
    function inbox1() {
    }
    Object.defineProperty(inbox1, "line2", {
        get: function () { return "lst " + ews_javascript_api_1.DateTime.Now.Format("HH:mm:ss") + " " + inbox1.lastTotalCount; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(inbox1, "message", {
        get: function () { return inbox1.line1 + "\n" + inbox1.line2; },
        enumerable: true,
        configurable: true
    });
    inbox1.writemsg = function () { pythonmsg_1.lcdwriter.write(inbox1.message); };
    inbox1.run = function (credentials, argv) {
        var exch = new ews_javascript_api_1.ExchangeService(ews_javascript_api_1.ExchangeVersion.Exchange2013);
        exch.Credentials = new ews_javascript_api_1.ExchangeCredentials(credentials.userName, credentials.password);
        exch.Url = new ews_javascript_api_1.Uri("https://outlook.office365.com/Ews/Exchange.asmx");
        if (argv && argv["endless"]) {
            setTimeout(function () {
                inbox1.run(credentials, argv);
            }, 5000);
        }
        inbox1.line1 = "checking...";
        inbox1.writemsg();
        exch.BindToFolder(new ews_javascript_api_1.FolderId(ews_javascript_api_1.WellKnownFolderName.Inbox), ews_javascript_api_1.PropertySet.FirstClassProperties)
            .then(function (folder) {
            var heads = ["property".cyan, "value".cyan];
            var table = new Table({
                head: heads
            });
            inbox1.line1 = inbox1.lastTotalCount >= folder.TotalCount ? "no new mail" : "new mail:" + (folder.TotalCount - inbox1.lastTotalCount);
            inbox1.lastTotalCount = folder.TotalCount;
            table.push(["Display Name", folder.DisplayName]);
            table.push(["Unread Count", folder.UnreadCount]);
            table.push(["Total Count", folder.TotalCount]);
            table.push(["Folder Type", folder.FolderClass]);
            console.log(table.toString());
            console.log(inbox1.message);
            console.log("------ request complete ------");
        }, function (ei) {
            ews_javascript_api_1.EwsLogging.Log(ei, true, true);
            console.log(ei.stack, ei.stack.split("\n"));
            inbox1.line1 = "error...";
            inbox1.writemsg();
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
    inbox1.lastTotalCount = 0;
    inbox1.line1 = "checking...";
    return inbox1;
})();
exports.inbox1 = inbox1;
