/// <reference path="./typings/ExchangeWebService.d.ts" />
/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/yargs/yargs.d.ts" />
/// <reference path="./typings/gulp/gulp.d.ts" />

import {availability1} from "./scenarios/availability1";
import {nameResolution1} from "./scenarios/nameResolution1";
import {inbox1} from "./scenarios/inbox1";

import {EwsLogging} from "ews-javascript-api";


import yargs = require('yargs');
var argv = yargs.options("a", { type: 'array' }).argv;//.options("run", { type: 'number' }).argv;

declare var require;
var credentials = require("./credentials");

function scn_availability() {

}

if(argv["v"]){	
EwsLogging.DebugLogEnabled = true;
}
else{
EwsLogging.DebugLogEnabled = false;	
}

//console.log(argv);
if (argv["run"]) {
	switch (argv["run"].toLowerCase()) {
		case "availability1":
			availability1.run(credentials, argv);
			break;
		case "nameresolution1":
			nameResolution1.run(credentials, argv);
			break;
		case "inbox1":
			inbox1.run(credentials, argv);
			break;
		default:
			console.log("scenario not found")
			break;
	}
}
else {
	inbox1.run(credentials, argv);
}
