磁带机式锁定键组:一排键坐在共享护圈的深井里;按下的键沉底锁定(不回弹,琥珀字发光),按另一键时它自动弹起。互斥模式切换、运行状态(如 暂停/运行/快进)用它,替代普通 Segmented 的场景是"状态有物理感"时。

```jsx
const [mode, setMode] = useState('play');
<LatchGroup value={mode} onChange={setMode} options={[
  {value:'rew',label:'◀◀ 回退'},{value:'play',label:'▶ 运行'},{value:'ff',label:'▶▶ 快进'}]} />
```

`allowRelease` 允许再按弹起全部;与 Segmented 区分:Segmented 是轻量视图切换,LatchGroup 是重的机械状态锁定。
