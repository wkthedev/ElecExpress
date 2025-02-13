# ElecExpress

ElecExpress is a lightweight **Electron + Express** application that serves a website from a configurable local folder. If no files exist, it provides a built-in animated landing page with instructions.

## 🚀 Features
- **Electron + Express Integration** - Serves static files seamlessly.
- **Configurable Serve Folder** - Set your own serve folder and resolution via `expressConfig.json`.
- **Built-in Default Page** - Displays an animated landing page if no files exist.
- **Hot Reloading** - Automatically reloads on changes.
- **Cross-Platform** - Works on Windows, macOS, and Linux.
- **Auto-Open Folder** - One-click access to your serve folder from the UI.

---

## 📦 Installation
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/wkthedev/ElecExpress.git
cd ElecExpress
```

### **2️⃣ Install Dependencies**
```sh
npm install
```

### **3️⃣ Run in Development Mode**
```sh
npm start
```

---

## 🔧 Configuration
The app uses `expressConfig.json` for folder customization. Create this file in the root directory if it doesn't exist.

### **Example `expressConfig.json`**
```json
{
    "serveFolder": "myWebsite",
    "width": 1280,
    "height": 720
}
```
- Default: `serve/`
- Change it to any folder name where you want to serve files.

---

## 🎯 How to Use
### **Start Hosting Your Site**
1. Run `npm start`.
2. Open the app.
3. Drop your website files into the configured serve folder.
4. ElecExpress will automatically start serving them!

### **Built-in Default Page**
If the serve folder is empty, ElecExpress displays a modern splash page with setup instructions.

### **Opening the Serve Folder**
- Click **"Get Started"** in the UI to open the configured folder.
- Click the folder path in the instructions for quick access.

---

## 🔨 Building for Production
To package the app into an executable:
```sh
npm run build  # Auto-detects OS
```
For specific platforms:
```sh
npm run build:win    # Windows
npm run build:mac    # macOS
npm run build:linux  # Linux
```

---

## ❓ FAQ
### **1. How do I change the folder being served?**
Modify `expressConfig.json` to set a different folder name.

### **2. Why isn’t my folder opening?**
Ensure you are running ElecExpress inside Electron, as this feature won’t work in a normal browser.

### **3. Can I use this as a portable app?**
Yes! The app can run from any directory without installation.

---

## 📜 License
MIT License © 2024 wkthedev

---

## ❤️ Contributions
Contributions are welcome! Feel free to submit issues or pull requests.

1. **Fork the repo**
2. **Create a feature branch** (`git checkout -b new-feature`)
3. **Commit your changes** (`git commit -m "Added new feature"`)
4. **Push to your branch** (`git push origin new-feature`)
5. **Create a Pull Request**

---

## 🌎 Connect
- **GitHub:** [wkthedev](https://github.com/wkthedev)
- **Website:** [wkthe.dev](https://wkthe.dev)
- **Bluesky:** [@wkthe.dev](https://bsky.app/profile/wkthe.dev)

🔥 Built with 💙 using Electron + Express!

