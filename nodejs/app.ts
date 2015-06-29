/// <reference path="./typings/ExchangeWebService.d.ts" />
/// <reference path="./typings/node/node.d.ts" />
/// <reference path="./typings/yargs/yargs.d.ts" />
/// <reference path="./typings/gulp/gulp.d.ts" />

import {availability1} from "./scenarios/availability1";
import {nameResolution1} from "./scenarios/nameResolution1";

import yargs = require('yargs');
var argv = yargs.options("a", { type: 'array' }).argv;//.options("run", { type: 'number' }).argv;

declare var require;
var credentials = require("./credentials");

function scn_availability() {

}
console.log(argv);
if (argv["run"]) {
	switch (argv["run"].toLowerCase()) {
		case "availability1":
			availability1.run(credentials, argv);
			break;
		case "nameresolution1":
			nameResolution1.run(credentials, argv);
		default:
		console.log("scenario not found")
			break;
	}
}
else {
	nameResolution1.run(credentials, argv);
}
