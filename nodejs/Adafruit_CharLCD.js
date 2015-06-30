var sleep = require("sleep");
var Adafruit_CharLCD = (function () {
    function Adafruit_CharLCD(GPIO, pin_rs, pin_e, pins_db) {
        if (GPIO === void 0) { GPIO = null; }
        if (pin_rs === void 0) { pin_rs = 25; }
        if (pin_e === void 0) { pin_e = 24; }
        if (pins_db === void 0) { pins_db = [23, 17, 21, 22]; }
        this.GPIO = GPIO;
        this.pin_rs = pin_rs;
        this.pin_e = pin_e;
        this.pins_db = pins_db;
        //# commands
        this.LCD_CLEARDISPLAY = 0x01;
        this.LCD_RETURNHOME = 0x02;
        this.LCD_ENTRYMODESET = 0x04;
        this.LCD_DISPLAYCONTROL = 0x08;
        this.LCD_CURSORSHIFT = 0x10;
        this.LCD_FUNCTIONSET = 0x20;
        this.LCD_SETCGRAMADDR = 0x40;
        this.LCD_SETDDRAMADDR = 0x80;
        //# flags for display entry mode
        this.LCD_ENTRYRIGHT = 0x00;
        this.LCD_ENTRYLEFT = 0x02;
        this.LCD_ENTRYSHIFTINCREMENT = 0x01;
        this.LCD_ENTRYSHIFTDECREMENT = 0x00;
        //# flags for display on/off control
        this.LCD_DISPLAYON = 0x04;
        this.LCD_DISPLAYOFF = 0x00;
        this.LCD_CURSORON = 0x02;
        this.LCD_CURSOROFF = 0x00;
        this.LCD_BLINKON = 0x01;
        this.LCD_BLINKOFF = 0x00;
        //# flags for display/cursor shift
        //LCD_DISPLAYMOVE         = 0x08
        //LCD_CURSORMOVE          = 0x00
        //# flags for display/cursor shift
        this.LCD_DISPLAYMOVE = 0x08;
        this.LCD_CURSORMOVE = 0x00;
        this.LCD_MOVERIGHT = 0x04;
        this.LCD_MOVELEFT = 0x00;
        //# flags for function set
        this.LCD_8BITMODE = 0x10;
        this.LCD_4BITMODE = 0x00;
        this.LCD_2LINE = 0x08;
        this.LCD_1LINE = 0x00;
        this.LCD_5x10DOTS = 0x04;
        this.LCD_5x8DOTS = 0x00;
        //# Emulate the old behavior of using RPi.GPIO if we haven't been given
        //# an explicit GPIO interface to use
        if (GPIO === null) {
            throw new Error("cannot work without gpio);");
        }
        this.GPIO.setMode(GPIO.MODE_BCM);
        this.GPIO.setup(this.pin_e, GPIO.DIR_OUT, function (msg, extra) { console.log("Error in setup: " + msg + extra); });
        this.GPIO.setup(this.pin_rs, GPIO.DIR_OUT, function (msg, extra) { console.log("Error in setup: " + msg + extra); });
        for (var _i = 0, _a = this.pins_db; _i < _a.length; _i++) {
            var pin = _a[_i];
            this.GPIO.setup(pin, GPIO.DIR_OUT, function (msg, extra) { console.log("Error in setup: " + msg + extra); });
        }
        this.write4bits(0x33); //# initialization
        this.write4bits(0x32); //# initialization
        this.write4bits(0x28); //# 2 line 5x7 matrix
        this.write4bits(0x0C); //# turn cursor off 0x0E to enable cursor
        this.write4bits(0x06); //# shift cursor right
        this.displaycontrol = this.LCD_DISPLAYON | this.LCD_CURSOROFF | this.LCD_BLINKOFF;
        this.displayfunction = this.LCD_4BITMODE | this.LCD_1LINE | this.LCD_5x8DOTS;
        this.displayfunction |= this.LCD_2LINE;
        //# Initialize to default text direction (for romance languages)
        this.displaymode = this.LCD_ENTRYLEFT | this.LCD_ENTRYSHIFTDECREMENT;
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode); //# set the entry mode
        this.clear();
    }
    Adafruit_CharLCD.prototype.begin = function (cols, lines) {
        if (lines > 1) {
            this.numlines = lines;
            this.displayfunction |= this.LCD_2LINE;
        }
    };
    Adafruit_CharLCD.prototype.home = function () {
        this.write4bits(this.LCD_RETURNHOME); //# set cursor position to zero
        this.delayMicroseconds(3000); //# this command takes a long time!
    };
    Adafruit_CharLCD.prototype.clear = function () {
        this.write4bits(this.LCD_CLEARDISPLAY); //# command to clear display
        this.delayMicroseconds(3000); //# 3000 microsecond sleep, clearing the display takes a long time
    };
    Adafruit_CharLCD.prototype.setCursor = function (col, row) {
        this.row_offsets = [0x00, 0x40, 0x14, 0x54];
        if (row > this.numlines) {
            row = this.numlines - 1; //# we count rows starting w/0
        }
        this.write4bits(this.LCD_SETDDRAMADDR | (col + this.row_offsets[row]));
    };
    Adafruit_CharLCD.prototype.noDisplay = function () {
        /** """ Turn the display off (quickly) """*/
        this.displaycontrol &= ~this.LCD_DISPLAYON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.display = function () {
        /**""" Turn the display on (quickly) """*/
        this.displaycontrol |= this.LCD_DISPLAYON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.noCursor = function () {
        /**""" Turns the underline cursor off """*/
        this.displaycontrol &= ~this.LCD_CURSORON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.cursor = function () {
        /**""" Turns the underline cursor on """*/
        this.displaycontrol |= this.LCD_CURSORON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.noBlink = function () {
        /**""" Turn the blinking cursor off """*/
        this.displaycontrol &= ~this.LCD_BLINKON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.blink = function () {
        /**""" Turn the blinking cursor on """*/
        this.displaycontrol |= this.LCD_BLINKON;
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol);
    };
    Adafruit_CharLCD.prototype.DisplayLeft = function () {
        /**""" These commands scroll the display without changing the RAM """*/
        this.write4bits(this.LCD_CURSORSHIFT | this.LCD_DISPLAYMOVE | this.LCD_MOVELEFT);
    };
    Adafruit_CharLCD.prototype.scrollDisplayRight = function () {
        /**""" These commands scroll the display without changing the RAM """*/
        this.write4bits(this.LCD_CURSORSHIFT | this.LCD_DISPLAYMOVE | this.LCD_MOVERIGHT);
    };
    Adafruit_CharLCD.prototype.leftToRight = function () {
        /**""" This is for text that flows Left to Right """*/
        this.displaymode |= this.LCD_ENTRYLEFT;
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode);
    };
    Adafruit_CharLCD.prototype.rightToLeft = function () {
        /**""" This is for text that flows Right to Left """*/
        this.displaymode &= ~this.LCD_ENTRYLEFT;
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode);
    };
    Adafruit_CharLCD.prototype.autoscroll = function () {
        /**""" This will 'right justify' text from the cursor """*/
        this.displaymode |= this.LCD_ENTRYSHIFTINCREMENT;
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode);
    };
    Adafruit_CharLCD.prototype.noAutoscroll = function () {
        /**""" This will 'left justify' text from the cursor """*/
        this.displaymode &= ~this.LCD_ENTRYSHIFTINCREMENT;
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode);
    };
    Adafruit_CharLCD.prototype.write4bits = function (bits, char_mode) {
        if (char_mode === void 0) { char_mode = false; }
        /**""" Send command to LCD """*/
        this.delayMicroseconds(1000); //# 1000 microsecond sleep
        var bitsBinary = zfill(bits.toString(2), 8); // [2:]. zfill(8)
        this.GPIO.output(this.pin_rs, char_mode, function (msg) { console.log("Error in output: " + msg); });
        for (var _i = 0, _a = this.pins_db; _i < _a.length; _i++) {
            var pin = _a[_i];
            this.GPIO.output(pin, false, function (msg) { console.log("Error in output: " + msg); });
        }
        for (var _b = 0, _c = range(4); _b < _c.length; _b++) {
            var i = _c[_b];
            if (bitsBinary[i] == "1")
                this.GPIO.output(this.pins_db.reverse()[i], true, function (msg) { console.log("Error in output: " + msg); });
        }
        this.pulseEnable();
        for (var _d = 0, _e = this.pins_db; _d < _e.length; _d++) {
            var pin = _e[_d];
            this.GPIO.output(pin, false, function (msg) { console.log("Error in output: " + msg); });
        }
        for (var _f = 0, _g = range(4, 8); _f < _g.length; _f++) {
            var i = _g[_f];
            if (bitsBinary[i] == "1") {
                this.GPIO.output(this.pins_db.reverse()[i - 4], true, function (msg) { console.log("Error in output: " + msg); });
            }
        }
        this.pulseEnable();
    };
    Adafruit_CharLCD.prototype.delayMicroseconds = function (microseconds) {
        //var seconds = microseconds / 1000000;  //# divide microseconds by 1 million for seconds
        sleep.usleep(microseconds);
    };
    Adafruit_CharLCD.prototype.pulseEnable = function () {
        this.GPIO.output(this.pin_e, false, function (msg) { console.log("Error in output: " + msg); });
        this.delayMicroseconds(1); //# 1 microsecond pause - enable pulse must be > 450ns
        this.GPIO.output(this.pin_e, true, function (msg) { console.log("Error in output: " + msg); });
        this.delayMicroseconds(1); //# 1 microsecond pause - enable pulse must be > 450ns
        this.GPIO.output(this.pin_e, false, function (msg) { console.log("Error in output: " + msg); });
        this.delayMicroseconds(1); //# commands need > 37us to settle
    };
    Adafruit_CharLCD.prototype.message = function (text) {
        // /**""" Send string to LCD. Newline wraps to second line"""*/
        for (var _i = 0; _i < text.length; _i++) {
            var chr = text[_i];
            if (chr == '\n')
                this.write4bits(0xC0); //# next line
            else
                this.write4bits(chr.charCodeAt(0), true);
        }
    };
    return Adafruit_CharLCD;
})();
exports.Adafruit_CharLCD = Adafruit_CharLCD;
function range(start, stop) {
    if (stop === void 0) { stop = NaN; }
    var end = start;
    if (stop !== NaN) {
        end = stop;
    }
    else {
        start = 0;
    }
    var result = [];
    for (var i = start; i < stop; i++) {
        result.push(i);
    }
    return result;
}
function zfill(str, num) {
    if (str.length >= num)
        return str;
    var prefix = new Array(num - str.length + 1).join("0");
    return prefix + str;
}
