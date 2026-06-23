# 📱 极简习惯追踪器 | Minimalist Habit Tracker

[![Build Signed Android AAB & APK for Google Play](https://github.com/your-username/your-repo-name/actions/workflows/build-release.yml/badge.svg)](https://github.com/your-username/your-repo-name/actions)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TailwindCSS-61dafb)
![Mobile Support](https://img.shields.io/badge/Platform-Web%20|%20Android%20|%20iOS%20|%20PWA-brightgreen)

一款专为追求效率的人士打造的 **跨平台多端原生级习惯追踪应用**。采用极致简洁纯粹的界面（支持深色/浅色模式），通过直观的卡片与数据统计帮助您管理日常生活和培养长期良好习惯。

本项目已全面打通了 **网页版 (Web)**、**独立桌面端 (Windows/macOS PWA)**、**原生 Android (安卓)** 以及 **原生 iOS (苹果)** 的完整底层同步与编译环境。

---

## ✨ 核心特色功能

- 🎨 **极简美学设计**：深/浅色沉浸式自适应主题，无杂乱信息干扰，专注习惯培养本身。
- 📊 **多维数据洞察**：连续打卡天数（Streak）、完结率图表、周/月历史统计以及习惯等级成长。
- 📱 **原生跨平台外壳**：借助 Capacitor 深度打通，支持原生手势、手机端状态栏同步、IndexedDB 极速离线存储。
- ⚙️ **电脑桌面微服务 (PWA)**：在电脑浏览器一键点击即可一秒生成免安装的 macOS/Windows 沉浸式独立客户端窗口。
- 🚀 **GitHub Actions 云编译**：项目集成了 GitHub Actions 自动化流水线，您只需将代码推送到 GitHub，云端就会**自动编译、对签名密钥打包并输出直接可供上架 Google Play 的 `.aab` 格式应用包**！

---

## 💻 开发者极速开机与本地调试

### 1. 克隆并安装依赖
```bash
# 安装本地依赖
npm install
```

### 2. 启动本地 Web 端实时预览
```bash
# 启动热重载开发服务器
npm run dev
```
启动后访问 `http://localhost:3000` 即可实时查看和调试界面。

### 3. 一键同步并启动移动端项目
每次修改了前端代码后，只需编译并同步即可在 Android Studio 或 Xcode 中调试真机：

* **安卓 Android 开发调试**：
  ```bash
  # 编译 Web 产物并一键同步到 Android 底层
  npm run build:android
  
  # 使用 Android Studio 打开安卓工程
  npx cap open android
  ```
  *在 Android Studio 中点击运行，即可直达安卓真机/模拟器测试。*

* **苹果 iOS 开发调试** *(需要运行在 macOS 电脑并安装了 Xcode)*：
  ```bash
  # 编译 Web 产物并一键同步到 iOS 底层
  npm run build:ios
  
  # 使用 Xcode 打开苹果工程
  npx cap open ios
  ```
  *在 Xcode 联机您的 iPhone 即可一键真机调试。*

---

## ☁️ 云端全自动打包上架 (Google Play / App Store)

### 🚀 安卓自动化流水线
我们已经在 `.github/workflows/build-release.yml` 配置了完整的 CI/CD 流程：
1. **推送即编译**：将本项目推送到 GitHub 仓库的 `main` 或 `master` 分支后，GitHub Actions 就会自动介入。
2. **下载成品包**：编译成功后，在 GitHub Actions 流水线下方的 **Artifacts (构建产物)** 即可直接下载已签名的 **`.aab`** 和 **`.apk`**。

> 💡 *关于如何为应用配置永久自签名密钥（Keystore）、GitHub Secrets 安全环境变量以及上架准备，请阅读 `/LAUNCH_PREPARATION_GUIDE.md` 获取超详细指引。*

---

## 🛠️ 项目主要结构说明

```text
├── .github/workflows/       # GitHub Actions 自动构建 CI/CD 脚本
├── android/                 # Android 原生应用程序项目底层框架
├── public/                  # 静态公共资源，包含全规格 3D 高精图标 logo
├── src/                     # React 核心前端业务代码
│   ├── components/          # 习惯列表、打卡日历等交互组件
│   ├── App.tsx              # 应用渲染总入口
│   └── main.tsx             # 渲染注册驱动
├── capacitor.config.ts      # 跨平台原生配置文件（可在其中修改包名和应用名称）
├── LAUNCH_PREPARATION_GUIDE.md # 🚀 详细的多端部署、PWA、iOS 和 Android 编译上架手册（极实操性！）
└── README.md                # 本自述文件
```

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 许可开源。欢迎大家提 Issue 或 Fork 贡献代码！
