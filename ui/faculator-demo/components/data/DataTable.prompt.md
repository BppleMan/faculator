板缝分隔线表格,表头微标注样式;数值列设 `mono: true` 右对齐;`render` 可嵌 Badge/Tag。

```jsx
<DataTable rowKey="id" columns={[{key:'name',title:'物品'},{key:'rate',title:'速率',mono:true,align:'right'}]} rows={rows} />
```