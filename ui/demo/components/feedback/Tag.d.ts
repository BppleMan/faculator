/** 等宽小标签(物品/配方名) */
export interface TagProps {
  /** 左侧色块颜色(物品色) */
  color?: string;
  /** 提供则显示 × 可移除 */
  onRemove?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Tag(props: TagProps): JSX.Element;
