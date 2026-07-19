机械铭牌标签页:整排页键坐在深井导轨里,激活页是升起的钢板铭牌(顶部金铜嵌条,与下方内容面板无缝相连),未激活页沉在轨内 3px。内容面板需自己渲染,背景用 `linear-gradient(180deg,#2A2620,#1E1C16)` + 黑描边与铭牌相接(上边框省略)。

```jsx
<Tabs value={tab} onChange={setTab} items={[{value:'io',label:'输入输出',count:6},{value:'pow',label:'功耗'}]} />
```

与 Segmented/LatchGroup 区分:Tabs 切换内容区;Segmented 轻量视图切换;LatchGroup 机械状态锁定。