# 📱 极简习惯追踪器 - Android APK 编译与导出指南

我们已经为您在云端开发环境中成功安装、配置并初始化了 **Capacitor**，并且所有网页端（React + Vite）的静态资源和配置已经 100% 同步整合到了本项目的 `android` 原生项目目录中。

为了将该项目导出并在您的手机上安装运行，请按照以下步骤操作：

---

## 🛠️ 第一步：下载本项目源码至您的本地电脑

在 **Google AI Studio** 页面：
1. 点击右上角的 **“⚙️ 设置” 或 “Export”** 菜单。
2. 选择 **“Export to ZIP”**（导出为 ZIP 压缩包）或 **“Export to GitHub”**。
3. 成功下载 ZIP 压缩包后，将其解压到您本地电脑的任意工作目录（如桌面）。

---

## 💻 第二步：本地准备环境（仅需一次）

请确保您的本地电脑上安装了以下基础工具：
1. **Node.js**: [https://nodejs.org/](https://nodejs.org/) (推荐 LTS 版本)。
2. **Android Studio**: [https://developer.android.com/studio](https://developer.android.com/studio) (用于打包和编译 APK)。

---

## ⚙️ 第三步：本地依赖安装与更新

打开您解压后的文件夹（使用命令行/终端 `Terminal`），依次运行以下命令：

1. **安装本地依赖库**：
   ```bash
   npm install
   ```

2. **编译并同步代码**（当您在本地修改了 React 网页代码时，可运行此命令同步到安卓项目）：
   ```bash
   npm run build:android
   ```

---

## 🚀 第四步：使用 Android Studio 编译导出 APK

这是最关键也最简单的一步，无需复杂的命令行操作：

1. 打开 **Android Studio**，选择 **“Open File or Project”** (打开已有项目)。
2. 选择解压目录下名为 **`android`** 的子文件夹并打开。
3. 等待 Android Studio 自动加载 Gradle 依赖（这可能需要 1~3 分钟，取决于网络速度）。
4. 在顶部菜单栏中，依次点击：
   - **`Build`** ➔ **`Build Bundle(s) / APK(s)`** ➔ **`Build APK(s)`**
5. 编译完成后，右下角会弹出提示框。点击其中的 **`locate`**（定位）超链接。
6. 您会看到刚才编译生成好的安装包：**`app-debug.apk`**。
7. **把这个 `.apk` 文件通过 QQ、微信或数据线发到您的手机上，点击即可直接安装运行！**

---

## ✨ 进阶 tips

- **真机无线调试调试**：通过 USB 数据线将手机连接到电脑，并在手机上开启“开发者选项 ➔ USB 调试”。在 Android Studio 的右上角选择您的手机设备，点击 **`Run` (绿色三角形「运行」按钮)**，即可实现一键在手机上安装并实时调试！
- **更新 UI 界面**：如果您修改了 `src` 中的任意代码，在命令行只需输入 `npm run build:android`，再在 Android Studio 里点一下运行，手机上的 App 就会立刻同步更新。

祝您体验愉快！
