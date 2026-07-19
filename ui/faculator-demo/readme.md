# Faculator 设计系统

Faculator 是一个工厂/产线规划工具(节点图、层级树、桑基图等视图,计算产率、机器数与功耗)。本设计系统为其后续迭代提供统一的视觉语言与组件库。

## 视觉方向 —— "重工业控制台"
参考用户提供的 Faculator 截图(Factorio 风格的暖炭+金琥珀控制台):庞大机器的力量感 + 精密仪器的可信赖。落地为:

- **暖炭钢基底**:暖黑炭面(#151412–#2F2D28 五级),页面底用 `--tex-page`(径向渐变+噪点)。
- **纯 CSS 材质**:内联 SVG 噪点 `--tex-noise` 叠进 `--plate` / `--plate-amber` / `--tex-page`,拉丝层 `--tex-brushed`;禁止使用图片纹理。
- **双描边钢板**:外圈 1px 纯黑 `--line-0` + 内圈 1px 亮线(inset shadow),是本系统的签名轮廓;完全方正,无圆角无切角。
- **四角螺丝**:`.fx-screw` 放在面板/框架四角;装饰格栅 `.fx-vent`。
- **金琥珀主键**:`--plate-amber` 金面 + `--amber-ink` 深字 + 内侧 #F6D57E 亮描边;选中态用金色描边框。
- **状态灯**:方形小灯(非圆形),运行绿 #4CD964,呼吸动画 `.fx-lamp-blink`。
- **机械感交互**:悬停提亮+金辉光(`.fx-glow`)、按下下沉 1px(`.fx-press`),缓动 `--ease-mech`,90/150ms,无弹跳。
- **高密度**:输入高 26px、按钮 md 28px、表格行 22px、面板内边距 10–12px。

## 内容基调 CONTENT FUNDAMENTALS
- 中文为主,辅以英文微标注(全大写 + 0.14em 宽字距,如 `BLOCKS · 各为一条 LINE`)。
- 文案短促、工程化、名词性:"目标产率""组装机等级""模块槽位";不用感叹号、不用 emoji。
- 数值一律 JetBrains Mono;单位以小号淡色跟随(如 `/min`)。
- 称谓中性,不出现"你/您";按钮用动词短语("添加节点""重算产线")。

## 视觉基础 VISUAL FOUNDATIONS
- **字体**:Noto Sans SC(全部界面文字,重标题 900)+ IBM Plex Mono(数值/微标注)。
- **颜色**:见 `tokens/colors.css`。白色系仅用于文字;背景永远是深空钢。语义色 ok/info/danger/warn 均带 10% tint 底。
- **背景**:纯色钢面,无图片、无大渐变;质感来自板缝、铆钉、扫描线。
- **边框**:1px 板缝线(--line-1~4),越亮层级越高;无外发光描边(辉光只在交互态)。
- **阴影**:`--shadow-plate`(浮起钢板)与 `--shadow-inset`(凹槽);无大范围柔和投影。
- **圆角**:一律 0,完全方正;轮廓靠黑+亮双描边。
- **悬停**:琥珀辉光 + 边线提亮;**按下**:下沉 1px + 凹槽阴影;禁用:40% 不透明度。
- **透明/模糊**:弹窗遮罩用 rgba(5,12,21,0.7),不用 backdrop-blur。
- **布局**:紧凑高密度,4px 基准间距(--sp-1~6)。

## 图标 ICONOGRAPHY
产品内使用极简几何内联 SVG(六边形 logo、色点、加减号)。组件库沿用:仅用简单几何图形(点、方、菱形、V 形箭头、对勾、×),1.5px 描边,不引入外部图标库。状态优先用"状态灯"(圆点 + 呼吸动画)而非图标表达。项目未提供正式 logo 文件,组件中品牌位一律用纯文字 `FACULATOR` 呈现。

## 索引
- `styles.css` — 全局入口(仅 @import)
- `tokens/` — colors / typography / effects(含 .fx-* 交互类与 @keyframes)
- `guidelines/` — 基础规范卡(色彩、字体、质感、动效)
- `components/` — 组件源码,按目录分组:
  - `buttons/` Button, IconButton
  - `inputs/` Input, NumberField, Select
  - `toggles/` Checkbox, Radio, Switch, Segmented
  - `feedback/` Badge, Tag, Alert, ProgressBar
  - `overlays/` Dialog, Tooltip
  - `data/` Gauge, StatCard, DataTable, ChartFrame
  - `navigation/` Tabs, Breadcrumb, SideNav
  - `surfaces/` Panel
- `SKILL.md` — Agent Skill 入口

## 有意添加 Intentional additions
无外部组件源,本套为按需求(基础/反馈/数据/导航全套)从零定义的标准组件集,风格严格取自现有 Faculator 界面(`Faculator.dc.html`)。
