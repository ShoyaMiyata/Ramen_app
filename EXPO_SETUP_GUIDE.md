# Nooodle Mobile - Expo プロジェクトセットアップガイド

このガイドでは、Expoプロジェクトを**ゼロから構築**し、Supabaseと連携させます。

---

## 📋 目次

1. [前提条件](#前提条件)
2. [Expoプロジェクト作成](#step-1-expoプロジェクト作成)
3. [依存関係インストール](#step-2-依存関係インストール)
4. [プロジェクト構造セットアップ](#step-3-プロジェクト構造セットアップ)
5. [Supabase統合](#step-4-supabase統合)
6. [EAS設定](#step-5-eas設定)
7. [開発サーバー起動](#step-6-開発サーバー起動)
8. [トラブルシューティング](#トラブルシューティング)

---

## 前提条件

### 必須
- **Node.js**: 18.x 以上
- **npm** または **pnpm**
- **Git**
- **スマートフォン**: iOS（iPhone）または Android（開発用）
- **Expo Go アプリ**: App Store / Play Storeからインストール

### 推奨
- **VS Code**: エディタ
- **EAS CLI**: `npm install -g eas-cli`

---

## Step 1: Expoプロジェクト作成

### 1-1. Expo CLIインストール

```bash
# Expo CLIをグローバルインストール
npm install -g expo-cli eas-cli

# バージョン確認
expo --version
eas --version
```

### 1-2. プロジェクト作成

```bash
# プロジェクト作成（Expo Router + TypeScriptテンプレート）
npx create-expo-app@latest nooodle-mobile --template tabs

# プロジェクトディレクトリに移動
cd nooodle-mobile
```

### 1-3. Gitリポジトリ初期化

```bash
git init
git add .
git commit -m "Initial commit"
```

✅ **Expoプロジェクト作成完了！**

---

## Step 2: 依存関係インストール

### 2-1. Core依存関係

```bash
# Supabase クライアント
npm install @supabase/supabase-js

# React Native URL Polyfill（Supabase必須）
npm install react-native-url-polyfill

# AsyncStorage（セッション保存用）
npm install @react-native-async-storage/async-storage
```

### 2-2. データフェッチ・状態管理

```bash
# TanStack Query（React Query）
npm install @tanstack/react-query

# Zustand（グローバル状態管理）
npm install zustand
```

### 2-3. UI・スタイリング

```bash
# React Native Paper（Material Design UI）
npm install react-native-paper react-native-vector-icons

# NativeWind（Tailwind CSS for React Native）
npm install nativewind
npm install --save-dev tailwindcss

# Expo Vector Icons
# → 既にExpoに含まれているため追加不要
```

### 2-4. 画像・メディア

```bash
# 画像選択
npm install expo-image-picker

# 最適化された画像コンポーネント
npm install expo-image

# カメラアクセス
npm install expo-camera
```

### 2-5. アニメーション

```bash
# React Native Reanimated
npm install react-native-reanimated

# React Native Gesture Handler
npm install react-native-gesture-handler
```

### 2-6. 通知

```bash
# Expo Notifications
npm install expo-notifications

# Expo Device（デバイス情報取得）
npm install expo-device
```

### 2-7. バリデーション

```bash
# Zod
npm install zod
```

### 2-8. Dev依存関係

```bash
# TypeScript型定義
npm install --save-dev @types/react @types/react-native
```

✅ **依存関係インストール完了！**

---

## Step 3: プロジェクト構造セットアップ

### 3-1. ディレクトリ作成

```bash
# プロジェクトルートで実行
mkdir -p lib/{api,hooks,stores,utils,constants}
mkdir -p components/{features,layout,ui}
mkdir -p supabase
```

### 3-2. `.env` ファイル作成

```bash
# .envファイル作成
touch .env

# .gitignoreに追加
echo ".env" >> .gitignore
```

`.env` の内容（Supabaseセットアップガイドで取得したAPIキーを使用）：

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# App Config
EXPO_PUBLIC_APP_NAME=Nooodle
EXPO_PUBLIC_APP_VERSION=1.0.0
```

### 3-3. `app.json` 設定

```json
{
  "expo": {
    "name": "Nooodle",
    "slug": "nooodle-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "nooodle",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/images/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#F97316"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.nooodle",
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "ラーメンの写真を投稿するために写真ライブラリへのアクセスが必要です",
        "NSCameraUsageDescription": "ラーメンの写真を撮影するためにカメラへのアクセスが必要です",
        "NSPhotoLibraryAddUsageDescription": "撮影した写真を保存するために写真ライブラリへのアクセスが必要です"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#F97316"
      },
      "package": "com.yourcompany.nooodle",
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/images/notification-icon.png",
          "color": "#F97316"
        }
      ],
      [
        "expo-image-picker",
        {
          "photosPermission": "ラーメンの写真を投稿するために写真ライブラリへのアクセスが必要です"
        }
      ],
      [
        "expo-camera",
        {
          "cameraPermission": "ラーメンの写真を撮影するためにカメラへのアクセスが必要です"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {
        "origin": false
      },
      "eas": {
        "projectId": "your-project-id-here"
      }
    }
  }
}
```

✅ **プロジェクト構造セットアップ完了！**

---

## Step 4: Supabase統合

### 4-1. Supabaseクライアント作成

`lib/supabase.ts` を作成：

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 4-2. 認証フック作成

`lib/hooks/useAuth.ts` を作成：

```typescript
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 初期セッション取得
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // セッション変更を購読
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, session, loading };
}
```

### 4-3. 動作確認

`app/index.tsx` で簡単なテスト：

```typescript
import { Text, View } from 'react-native';
import { useAuth } from '@/lib/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome to Nooodle!</Text>
      <Text>User: {user?.email ?? 'Not logged in'}</Text>
    </View>
  );
}
```

✅ **Supabase統合完了！**

---

## Step 5: EAS設定

### 5-1. EASプロジェクト初期化

```bash
# Expo アカウントにログイン
eas login

# EASプロジェクト初期化
eas init

# プロジェクトIDを取得
eas whoami
```

### 5-2. `eas.json` 作成

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "aab"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 5-3. ビルド（オプション）

```bash
# Development Build（開発用）
eas build --profile development --platform ios
eas build --profile development --platform android

# Preview Build（内部テスト用）
eas build --profile preview --platform ios
eas build --profile preview --platform android
```

✅ **EAS設定完了！**

---

## Step 6: 開発サーバー起動

### 6-1. 開発サーバー起動

```bash
# Expoサーバー起動
npm start

# または
npx expo start
```

### 6-2. アプリを実機で実行

1. スマートフォンで **Expo Go** アプリを起動
2. QRコードをスキャン
   - **iOS**: カメラアプリでスキャン
   - **Android**: Expo Go アプリ内のスキャナーでスキャン
3. アプリが起動します！

### 6-3. Simulatorで実行

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android
```

✅ **開発サーバー起動完了！**

---

## 🎉 セットアップ完了！

これで Expo + Supabase のセットアップは完了です！

### 次のステップ

1. **実装開始**: `IMPLEMENTATION_GUIDE.md` を参照
2. **認証画面実装**: ログイン・サインアップ画面を作成
3. **投稿機能実装**: ラーメン投稿フォームを作成

---

## トラブルシューティング

### エラー: `Cannot find module '@supabase/supabase-js'`

```bash
# キャッシュクリア＋再インストール
rm -rf node_modules
npm install
```

### エラー: `Unable to resolve "react-native-url-polyfill/auto"`

```bash
# react-native-url-polyfillを再インストール
npm install react-native-url-polyfill
```

### Expo Goでアプリが起動しない

1. ファイアウォール設定を確認
2. PCとスマートフォンが同じWi-Fiに接続されているか確認
3. `npx expo start --tunnel` を試す

### iOS Simulatorが起動しない

```bash
# Xcode Command Line Toolsをインストール
xcode-select --install

# Simulatorを手動起動
open -a Simulator
```

---

## 📚 参考リンク

- [Expo公式ドキュメント](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Supabase + React Native](https://supabase.com/docs/guides/getting-started/quickstarts/react-native)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**作成日**: 2025年12月12日
**著者**: Claude Code
