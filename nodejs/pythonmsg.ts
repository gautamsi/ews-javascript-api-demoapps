import PythonShell = require('python-shell');



export class lcdwriter {
	static write(msg: string): void {
		var options = {
			scriptPath: process.cwd(),
			args: ["m", msg]
		};
		try {
			PythonShell.run('./Adafruit_CharLCD.py', options, function(err, results) {
				if (err)
					console.log(err);
				// results is an array consisting of messages collected during execution
				//console.log('results: %j', results);
			});
		}
		catch (err) {
			console.log(err);

		}
	}
	static clear(): void {
		var options = {
			scriptPath: process.cwd(),
			args: ["c", ]
		};
		try {
			PythonShell.run('./Adafruit_CharLCD.py', options, function(err, results) {
				if (err)
					console.log(err);				
				// results is an array consisting of messages collected during execution
				//console.log('results: %j', results);
			});
		}
		catch (err) {
			console.log(err);

		}
	}
}
