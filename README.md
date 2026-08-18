## image2cpp

An online version of this tool is live at [http://javl.github.io/image2cpp/](http://javl.github.io/image2cpp/)

image2cpp is a simple tool to convert images into byte arrays (and vice versa) for use with small (monochrome) displays such as OLEDs on your Arduino or ESP. Alternatively you can also enter a byte array as input to turn it back into an image. This can be useful for debugging to when you want to recover an image from your source code.

Since this is a pure HTML + Javascript tool it works in any browser on Windows, MacOS and Linux. Use the link above for an online version that's ready to go, or download the code and simply open `index.html` in your browser. All processing is done in your browser, so nothing is uploaded, read or stored on remote servers.

### Features
* Import multiple images at once, all processed locally in your browser (again: nothing is uploaded).
* Draw modes: 1 bit per pixel (horizontal or vertical), 1 bit alpha map, 2 bytes per pixel (565), and 3 bytes per pixel (rgb888).
* Dithering: binary threshold, Bayer, Floyd-Steinberg, or Atkinson.
* Scaling, centering, inverting, rotating (0/90/180/270°) and flipping.
* Output formats: plain bytes, Arduino code (per image or a single combined bitmap), or an Adafruit `GFXbitmapFont`.
* Extra formatting options: comments, bit-swapping, custom byte prefix/separator, bytes-per-row wrapping, and an ascii-art preview in the output.
* Read an existing byte array back into an image, for debugging or checking your own hand-written arrays.
* Click any preview image to open it at actual size in a new tab.
* Light and dark mode.

Did you find this tool useful? Feel free to support my open source software (especially when used commercially):

[![GitHub Sponsor](https://img.shields.io/badge/_-sponsor_on_Github-blue?logo=github)](https://github.com/sponsors/javl) [![BMC](https://img.shields.io/badge/Buy_Me_a_Coffee-orange?logo=buymeacoffee)](https://www.buymeacoffee.com/javl)


### Running the tool
You can download and view the `index.html` file locally, or visit the online version at http://javl.github.io/image2cpp/

### Example Arduino code
You can find a simple Arduino example sketch [over here](https://github.com/javl/image2cpp/blob/master/oled_example/oled_example.ino) in the repository.

### Screen types
I wrote the code with my 128x64 pixel monochrome OLED display in mind, but it should work with most similar displays. You might need to change some export settings; those are explained in the tool.
### Running tests
A simple test suite lives in the `tests` directory. See [`tests/`](tests/README.md) for instructions.

### Credit
Initial code by [javl](https://github.com/javl) with aditional code by (in alphabetical order):
* [akumpf](https://github.com/akumpf)
* [Daniyal Warraich](https://github.com/daniyalw)
* [davidalim](https://github.com/davidalim)
* [dotcypress](https://github.com/dotcypress)
* [Harry48225](https://github.com/harry48225)
* [hurricaneJoef](https://github.com/hurricaneJoef)
* [jochenderwae](https://github.com/jochenderwae)
* [plewka](https://github.com/plewka)
* [Sebski123](https://github.com/Sebski123)
* [slimer37](https://github.com/slimer37)
* [whoisnian](https://github.com/whoisnian)
* [wiredolphin](https://github.com/wiredolphin).

The example sketch is based on code by [Adafruit](https://github.com/adafruit). Dithering code from [stellar-L3N-etag](https://github.com/reece15/stellar-L3N-etag).

### License
image2cpp is released under GPL v3. This means you can use the project in any way you want (use, adapt, distribute, etc.) as long as you share any changes and link back to this repo. See [LICENSE.md](https://github.com/javl/image2cpp/blob/master/LICENSE.md) for more info.

Please do consider a donation when used commercially. Thank you.

