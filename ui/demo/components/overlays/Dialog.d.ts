/** 模态弹窗 · 大切角钢板 + 琥珀顶线 */
export interface DialogProps {
  open?: boolean;
  title?: React.ReactNode;
  /** 标题下英文微标注 */
  subtitle?: string;
  /** 危险弹窗:顶部危险斜纹 + 红标题 */
  danger?: boolean;
  /** 底部操作区(放 Button) */
  footer?: React.ReactNode;
  onClose?: () => void;
  /** @default 440 */
  width?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): JSX.Element;
