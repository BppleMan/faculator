/** @startingPoint section="基础件" subtitle="切角钢面按钮 · 主/次/幽灵/危险" viewport="700x160" */
export interface ButtonProps {
  /** 视觉变体 @default 'primary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** 占满整行 */
  block?: boolean;
  /** 左侧图标节点(简单几何 SVG) */
  icon?: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
