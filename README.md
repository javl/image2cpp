## image2cpp

An online version of this tool is live at [http://javl.github.io/image2cpp/](http://javl.github.io/image2cpp/)


image2cpp is a simple tool to change images into byte arrays (or your array back into an image) for use with (monochrome) displays suchs as OLEDs, like those from Adafruit or Sparkfun. While searching for a way to generate these arrays, I mostly found links to a piece of Windows software. Both the flakey results and the hassle of having to boot a virtual machine just to convert an image lead to me writing this pure html + javascript solution.

Alternatively you can also enter a byte array as input to turn it back into an image. This might be useful for debugging, or when you want to write the byte array yourself. I don't know.

Did you find this tool useful? Feel free to support my open source software:

[![GitHub Sponsor](https://img.shields.io/github/sponsors/javl?label=Sponsor&logo=GitHub)](https://github.com/sponsors/javl)

[![BMC](https://www.buymeacoffee.com/assets/img/custom_images/white_img.png)](https://www.buymeacoffee.com/javl)


### Running the tool
You don't need any special dependencies / internet connection; all the necessary parts sit in a single .html file. So just open this index.html page in a (recent) browser to run the tool.
Or you can use the online version at http://javl.github.io/image2cpp/

### Example Arduino code
You can find a simple Arduino example sketch [over here](https://github.com/javl/image2cpp/blob/master/oled_example/oled_example.ino) in the repository.

### Screen types
I wrote the code with my 128x64 pixel monochrome OLED display in mind, but it should work with most similar displays. You might need to change some export settings; those are explained in the tool.

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
