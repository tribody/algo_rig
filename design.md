# design.md · 算法训练仪表盘视觉规范

> 本文件是仪表盘与 anatomy 原理图的唯一视觉依据。写码前读它，交稿前对照它自查。

## 1. 基调

终端 / IDE 风。整个页面像一台「训练仪器」：暗色操作台，数据是发光的读数，机械装置（anatomy 图）是台面上的仪器。

## 2. 色板

### 2.1 表面（背景 → 前景）

| 变量 | 值 | 用途 |
|------|-----|------|
| `--bg` | `#1e1e2e` | 页面底色 |
| `--panel` | `#262637` | 面板 / 卡片 |
| `--panel-2` | `#2e2e42` | 卡片内嵌块（代码块、读数窗） |
| `--line` | `#3a3a4f` | 边框、分隔线 |
| `--ink` | `#e8e8f0` | 主文字 |
| `--ink-dim` | `#a8a8bd` | 次要文字 |
| `--ink-faint` | `#6a6a85` | 弱注释、占位 |

### 2.2 强调色（语法高亮系，仅点缀，禁大面积铺色，禁默认蓝紫）

| 变量 | 值 | 语义 |
|------|-----|------|
| `--acc-green` | `#a6e3a4` | 成功 / 已完成 / 关键字 |
| `--acc-orange` | `#fab387` | 进行中 / 字符串 |
| `--acc-teal` | `#94e2d5` | 函数 / 链接 hover |
| `--acc-red` | `#f38ba8` | 错误 / Hard / 警示 |
| `--acc-yellow` | `#f9e2af` | 需重刷 / Medium |
| `--acc-mauve` | `#cba6f7` | **仅** 用于 anatomy 图内的 lit 零件与极少数高亮，不得作为 UI 主色 |

### 2.3 难度色

Easy `#a6e3a4` · Medium `#f9e2af` · Hard `#f38ba8`

## 3. 字体分工（零外部字体请求）

| 场景 | 字体栈 |
|------|--------|
| 标题 | `"Microsoft YaHei UI", "PingFang SC", sans-serif`，字重 300/600 分级 |
| 正文 | 同上，字重 400 |
| 代码 / Template | `Consolas, "JetBrains Mono", "Cascadia Mono", monospace` |
| 数字读数（进度、streak） | `Georgia, serif`（衬线数字，仪表感） |

## 4. 间距与形制

- 8px 栅格：所有 padding/margin/gap 取 8 的倍数（8/16/24/32）
- 卡片圆角 8px；代码块圆角 6px；按钮圆角 6px
- 面板边框 1px `--line`；主内容区最大宽 1200px 居中
- 分区之间留白 ≥ 48px；卡片内 padding 16~24px

## 5. 组件细则

- **进度条**：高 8px，轨道 `--panel-2`，填充 `--acc-green`，端头圆角
- **状态徽标**：未做（`--ink-faint` 空心）/ 已做（绿实心✓）/ 做错（红）/ 需重刷（黄）——全部是 20px 圆形小钮，可点击循环切换
- **代码块**：`--panel-2` 底，左缘 3px `--acc-teal` 竖条，语法高亮用 2.2 强调色手工标注
- **力扣题链**：下划线省略，hover 时 `--acc-teal` + 下划线；前缀难度色点（6px 圆）
- **anatomy 图卡片**：图置于 `--panel-2` 内嵌窗口中，折叠展开动画 200ms ease；每图右下角保留 anatomy 自带的 live readout

## 6. anatomy 图适配规则

- 图使用 anatomy 自身 `ISO_CSS` 的暗主题（tone hierarchy 优先，不硬套本页色板），但页面背景协调：图卡片窗口底色允许与 `--panel-2` 有细微差异（anatomy 自带底），以 1px `--line` 包边过渡
- 每图一个 Figure 档（40~80 零件），暗主题构建；`lit` 强调零件可选用 `--acc-mauve` 附近色，保持全页唯一高亮语义「正在被解释的部分」
- 运行时离屏静止（IntersectionObserver），减主题（prefers-reduced-motion）出静帧

## 7. 禁用项（自查红线）

- ✗ Tailwind 默认蓝 / 紫（#3B82F6、#8B5CF6 及近亲）作为主色或大面积
- ✗ 外部字体、CDN、任何网络请求
- ✗ 渐变横幅、发光标题
- ✗ 难度色与语义色混用（难度色只标难度）
- ✗ anatomy 图里出现 floating label / 气球标注 / 悬空引线
