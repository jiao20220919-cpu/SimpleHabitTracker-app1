# 🚀 极简习惯追踪器 - 全平台多端上架与发布准备指南 (Desktop & Mobile Launch Guide)

我们已为您配置完毕 **网页端 (Web)**、**电脑桌面端 (Windows/macOS PWA & Mac 专版)**、**Android (安卓原生手机端)** 以及 **iOS/Apple (苹果原生手机端)** 的全套跨平台发布与编译底层支持。此外，我们已在 `/public/icon.jpg` 生成了符合各大应用商店（App Store & Google Play）视觉包装评审标准的 3D 渲染高保真首发应用图标。

以下是帮助您的作品在全终端完美上架、分发、部署与真机调试的完整准备手册：

---

## 💻 一、电脑桌面端 (macOS & Windows) 极速发布指南

本项目自带完整的 **PWA (Progressive Web App)** 微服务规范，这意味着用户无需下载冗长的 `.exe` 或 `.dmg` 安装包，即可享受原生般的独立窗口安装体验。

### 1-1. 免费网页托管部署 (秒级自动化托管)
要将您的《极简习惯追踪器》发布至公网，推荐使用对前端支持最好、自带全球加速且有免费额度的服务：
- **Vercel** ([Vercel.com](https://vercel.com/)) 或 **Netlify** ([Netlify.com](https://netlify.com/)):
  1. 点击项目注册并关联您的 GitHub。
  2. 导入（Import）您导出的项目代码仓库。
  3. 确认以下默认构建配置：
     - **Build Command (构建命令)**: `npm run build`
     - **Output Directory (输出目录)**: `dist`
  4. 点击 **Deploy**，部署即刻完成，您将获得一个专属的加密 HTTPS 安全域名。

### 1-2. 在 macOS (Mac) 与 Windows 电脑端直接“安装”独立 App
当应用成功托管至 HTTPS 网址后：
1. **苹果 Mac 用户 (Safari 浏览器一键安装)**：
   - 打开 Safari ➜ 访问您的部署网址。
   - 点击 Safari 顶栏的 **「文件 (File)」** ➜ 选择 **「添加到程序坞 (Add to Dock...)」**。
   - 这将在 Mac 的程序坞（Dock 栏）和启动台（Launchpad）生成一个精致的《极简习惯追踪器》App 图标。
2. **Mac/Windows 用户 (Chrome / Edge 浏览器安装)**：
   - 使用 Chrome/Edge 浏览器进入部署网址。
   - 观察浏览器地址栏右侧，会出现一个 **「🌟 电脑下载/安装应用程序」** 图标。
   - 点击 **安装**，应用自动入驻桌面、开始菜单与启动台。
3. **原生体验**：启动后，应用将以绝对**无边框、无地址栏、沉浸式卡片视窗**的原生 macOS/Windows 应用样式运行，性能极佳，支持随系统主题自动切换深色/浅色皮肤，支持离线 IndexedDB 高速存储。

---

## 🍎 二、苹果 iOS 移动端 (iPhone/iPad) 与 Mac Catalyst 专版上架准备

我们已在您的 `package.json` 预埋了 `@capacitor/ios` 并加入了便捷的一键同步命令：

### 2-1. 初始化苹果 iOS 开发底座
只需在本地终端（需要运行在 macOS 电脑上，并安装了 Xcode）运行以下四步指令：
```bash
# 1. 安装最新项目包
npm install

# 2. 新增 iOS 底座包 (一辈子只需要运行一次)
npx cap add ios

# 3. 极速编译前端资源并使底座同步
npm run build:ios

# 4. 打开苹果工程编辑器 Xcode
npx cap open ios
```
这会直接弹出来由 Capacitor 为您生成的原生 Swift / Objective-C 包装工程。

### 2-2. 配置 App Store 开发者证书及包名 (App ID)
在自动弹出的 Xcode 窗口中：
1. 双击左侧最顶端的 **App** 工程蓝图文件。
2. 切换到 **「Signing & Capabilities（签名与证书）」** 标签：
   - 勾选 `Automatically manage signing（自动管理签名）`。
   - 在 `Team` 下拉菜单中选择您的 **Apple Developer (苹果开发者账号)**。
   - 在 `Bundle Identifier` 中填写您在 Apple App Store Connect 预注册的包名（默认我们的骨架是 `com.minimalhabit.app`，建议改成如 `com.yourdomain.habit`）。
3. 检查 Xcode 顶部，点击选项卡 **「Build Settings（构建设置）」** ➜ 搜索 `Product Name`，直接将其修改为您想要在 App Store 首发展示的 App 名称（如：**极简习惯** 或 **Minimalist Habit**）。

### 2-3. 一鱼多吃：免费开通 iOS 版在 💻 Mac 电脑端的运行支持 (Mac Catalyst)
现代 macOS 平台具备完美的原生继承优势。在 Xcode 的 `General`（常规）面板下：
- 勾选 **「Mac (Apple Silicon)」** 以及 **「Mac Catalyst」** 复选框。
- 这样，您只需开发一次，代码就能自动且完全合规地编译生成 **macOS 专用的 `.app` 原生软件包** 并直接上架 Mac App Store！

### 2-4. 一键渲染多级苹果图标与上架打包
1. 建议在本地使用命令行工具一键生成 iPhone 以及 iPad 的全部 30+ 种特异规格图标（以我们的 `/public/icon.jpg` 为高精渲染材质）：
   - 在您的 Mac 终端全局安装生成器：`npm install -g cordova-res`
   - 将主图标存为 `resources/icon.png` (推荐 1024x1024 像素)。
   - 执行：`cordova-res ios --skip-config --copy`
2. 上架打包打包：
   - Xcode 顶部模拟器选择：**"Any iOS Device (arm64)"**。
   - 点击 Xcode 顶栏菜单：**`Product` ➜ `Archive`**（打包存档）。
   - 进度条结束后点击右侧 **`Distribute App`** ➜ 选中 **`App Store Connect`**。
   - 跟着提示点击下一步，应用图标与二进制文件就会直接在 3 分钟内投递并同步到您的 **App Store Connect 后台**。
   - 填写完产品介绍后，即可将其直接推向全球用户下载！

---

## 🤖 三、安卓移动端 (Mobile - Android) 原生上架准备

### 3-1. 确认应用包名（App ID）与名称
项目根目录下的 `capacitor.config.ts` 是原生的中枢配置文件：
- **应用包名**: 当前默认是 `com.minimalhabit.app`。
  - 如果您需要上架 Google Play 等应用商城，可以替换为您的专属域名倒序（如 `com.yourcompany.habit`）。
- **应用名称**: 默认是 `极简习惯追踪器`。
- **注意**：修改此配置后，需要在本地解压项目运行 `npx cap sync` 刷新原生应用底层设定。

### 3-2. 手机端应用图标与启动页 (Icons & Splash) 的批量替换
1. 建议在本地使用 `cordova-res` 等命令行工具**一键生成安卓所需的所有多层级、自适应图标与启动页**：
   ```bash
   # 在您的电脑终端执行（需先安装该工具）
   npm install -g cordova-res
   
   # 在项目根目录下，准备符合尺寸的 icon.png (至少 1024x1024) 放入 /resources/
   cordova-res android --skip-config --copy
   ```
2. 或者是直接启动 Local 的 **Android Studio**，使用 Image Asset Studio 资源导入工具生成对应的 mipmap 图标：
   - 打开 Android Studio ➜ 右键 `app/res` 目录 ➜ 选择 `New` ➜ `Image Asset`。
   - `Asset Type` 选择 `Image`，路径选择 `/public/icon.jpg`。
   - 适当调整缩放比例 (Resize) 与背景颜色（由于是极简深色/浅色，可设置为近黑色的 Hex `#09090b` 或者是乳白色），点击 `Finish`，AS 将秒级为您适配安卓各分辨率。

### 3-3. 生成用于上架的自签名证书安全密钥 (Keystore)
上架 Google Play 或国内各大应用商城，都需要对 APK 或者是 AAB 文件进行签名。请在电脑的终端中使用以下 JDK 命令行工具（或者在 Android Studio 的 Generate Signed Bundle 窗口可视化操作）生成签名：
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias habit-key -keyalg RSA -keysize 2048 -validity 10000
```
- 之后生成的 `.keystore` 文件需要妥善保管。未来每次版本更新，都必须使用同一个密钥加密签名，否则商店会拒绝更新。

### 3-4. 打包并打包生成 `.aab` (Google Play 专用格式)
现在所有应用商店（特别是 Google Play）都要求提交 `.aab` (Android App Bundle) 格式，而不是 debug 使用的 `.apk` 文件。
1. 在本地打开解压后的 **Android Studio** 项目。
2. 顶栏菜单选择：`Build` ➜ `Generate Signed Bundle / APK(s)...`
3. 选择 `Android App Bundle` 并点击 `Next`。
4. 选择上面步骤中生成的 `my-release-key.keystore` 密钥，输入设定的密钥库密码。
5. 选择 `release` 变体，并点击 `Create` 按钮。
6. 打包进度条读完后，点击提示框的 `locate` 即可找到您的 `app-release.aab` 文件。
7. 直接将这个 `.aab` 精品发布文件上传至您的 **Google Play Console / 华为/小米开发者平台** 即可！

---

## 🛠️ 四、开发者本地 1 分钟开机极速编译指南（Capacitor 原理说明）
当您点击 **Export to ZIP** 下载了代码包后，只需在电脑做以下动作即可完全掌握整个源码：
1. **安装环境依赖**：
   ```bash
   npm install
   ```
2. **预览 & 修改调试**：
   ```bash
   npm run dev
   ```
3. **打包网络底层，并将改动一键部署到手机/桌面底座**（这也是 Xcode 和 Android Studio 内代码自动刷新的底层原理）：
   - **打包为 iOS/Mac NativeApp**：
     ```bash
     npm run build:ios
     ```
   - **打包为 安卓 Android NativeApp**：
     ```bash
     npm run build:android
     ```

---

## ☁️ 五、GitHub Actions 云端自动编译、签名与 AAB 生成指南 (Google Play 专用)

我们已为您在项目根目录配置了专属的自动化构建流：`.github/workflows/build-release.yml`。
您只需将代码推送（Push）到您的 GitHub 仓库的 `main` 或 `master` 分支，GitHub 就会在云端容器内**自动安装依赖、编译网页版、同步 App 真机外壳、打包出最终的 `.aab` 格式安装包（并同时附带 `.apk` 以便测试）！**

### 5-1. 第一步：在 GitHub 仓库添加安全密钥 (Secrets)
由于生成的 AAB 包必须使用您的自签名证书（Keystore）加密后才能被 Google Play 承认，这些属于核心商用资产，我们不应该上传到公共代码库。我们应当将其存储在 **GitHub Private Secrets** 中，由流水线按需安全调用。

请前往您的 GitHub 仓库 ➜ 点击顶部的 **Settings** ➜ 左侧侧边栏选择 **Secrets and variables** ➜ 点击 **Actions** ➜ 点击右侧按钮 **New repository secret**。依次配置以下 4 个字段：

1. **`SIGNING_KEY`** (证书的 Base64 文本)  
   - **它的作用**：GitHub Actions 会在运行时自动把这个 Base64 文本还原为真正的 `.keystore` 文件对应用进行安全盖章签字。
   - **获取方式**：在您的电脑终端（Mac Terminal 或 Windows WSL/Git Bash）对上面生成的 `my-release-key.keystore` 证书文件转换为 Base64。
     - **macOS / Linux 命令**：
       ```bash
       openssl base64 -in my-release-key.keystore -out base64_key.txt
       ```
     - **Windows (PowerShell) 命令**：
       ```powershell
       [Convert]::ToBase64String([IO.File]::ReadAllBytes("my-release-key.keystore")) > base64_key.txt
       ```
     - 打开生成的 `base64_key.txt` 文件，**复制里面的全部加密字符串**，粘贴并保存为 GitHub 的 `SIGNING_KEY` 密钥。

2. **`ALIAS`** (证书别名)  
   - 输入您在创建 keystore 时指定的别名（如上文命令中的：`habit-key`）。

3. **`KEY_STORE_PASSWORD`** (证书文件库密码)  
   - 输入您的 Keystore 密码。

4. **`KEY_PASSWORD`** (独占密钥项密码)  
   - 输入您的密钥个人密码（如果没有单独设置，通常和库密码保持一致）。

---

### 5-2. 第二步：推送代码至 GitHub

当您在本地将本项目推送至 GitHub 后：
1. 点击 GitHub 仓库顶栏的 **Actions** 标签卡。
2. 您会看到一个正在自动运转的绿色小圆圈，名字为 **"Build Signed Android AAB & APK for Google Play"**。
3. 等待约 3~5 分钟，项目将完美通过前端编译与 Gradle 底层。
4. **包体下载**：编译成功后，点击进入该流水线历史记录，在页面底部 **Artifacts (产物)** 栏目中，可直接一键下载名为 **`Habits-Production-AAB-APK`** 的 zip 文件。解压后即可直接获取：
   - 🌟 **`app-release-signed.aab`**（已签名，直接拿去上传至 Google Play Console 发布上架！）
   - 📱 **`app-release-signed.apk`**（已签名，可直接发送到手机上安装实测发布的最终效果！）

> **💡 温馨 fallback 提示**：即使您在第一天推送代码时**还没有配置上面的 4 个安全密钥**，云端流水线仍会自动运转！它将自动完成环境和打包全过程，并打包输出 **未签名版（Unsigned）的 AAB / APK 安装包** 供您确认结构完整。一旦您补齐了 Secrets，下一次推送就会完全无缝自动生成完美的商店级签名正式包！

---

祝您的《极简习惯追踪器》四端全平台（Web + macOS Desktop + iOS / Apple + Android 移动端 Native App）首发大获成功！ 🎉
