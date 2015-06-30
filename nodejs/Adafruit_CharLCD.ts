
import sleep = require("sleep");


class Adafruit_CharLCD {
    


    //# commands
    LCD_CLEARDISPLAY = 0x01
    LCD_RETURNHOME = 0x02
    LCD_ENTRYMODESET = 0x04
    LCD_DISPLAYCONTROL = 0x08
    LCD_CURSORSHIFT = 0x10
    LCD_FUNCTIONSET = 0x20
    LCD_SETCGRAMADDR = 0x40
    LCD_SETDDRAMADDR = 0x80

    //# flags for display entry mode
    LCD_ENTRYRIGHT = 0x00
    LCD_ENTRYLEFT = 0x02
    LCD_ENTRYSHIFTINCREMENT = 0x01
    LCD_ENTRYSHIFTDECREMENT = 0x00

    //# flags for display on/off control
    LCD_DISPLAYON = 0x04
    LCD_DISPLAYOFF = 0x00
    LCD_CURSORON = 0x02
    LCD_CURSOROFF = 0x00
    LCD_BLINKON = 0x01
    LCD_BLINKOFF = 0x00

    //# flags for display/cursor shift
    //LCD_DISPLAYMOVE         = 0x08
    //LCD_CURSORMOVE          = 0x00

    //# flags for display/cursor shift
    LCD_DISPLAYMOVE = 0x08
    LCD_CURSORMOVE = 0x00
    LCD_MOVERIGHT = 0x04
    LCD_MOVELEFT = 0x00

    //# flags for function set
    LCD_8BITMODE = 0x10
    LCD_4BITMODE = 0x00
    LCD_2LINE = 0x08
    LCD_1LINE = 0x00
    LCD_5x10DOTS = 0x04
    LCD_5x8DOTS = 0x00

    displaycontrol: number;
    displayfunction: number;
    displaymode: number;
    numlines: number;
    row_offsets: number[];

    constructor(public pin_rs = 25, public pin_e = 24, public pins_db = [23, 17, 21, 22], public GPIO = null) {
        //# Emulate the old behavior of using RPi.GPIO if we haven't been given
        //# an explicit GPIO interface to use
        if (GPIO === null) {
            throw new Error("cannot work without gpio);");
            // import RPi.GPIO as GPIO
            // GPIO.setwarnings(false)
        }


        this.GPIO.setmode(GPIO.BCM)
        this.GPIO.setup(this.pin_e, GPIO.OUT)
        this.GPIO.setup(this.pin_rs, GPIO.OUT)

        for (var pin of this.pins_db) {
            this.GPIO.setup(pin, GPIO.OUT)
        }
        this.write4bits(0x33)  //# initialization
        this.write4bits(0x32)  //# initialization
        this.write4bits(0x28)  //# 2 line 5x7 matrix
        this.write4bits(0x0C)  //# turn cursor off 0x0E to enable cursor
        this.write4bits(0x06)  //# shift cursor right

        this.displaycontrol = this.LCD_DISPLAYON | this.LCD_CURSOROFF | this.LCD_BLINKOFF

        this.displayfunction = this.LCD_4BITMODE | this.LCD_1LINE | this.LCD_5x8DOTS
        this.displayfunction |= this.LCD_2LINE

        //# Initialize to default text direction (for romance languages)
        this.displaymode = this.LCD_ENTRYLEFT | this.LCD_ENTRYSHIFTDECREMENT
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode)  //# set the entry mode

        this.clear()
    }
    begin(cols, lines) {
        if (lines > 1) {
            this.numlines = lines
            this.displayfunction |= this.LCD_2LINE
        }
    }
    home() {
        this.write4bits(this.LCD_RETURNHOME)  //# set cursor position to zero
        this.delayMicroseconds(3000)  //# this command takes a long time!
    }
    clear() {
        this.write4bits(this.LCD_CLEARDISPLAY)  //# command to clear display
        this.delayMicroseconds(3000)  //# 3000 microsecond sleep, clearing the display takes a long time
    }
    setCursor(col, row) {
        this.row_offsets = [0x00, 0x40, 0x14, 0x54]
        if (row > this.numlines) {
            row = this.numlines - 1  //# we count rows starting w/0
        }
        this.write4bits(this.LCD_SETDDRAMADDR | (col + this.row_offsets[row]))
    }
    noDisplay() {
        /** """ Turn the display off (quickly) """*/
        this.displaycontrol &= ~this.LCD_DISPLAYON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    display() {
        /**""" Turn the display on (quickly) """*/
        this.displaycontrol |= this.LCD_DISPLAYON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    noCursor() {
        /**""" Turns the underline cursor off """*/
        this.displaycontrol &= ~this.LCD_CURSORON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    cursor() {
        /**""" Turns the underline cursor on """*/
        this.displaycontrol |= this.LCD_CURSORON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    noBlink() {
        /**""" Turn the blinking cursor off """*/
        this.displaycontrol &= ~this.LCD_BLINKON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    blink() {
        /**""" Turn the blinking cursor on """*/
        this.displaycontrol |= this.LCD_BLINKON
        this.write4bits(this.LCD_DISPLAYCONTROL | this.displaycontrol)
    }
    DisplayLeft() {
        /**""" These commands scroll the display without changing the RAM """*/
        this.write4bits(this.LCD_CURSORSHIFT | this.LCD_DISPLAYMOVE | this.LCD_MOVELEFT)
    }
    scrollDisplayRight() {
        /**""" These commands scroll the display without changing the RAM """*/
        this.write4bits(this.LCD_CURSORSHIFT | this.LCD_DISPLAYMOVE | this.LCD_MOVERIGHT)
    }
    leftToRight() {
        /**""" This is for text that flows Left to Right """*/
        this.displaymode |= this.LCD_ENTRYLEFT
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode)
    }
    rightToLeft() {
        /**""" This is for text that flows Right to Left """*/
        this.displaymode &= ~this.LCD_ENTRYLEFT
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode)
    }
    autoscroll() {
        /**""" This will 'right justify' text from the cursor """*/
        this.displaymode |= this.LCD_ENTRYSHIFTINCREMENT
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode)
    }
    noAutoscroll() {
        /**""" This will 'left justify' text from the cursor """*/
        this.displaymode &= ~this.LCD_ENTRYSHIFTINCREMENT
        this.write4bits(this.LCD_ENTRYMODESET | this.displaymode)
    }
    write4bits(bits: number, char_mode = false) {
        /**""" Send command to LCD """*/
        this.delayMicroseconds(1000)  //# 1000 microsecond sleep
        var bitsBinary = zfill(bits.toString(2),8);// [2:]. zfill(8)
        this.GPIO.output(this.pin_rs, char_mode)
        for (var pin of this.pins_db) {
            this.GPIO.output(pin, false)
        }
        for (var i of range(4)) {
            if (bitsBinary[i] == "1")
                this.GPIO.output(this.pins_db.reverse()[i], true);
        }
        this.pulseEnable()
        for (var pin of this.pins_db) {
            this.GPIO.output(pin, false);
        }
        for (var i of range(4, 8)) {
            if (bitsBinary[i] == "1") {
                this.GPIO.output(this.pins_db.reverse()[i - 4], true);
            }
        }
        this.pulseEnable()
    }
    delayMicroseconds(microseconds) {
        var seconds = microseconds / 1000000;  //# divide microseconds by 1 million for seconds
        sleep.sleep(seconds);
    }
    pulseEnable() {
        this.GPIO.output(this.pin_e, false);
        this.delayMicroseconds(1);      //# 1 microsecond pause - enable pulse must be > 450ns
        this.GPIO.output(this.pin_e, true);
        this.delayMicroseconds(1);      //# 1 microsecond pause - enable pulse must be > 450ns
        this.GPIO.output(this.pin_e, false);
        this.delayMicroseconds(1);     //# commands need > 37us to settle
    }
    message(text: string) {
        // /**""" Send string to LCD. Newline wraps to second line"""*/
        for (var chr of text) {
            if (chr == '\n')
                this.write4bits(0xC0);  //# next line
            else
                this.write4bits(chr.charCodeAt(0), true);
        }
    }

}

function range(end: number): number[];
function range(start: number, end: number): number[];
function range(start: number, stop: number = NaN): number[] {
    var end = start;
    if (stop !== NaN) {
        end = stop;
    }
    else {
        start = 0;
    }
    var result: number[] = [];
    for (var i = start; i < stop; i++) {
        result.push(i);
    }
    return result;
}

function zfill(str: string, num: number): string {
    if (str.length >= num) return str;

    var prefix = new Array(num - str.length + 1).join("0");
    return prefix + str;
}