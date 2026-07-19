/** 方形切角图标按钮 */
export interface IconButtonProps {
  /** @default 'secondary' */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** @default 'md' (24/30/38px) */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  /** 悬停提示(原生 title) */
  title?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  /** 图标内容:简单几何 SVG 或字符(+ − ×) */
  children?: React.ReactNode;
}
export declare function IconButton(props: IconButtonProps): JSX.Element;
