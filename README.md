# image2cpp 🖼️➡️🔢

[![GitHub Sponsors](https://img.shields.io/github/sponsors/javl?label=Sponsor&logo=GitHub&style=for-the-badge)](https://github.com/sponsors/javl)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge)](https://www.gnu.org/licenses/gpl-3.0)

image2cpp is a versatile tool for converting images to byte arrays (and vice versa) for use with monochrome displays like OLEDs from Adafruit or Sparkfun.

## 🌟 Features

- Convert images to byte arrays
- Convert byte arrays back to images
- Support for various monochrome displays
- Pure HTML + JavaScript solution
- New Python backend for enhanced functionality

## 🚀 Getting Started

### Online Version

Try the tool online at [http://javl.github.io/image2cpp/](http://javl.github.io/image2cpp/)

### Local Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/image2cpp.git
   ```
2. Open `index.html` in a modern browser.

### Python Backend (New Feature)

To use the Python backend:

1. Install required packages:
   ```
   pip install Flask Pillow numpy
   ```
2. Run the Flask application:
   ```
   python app.py
   ```
3. Open `http://localhost:5000` in your browser.

## 🖥️ Example Arduino Code

Find a simple Arduino example sketch [here](https://github.com/javl/image2cpp/blob/master/oled_example/oled_example.ino).

## 🎨 Screen Types

Originally designed for 128x64 pixel monochrome OLED displays, but compatible with most similar displays. Adjust export settings as needed within the tool.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 👏 Credits

Initial code by [javl](https://github.com/javl) with additional contributions from:

- [akumpf](https://github.com/akumpf)
- [Daniyal Warraich](https://github.com/Daniyal-Warraich)
- [davidalim](https://github.com/davidalim)
- [dotcypress](https://github.com/dotcypress)
- [Harry48225](https://github.com/harry48225)
- [hurricaneJoef](https://github.com/hurricaneJoef)
- [jochenderwae](https://github.com/jochenderwae)
- [plewka](https://github.com/plewka)
- [Sebski123](https://github.com/Sebski123)
- [whoisnian](https://github.com/whoisnian)
- [wiredolphin](https://github.com/wiredolphin)
- [hemangjoshi37a](https://github.com/hemangjoshi37a)

  
Example sketch based on code by [Adafruit](https://github.com/adafruit).
Dithering code from [stellar-L3N-etag](https://github.com/reece15/stellar-L3N-etag).

## 📄 License

image2cpp is released under GPL v3. You can use, adapt, and distribute the project as long as you share any changes and link back to this repo. See [LICENSE.md](https://github.com/javl/image2cpp/blob/master/LICENSE.md) for more info.

## 💖 Support

If you find this tool useful, consider supporting the development:

[![GitHub Sponsor](https://img.shields.io/github/sponsors/javl?label=Sponsor&logo=GitHub&style=for-the-badge)](https://github.com/sponsors/javl)

Your support helps maintain and improve image2cpp!
