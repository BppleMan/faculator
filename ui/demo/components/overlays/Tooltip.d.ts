/** 悬停提示 · 切角小面板 */
export interface TooltipProps {
  content: React.ReactNode;
  /** @default 'top' */
  placement?: 'top' | 'bottom' | 'left' | 'right';
  style?: React.CSSProperties;
  /** 触发元素 */
  children: React.ReactNode;
}
export declare function Tooltip(props: TooltipProps): JSX.Element;
