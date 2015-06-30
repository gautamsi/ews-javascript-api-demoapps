var PythonShell = require('python-shell');
var lcdwriter = (function () {
    function lcdwriter() {
    }
    lcdwriter.write = function (msg) {
        var options = {
            scriptPath: process.cwd(),
            args: ["m", msg]
        };
        try {
            PythonShell.run('./Adafruit_CharLCD.py', options, function (err, results) {
                if (err)
                    console.log(err);
                // results is an array consisting of messages collected during execution
                //console.log('results: %j', results);
            });
        }
        catch (err) {
            console.log(err);
        }
    };
    lcdwriter.clear = function () {
        var options = {
            scriptPath: process.cwd(),
            args: ["c",]
        };
        try {
            PythonShell.run('./Adafruit_CharLCD.py', options, function (err, results) {
                if (err)
                    console.log(err);
                // results is an array consisting of messages collected during execution
                //console.log('results: %j', results);
            });
        }
        catch (err) {
            console.log(err);
        }
    };
    return lcdwriter;
})();
exports.lcdwriter = lcdwriter;
