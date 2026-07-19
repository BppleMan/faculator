目标产率式步进数值框:中间琥珀大数字凹槽读数,两侧 −/+ 钢面按钮。受控组件。

```jsx
const [rate, setRate] = useState(60);
<NumberField label="目标产率" value={rate} onChange={setRate} step={10} min={0} unit="/min" />
```