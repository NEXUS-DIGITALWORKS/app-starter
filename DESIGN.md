# DESIGN.md

Claude Code（claude.ai/code）がこのリポジトリでUI・レイアウト・スタイルを実装／変更する際のガイド。全体アーキテクチャは [CLAUDE.md](CLAUDE.md) を参照。

## 0. 使い方（最初に読む）

このドキュメントは「今どうなっているか（1章：系統マップ）」と「新規・変更時に何に従うか（2章以降：ビジュアルルール）」の2部構成。

UIを新規追加・変更する前に、必ず次の順で確認する。

1. 変更対象が1章のどの系統に属するか特定する（ログイン前/`.app`配下/`.tools`配下/build-or-buy結果画面）
2. `src/components/ui/` に使える共通コンポーネントがないか確認する
3. 同じ系統・同じ種類の既存ページを手本にする
4. 2〜5章のビジュアルルール（色の使用量、余白、カード、ボタン等）に沿って実装する
5. 6章の最終チェックリストで確認する

既存実装とこのドキュメントが矛盾する場合、新規コードはこのドキュメントを優先する。ただし1章の系統マップ自体は事実の記録であり、既存の系統を無理に統合・全面リファクタリングする指示ではない。**新しい5つ目の配色系統を増やさない。**

## 1. 系統マップ（現状・変更しない）

このリポジトリは単一のデザインシステムに統一されていない。かつては「ログイン前」トップページ（Landing.tsx）のみindigo系だったが、Landing.tsxは削除され `/` はToolsHome（青系）が担うようになった。そのためindigo系（①）は現在どのルートからも参照されない未使用コード（Home.tsx）としてのみ残っている。`/app` 配下と `/tools` 配下は共通UIが青 `#3157E5` 系に統一されている。

| 系統 | 実装方法 | 主なプライマリカラー | 使われている場所 |
|---|---|---|---|
| ① CSS変数（indigo） | [src/index.css](src/index.css) の `--color-*` カスタムプロパティ＋ページ別 `.css` | `#4f46e5` | [Home.tsx](src/pages/Home.tsx) のみ（未使用・どのルートからも参照されていない） |
| ②a shadcn/ui token | [tailwind.config.js](tailwind.config.js) の `bg-primary`/`text-primary` 等 | `.tools-scope` の有無で①/③に切り替わる | [src/components/ui/](src/components/ui/) 配下の基礎コンポーネント全般 |
| ③a ハードコード（blue） | Tailwindのarbitrary value（`bg-[#3157E5]`） | `#3157E5` | `/app` 配下（[AppLayout.tsx](src/layouts/AppLayout.tsx), [AccountMenu.tsx](src/features/auth/AccountMenu.tsx), [Account.tsx](src/pages/Account.tsx), [AppHome.tsx](src/pages/AppHome.tsx)）、[AuthWidget.tsx](src/features/auth/AuthWidget.tsx)、build-or-buy診断フローの各コンポーネント |
| ③b CSS変数スコープ上書き（blue） | `.tools-scope` クラスが `--color-primary`等を局所的に青へ上書き | `#3157E5` | [ToolsHome.tsx](src/pages/ToolsHome.tsx)/[DiagnosisIntro.tsx](src/pages/DiagnosisIntro.tsx)/[TechStackSelector.tsx](src/pages/TechStackSelector.tsx)/[TechGuide.tsx](src/pages/TechGuide.tsx)/[TechSelectorReport.tsx](src/pages/TechSelectorReport.tsx) |

[build-or-buy/components/](src/features/build-or-buy/components/) の結果表示はこのどれにも属さないアドホックな配色を持つ（4章）。

### ① CSS変数（indigo系）— [src/index.css](src/index.css)

```
--color-bg-1 / --color-bg-2   ページ背景グラデーション（#f5f7ff → #eef1fb）
--color-primary / -dark / -light   #4f46e5 / #4338ca / #eef0fe
--color-accent                #06b6d4
--color-text / -muted         #1f2333 / #6b7280
--color-border                #e5e7eb
--color-surface                #ffffff
--color-success / -bg         #059669 / #ecfdf5
--color-warning / -bg          #b45309 / #fffbeb
--color-danger                #dc2626
--shadow-sm / -md / -lg
--radius-md (12px) / --radius-lg (20px)
```

唯一の情報源（single source of truth）。同ファイル内のshadcn/ui向けRGBエイリアス（`--background`/`--primary`/`--border` 等）とは**手動で値を同期**させる運用。indigo系の色を変更する場合は両方を揃えて更新する。

### `.tools-scope` — `/tools` ページ向け青系スコープ上書き

```css
.tools-scope {
  --color-primary: #3157e5;
  --color-primary-dark: #2748c7;
  --color-primary-light: #eaf1ff;
  --primary: 49 87 229;
  --secondary: 234 241 255;
  --secondary-foreground: 39 72 199;
  --accent: 234 241 255;
  --accent-foreground: 39 72 199;
  --ring: 49 87 229;
}
```

`ToolsHome`/`DiagnosisIntro`/`TechStackSelector`/`TechGuide`/`TechSelectorReport` のルート要素に付与済み。**新しい`/tools`配下のページを追加するときはルート要素に `page tools-scope` を付与すれば同じ仕組みに乗る**（Landing/Homeには付与しない）。`ToolsHome.tsx` は `Home.tsx` との衝突を避けるため `tools-home-page` にリネーム済み。クラス名を触る際はLanding/Homeとの衝突がないか確認する。

### 共有プリミティブ — [src/App.css](src/App.css)

系統①のページで使い回すクラス群：`.page`, `.site-header`, `.brand`/`.brand-logo`/`.brand-tagline`, `.btn`/`.btn-primary`/`.btn-secondary`/`.btn-ghost`/`.btn-tab`, `.badge`/`.badge-success`/`.badge-warning`, `.auth-*`, `.field`, `.form-msg`。系統①のスタイルで新ページを作る場合はまずここを確認する。ページ固有スタイルは `PageName.css`（[Home.css](src/pages/Home.css), [Landing.css](src/pages/Landing.css) 参照）。

### shadcn/ui コンポーネント — [src/components/ui/](src/components/ui/)

`components.json`（style: `new-york`, baseColor: `neutral`, iconLibrary: `lucide`）に基づく。`cva` でvariant管理、`cn()`（[src/lib/utils.ts](src/lib/utils.ts)）でクラスをマージ。既存: `accordion`, `alert`, `badge`, `button`, `card`, `separator`, `tooltip`。新規追加が必要な場合はまずshadcn/uiに該当コンポーネントがないか確認し（`dialog`/`dropdown-menu`/`tabs`/`input`/`select`/`checkbox`/`radio-group`/`sheet`/`popover`/`table` 等）、このパターン（`forwardRef` + `cva` + `cn()`）を踏襲する。独自Buttonなどを別途作らない。

### ③ 青系（#3157E5）— `/app` 配下 ＋ `/tools` 配下（ログイン後全体）

- **③a ハードコード**: `/app` 配下（AppLayout/AccountMenu/Account/AppHome/AuthWidget）とbuild-or-buy診断フロー（[DiagnosisHeader.tsx](src/features/build-or-buy/components/DiagnosisHeader.tsx)/[DiagnosisStepper.tsx](src/features/build-or-buy/components/DiagnosisStepper.tsx)/[QuestionPanel.tsx](src/features/build-or-buy/components/QuestionPanel.tsx) 等）はTailwindのarbitrary value（`bg-[#3157E5]`）で書かれている。ここで色を変える場合は該当ファイル群を横断してhexを置換する必要がある。
- **③b `.tools-scope`**: 前述の`/tools`トップレベルページは、CSS変数を局所的に青へ上書きすることで同じ青になる（①の仕組みをそのまま利用）。

新しい `/app` 配下の画面は③aのTailwindユーティリティ直書きに、新しい `/tools` 配下のページは③bの `.tools-scope` 方式に合わせる。最終的な見た目（色の値）は共通なので、以下2〜5章のルールはどちらにも適用される。

## 2. カラーパレット（ログイン後＝青系、③a/③bで共通）

**Brand**

```
Primary             #3157E5
Primary Hover       #2748C7
Primary Light       #EAF1FF
```

**Background**

```
App Background      #F7F8FA
Surface（カード）     #FFFFFF
Hover Background     #F8FAFC
```

**Text**

```
Heading              #111827
Body                 #344054
Secondary            #475467
Muted                #667085
Disabled / Hint      #98A2B3
```

**Border**

```
Default              #E5E7EB
Strong                #D0D5DD
Subtle                #EEF0F4
```

**Semantic**（①のindigo系と共通の値、系統をまたいで同じ）

```
Success              #059669 / bg #ECFDF5
Warning              #B45309 / bg #FFFBEB
Danger               #B42318 / bg #FEF3F2
```

③bの `/tools` ページや `src/components/ui/` の基礎コンポーネントでは、可能な場合Hex直書きより `bg-primary` / `text-primary` / `border-border` / `text-muted-foreground` / `bg-background` / `bg-card` などshadcn/uiのSemantic Tokenを優先する（`.tools-scope` 配下なら自動的に青になる）。③aのようにTailwindのarbitrary valueで直書きされている既存ファイルを触る場合は、その場で無理に全面Token化しない。

### Blueの使用ルール

Blueは「重要な操作・選択状態・現在位置」を示すために使う。見出し・カード背景・アイコン・ボタン・ラベル・枠線・説明文を同じ画面内で全部Blueにしない。目安は **Neutral 80〜90% + Blue Accent 10〜20%**。

使ってよいもの: Primary Button／選択中のタブ／Active Navigation／リンク／Focus Ring／選択中のカード／Progress・Stepの現在状態／重要な数値やアクセント。

同一エリアにPrimary Buttonを何個も並べない。

## 3. レイアウト・余白・カード・枠線・角丸

**余白**は4px/8px系グリッドを基本とする（4/8/12/16/20/24/32/40/48/64px）。理由のない中途半端な値（13px, 17px等）を新規追加しない。

```
ページ余白   Mobile 16px / Tablet 24px / Desktop 24〜32px
セクション間  24〜40px
カード内部    16〜24px
見出し-本文   8〜12px
本文段落間    12〜16px
```

**カード**は情報単位を表現する。

```
background  white
border      1px solid #E5E7EB
radius      12〜16px
shadow      原則なし、または非常に弱い
padding     16〜24px
```

避ける: カードの中にカード、強いDrop Shadow、太い/二重枠線、Blueの外枠多用、Gradient背景、装飾目的だけの色付きカード。

**枠線**は最小限（通常 #E5E7EB／入力等強め #D0D5DD／非常に弱い区切り #EEF0F4）。装飾目的の点線・破線・二重線・太いBlue枠は使わない（ドラッグ&ドロップ領域など意味を持つ場合を除く）。

**角丸**: Button/Input 8〜10px、Card 12〜16px、Large Panel 16px、Modal 16〜20px、Pill `rounded-full`（Avatar/Status/Chip/Badgeなど丸い意味があるUIに限定、通常ボタンをPill化しない）。

**Shadow**は控えめに。優先順位は Background差 → Border → Spacing → Shadow。`shadow-xl`/`shadow-2xl`のような強いShadowを通常カードに使わない。

## 4. コンポーネント別ルール

**タイポグラフィ**: フォントは[index.css](src/index.css)の日本語フォントスタック（BIZ UDPGothic / Hiragino Sans / Yu Gothic UI / Noto Sans JP）を使用し、個別コンポーネントで`font-family`を変更しない。アイコンは[lucide-react](https://lucide.dev/)のみ。

```
Page Title      28〜32px / weight 700
Section Title   20〜24px / weight 600〜700
Card Title      15〜18px / weight 600
Body            14〜16px / weight 400
Small / Meta    12〜13px
```

重要度を色・サイズ・太さの3つ同時に強調しすぎない。見出しは短く（タイトル＋短い説明文）。説明が多い場合はセクションを分ける。

**ボタン**: Primary（Blue背景・白文字）、Secondary（白背景・Neutral枠・濃色文字）、Ghost（透明・Hoverのみ淡背景）、Destructive（Danger文字・Danger淡背景、通常のBlueと混同させない）。高さは基本40〜44px、小型操作32〜36px、CTA 44〜48px。理由なく同一画面内で高さをバラつかせない。

**Tabs**: 選択中はBlue文字＋Blue枠/淡背景、未選択はMuted文字＋透明/白。Tabs全体をBlueで塗りつぶさない。

**Accordion**: 白背景・薄いBorder・12〜16px Radius・十分な上下Padding。Hoverは#F8FAFC。Open状態でも強いBlue背景にしない（使うなら非常に淡いBlueまで）。大項目の番号（①②③や円形Badge）は構造上重要なステップのみに使い、本文中の手順にまで多用しない（本文は `1. 2. 3.` か通常の箇条書き）。開いた後にBorder付きBoxを大量に並べない（Heading→Paragraph→List→必要な場合のみSub Sectionの順）。

**選択状態**（Checkbox/Radio/Selectable Card）: 選択＝Blue枠＋Blueアイコン＋必要なら淡いBlue背景、未選択＝Neutral枠＋白背景。Border/Background/Shadow/Badge/Iconを同時に全部変えない（通常2つまで）。

**Hover/Focus**: Hoverは背景`#F8FAFC`程度、大きな拡大・移動アニメーションは使わない（`scale-105`等を多用しない）。Focusは`focus-visible:ring`等で必ず残す（`outline: none`だけの指定はしない）。

**Status/Risk**: Success=Green、Warning=Amber、Danger=Red、Info=Blue、Neutral=Gray。意味のないPurple/Orange/Pinkを装飾目的で追加しない（High=Red、Medium=Amber、Low=Neutral/Green）。

**リスト**: 通常の説明は `・` `-` `1. 2. 3.` を基本とし、すべてをBadge/Chip/Card/Icon Boxへ変換しない。

**アイコン背景**: 色付き四角形に毎回入れない。重要なカテゴリ・機能分類・ステータス・主要セクションなど意味がある場合のみ使う。

## 5. 禁止事項（ログイン後UI・新規実装）

- ログイン後画面へのIndigoブランドカラーの混入
- 新しい5つ目の配色系統の追加
- 理由のないPurple / Pink / Orange
- 大量のGradient
- 装飾目的の点線・破線・太いBorder・二重Border
- Card in Card in Card、大量の色付きCard、すべてShadow付きCard
- 理由のない`rounded-full`、画面ごとに違うRadius
- 画面ごとのFont変更、大量の太字、大量のBlue Text
- 大きなScale/移動、常時アニメーション、業務画面で不要な派手なTransition

## 6. build-or-buy診断結果のアドホック配色（維持、正規化しない）

[src/features/build-or-buy/components/](src/features/build-or-buy/components/) は上記いずれの系統にも乗らない配色を個別に持つ:

- [ScoreCard.tsx](src/features/build-or-buy/components/ScoreCard.tsx): 濃紺背景 `#0B1533` ＋ アクセントの淡い青 `#8DA0FF`
- [RiskPanel.tsx](src/features/build-or-buy/components/RiskPanel.tsx): Tailwind標準パレット（`red-*`/`amber-*`/`slate-*`）を重要度（高/中/低）にマッピング
- その他のカード類にオレンジ系・紫系の個別hex（`#FFF3E6`, `#EAF1FF`, `#F3EEFF` 等）が点在

診断結果表示は独自のビジュアル言語として意図的に作られている。この領域を触る場合は既存配色をそのまま踏襲し、①③の系統に合わせて書き換えない。ただし、この領域でも「診断結果画面は通常画面より多少豊かな表現を許容するが、Typography・Spacing・Card Radius・Border・Button・Navigationの基本ルール（3〜4章）はログイン後標準に合わせる」という原則は維持する。

## 7. 新規UI追加時の判断フロー

1. `Landing.tsx`/`Home.tsx`（ログイン前）そのものを触るか？ → 系統①のindigoのまま、`--color-*` 変数を直接使う
2. `/app` 配下（ログイン後アプリのシェル）か、build-or-buy診断フローの質問回答画面か？ → 系統③a（ハードコードblue、Tailwindユーティリティ直書き）に合わせる
3. `/tools` 配下に新しいトップレベルページを追加するか？ → ルート要素に `page tools-scope` を付与し、①のApp.css共有プリミティブ・ページ別CSSを使う
4. 汎用の再利用可能な基礎UIパーツ（ボタン・カード・バッジ等）を新設するか？ → `src/components/ui/` にshadcnパターンで追加する（色は呼び出し側の `.tools-scope` 有無でindigo/blueどちらにもなる）
5. 診断結果表示など、すでに独自ビジュアルを持つ機能の内部か？ → 6章の通り、その機能内の既存パターンを踏襲する

判断に迷う場合、変更対象ファイルと同じディレクトリ・同じページ内の既存コードが最優先の手本になる。「同じディレクトリにこの色があるから」という理由だけで、周辺のアドホックな実装をそのままコピーしない。

指示が「見た目を改善」「もう少しきれいに」「モダンに」のような抽象的なものでも、独自デザインへ走らない。改善は次の順で検討する: Alignment → Spacing → Typography → Information hierarchy → Border → State → Color → Decoration。要素を追加するより、減らして整えることを優先する。

## 8. デグレ防止

見た目だけを変更する指示の場合、以下は変更しない: 既存イベント（onClick/Link/Route/Form submit）、Validation、Accessibility、Responsive behavior、Loading/Error/Disabled state。

## 9. 最終チェックリスト

- ログイン後なのにIndigoが混ざっていないか／Blueを使いすぎていないか／独自Hexを新規追加していないか
- 左右位置が揃っているか／セクション間の余白が一定か／Mobileで崩れないか
- Cardが多すぎないか／Cardの中にCardを入れすぎていないか／Borderが多すぎないか
- Page Title / Section Title / Card Title / Body / Meta の階層が明確か
- Hover / Focus / Active / Selected / Disabled / Error が識別できるか
- 同じ役割のUIが、別ページと違うデザインになっていないか