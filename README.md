# No AI Google Search 🚫🤖

A Chrome extension that removes Google's AI Overview and filters AI-related content from search results, giving you cleaner, more traditional search results.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?logo=googlechrome)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![Version](https://img.shields.io/badge/Version-1.0-orange)

## 🌟 Features

- **Automatic AI Overview Removal**: Instantly hides Google's AI Overview panels
- **Smart Content Filtering**: Automatically adds `-ai` parameter to filter AI-related results
- **Intelligent Detection**: Distinguishes between AI-related searches and general queries
- **Quick Toggle**: Enable/disable with keyboard shortcut (Ctrl+Shift+A / Cmd+Shift+A)
- **Customizable Settings**: Configure detection modes and notification preferences
- **Statistics Tracking**: Monitor blocked content and searches
- **Multi-Language Support**: Works across Google domains (google.com, google.co.uk, google.de, etc.)

## 📸 Screenshots

### Before (with AI Overview)
![Description](screenshots/before-extension-installed.png)

### After (clean search results)
![Description](screenshots/after-extension-installed.png)

## 🚀 Installation

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your Chrome toolbar

## 🛠️ How It Works

The extension uses multiple strategies to clean your search results:

1. **AI Overview Blocking**: Automatically detects and hides Google's AI Overview sections
2. **Query Modification**: Adds `-ai` parameter to search queries to filter AI-related results
3. **Content Detection**: Uses keyword matching to identify and handle AI-related searches appropriately
4. **Domain Filtering**: Recognizes common AI service domains and handles them accordingly

## ⚙️ Configuration

### Basic Settings
- **Enable/Disable Extension**: Toggle the entire extension on/off
- **Detection Mode**: Choose between standard and enhanced AI detection
- **Notifications**: Control whether to show toggle notifications

### Advanced Options
Access the options page by:
1. Right-clicking the extension icon
2. Selecting "Options"
3. Or navigating to `chrome://extensions/` and clicking "Details" → "Extension options"

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+A` (Windows/Linux) | Toggle extension on/off |
| `Cmd+Shift+A` (Mac) | Toggle extension on/off |

## 📊 Statistics

The extension tracks:
- Number of AI overviews blocked today
- Total searches performed today
- Historical blocking data

View your statistics in the extension popup.

## 🌍 Supported Google Domains

- google.com (Global)
- google.co.uk (United Kingdom)
- google.ca (Canada)
- google.de (Germany)
- google.fr (France)
- google.it (Italy)
- google.es (Spain)
- google.com.au (Australia)
- google.co.in (India)
- google.com.br (Brazil)
- google.co.jp (Japan)

## 🔧 Technical Details

### Manifest V3 Compliance
This extension is built using Manifest V3, ensuring compatibility with the latest Chrome extension standards.

### Permissions Used
- `scripting`: To inject content scripts and modify search pages
- `tabs`: To detect and reload Google search tabs
- `storage`: To save user preferences and statistics
- `notifications`: To show toggle status notifications

### Files Structure
```
├── manifest.json          # Extension configuration
├── background.js           # Service worker for background tasks
├── content.js             # Main content script for search page modification
├── popup.html/js          # Extension popup interface
├── options.html/js        # Options page for settings
├── styles.css             # Custom styles for hiding AI content
└── icons/                 # Extension icons (16, 32, 48, 128px)
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Setup
1. Clone the repository
2. Make your changes
3. Load the unpacked extension in Chrome for testing
4. Test thoroughly on different Google domains and search types

## 🐛 Bug Reports

Found a bug? Please create an issue with:
- Chrome version
- Extension version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)



## 🙏 Acknowledgments

- Thanks to all users who provide feedback and suggestions
- Inspired by the need for cleaner, more traditional search experiences
- Built with modern web extension standards




**Made with ❤️ for better search experiences**

*If you find this extension helpful, please consider giving it a ⭐ on GitHub!*
