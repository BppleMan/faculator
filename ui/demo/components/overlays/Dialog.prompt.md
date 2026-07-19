模态弹窗:大切角钢板、琥珀顶线(危险时为红斜纹)、扫描线标题区。点遮罩关闭。

```jsx
<Dialog open={open} onClose={close} title="清空产线" subtitle="PURGE LINE" danger
  footer={<><Button variant="ghost" onClick={close}>取消</Button><Button variant="danger">确认清空</Button></>}>
  该操作将移除当前产线的全部节点,不可撤销。
</Dialog>
```