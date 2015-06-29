/// <reference path="./typings/ExchangeWebService.d.ts" />
/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/yargs/yargs.d.ts" />
/// <reference path="./typings/gulp/gulp.d.ts" />
var availability1_1 = require("./scenarios/availability1");
var nameResolution1_1 = require("./scenarios/nameResolution1");
var yargs = require('yargs');
var argv = yargs.options("a", { type: 'array' }).argv; //.options("run", { type: 'number' }).argv;
var credentials = require("./credentials");
function scn_availability() {
}
console.log(argv);
if (argv["run"]) {
    switch (argv["run"].toLowerCase()) {
        case "availability1":
            availability1_1.availability1.run(credentials, argv);
            break;
        case "nameresolution1":
            nameResolution1_1.nameResolution1.run(credentials, argv);
        default:
            console.log("scenario not found");
            break;
    }
}
else {
    nameResolution1_1.nameResolution1.run(credentials, argv);
}
