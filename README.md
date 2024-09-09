<h1 align="center">image2cpp 🖼️➡️🔢</h1>

<p align="center">
  <a href="https://github.com/sponsors/javl">
    <img src="https://img.shields.io/github/sponsors/javl?label=Sponsor&logo=GitHub&style=for-the-badge" alt="GitHub Sponsors"/>
  </a>
  <a href="https://www.gnu.org/licenses/gpl-3.0">
    <img src="https://img.shields.io/badge/License-GPLv3-blue.svg?style=for-the-badge" alt="License: GPL v3"/>
  </a>
</p>

<p align="center">
  <strong>Convert images to byte arrays (and vice versa) for monochrome displays</strong>
</p>

<p align="center">
  <em>Perfect for OLED displays from Adafruit, Sparkfun, and more!</em>
</p>

---

## 🌟 Features

- 🔄 Convert images to byte arrays and back
- 🖥️ Support for various monochrome displays
- 💻 Pure HTML + JavaScript solution
- 🐍 New Python backend for enhanced functionality
- 🎨 Customizable export settings

## 🚀 Getting Started

### 🌐 Online Version

Experience image2cpp instantly: [Try it online!](http://javl.github.io/image2cpp/)

### 💾 Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/image2cpp.git
   ```
2. Open `index.html` in a modern browser.

### 🐍 Python Backend (New Feature)

To harness the power of the Python backend:

1. Install required packages:
   ```bash
   pip install Flask Pillow numpy
   ```
2. Launch the Flask application:
   ```bash
   python app.py
   ```
3. Navigate to `http://localhost:5000` in your browser.

## 📸 Screenshots

<table>
  <tr>
    <td align="center"><strong>Python App</strong></td>
    <td align="center"><strong>HTML App</strong></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/47d77ecf-8f5f-4adc-b236-4200f211de27" alt="Python App Screenshot" width="100%"/></td>
    <td><img src="https://github.com/user-attachments/assets/a3fd0ad7-9e7e-4740-a903-22fcbea73794" alt="HTML App Screenshot" width="100%"/></td>
  </tr>
</table>

## 🖥️ Example Arduino Code

Kickstart your project with our [simple Arduino example sketch](https://github.com/javl/image2cpp/blob/master/oled_example/oled_example.ino).

## 🎨 Screen Types

While originally crafted for 128x64 pixel monochrome OLED displays, image2cpp plays well with most similar displays. Fine-tune your export settings within the tool to match your specific needs.

## 🤝 Contributing

We welcome contributions! Feel free to submit a Pull Request and join our community of developers.

## 👏 Credits

A big thank you to all our contributors:

<table>
  <tr>
    <td align="center"><a href="https://github.com/javl"><img src="https://github.com/javl.png" width="100px;" alt="javl"/><br /><sub><b>javl</b></sub></a><br />Initial Code</td>
    <td align="center"><a href="https://github.com/akumpf"><img src="https://github.com/akumpf.png" width="100px;" alt="akumpf"/><br /><sub><b>akumpf</b></sub></a></td>
    <td align="center"><a href="https://github.com/Daniyal-Warraich"><img src="https://github.com/Daniyal-Warraich.png" width="100px;" alt="Daniyal Warraich"/><br /><sub><b>Daniyal Warraich</b></sub></a></td>
    <td align="center"><a href="https://github.com/davidalim"><img src="https://github.com/davidalim.png" width="100px;" alt="davidalim"/><br /><sub><b>davidalim</b></sub></a></td>
    <td align="center"><a href="https://github.com/dotcypress"><img src="https://github.com/dotcypress.png" width="100px;" alt="dotcypress"/><br /><sub><b>dotcypress</b></sub></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/harry48225"><img src="https://github.com/harry48225.png" width="100px;" alt="Harry48225"/><br /><sub><b>Harry48225</b></sub></a></td>
    <td align="center"><a href="https://github.com/hurricaneJoef"><img src="https://github.com/hurricaneJoef.png" width="100px;" alt="hurricaneJoef"/><br /><sub><b>hurricaneJoef</b></sub></a></td>
    <td align="center"><a href="https://github.com/jochenderwae"><img src="https://github.com/jochenderwae.png" width="100px;" alt="jochenderwae"/><br /><sub><b>jochenderwae</b></sub></a></td>
    <td align="center"><a href="https://github.com/plewka"><img src="https://github.com/plewka.png" width="100px;" alt="plewka"/><br /><sub><b>plewka</b></sub></a></td>
    <td align="center"><a href="https://github.com/Sebski123"><img src="https://github.com/Sebski123.png" width="100px;" alt="Sebski123"/><br /><sub><b>Sebski123</b></sub></a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/whoisnian"><img src="https://github.com/whoisnian.png" width="100px;" alt="whoisnian"/><br /><sub><b>whoisnian</b></sub></a></td>
    <td align="center"><a href="https://github.com/wiredolphin"><img src="https://github.com/wiredolphin.png" width="100px;" alt="wiredolphin"/><br /><sub><b>wiredolphin</b></sub></a></td>
    <td align="center"><a href="https://github.com/hemangjoshi37a"><img src="https://github.com/hemangjoshi37a.png" width="100px;" alt="hemangjoshi37a"/><br /><sub><b>hemangjoshi37a</b></sub></a></td>
  </tr>
</table>

Special thanks to [Adafruit](https://github.com/adafruit) for the example sketch base and [stellar-L3N-etag](https://github.com/reece15/stellar-L3N-etag) for the dithering code.

## 📄 License

image2cpp is released under GPL v3. Feel free to use, adapt, and distribute the project, but remember to share your changes and link back to this repo. For more details, check out our [LICENSE.md](https://github.com/javl/image2cpp/blob/master/LICENSE.md).

## 💖 Support the Project

If image2cpp has been helpful for you, consider supporting its development:

<p align="center">
  <a href="https://github.com/sponsors/javl">
    <img src="https://img.shields.io/github/sponsors/javl?label=Sponsor&logo=GitHub&style=for-the-badge" alt="Sponsor on GitHub"/>
  </a>
</p>

<p align="center">
  <em>Your support fuels the continued improvement and maintenance of image2cpp!</em>
</p>
