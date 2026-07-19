/** 状态徽章 · 状态灯+切角 */
export interface BadgeProps {
  /** @default 'neutral' */
  tone?: 'ok' | 'info' | 'warn' | 'danger' | 'neutral';
  /** 显示状态灯圆点 @default true */
  lamp?: boolean;
  /** 状态灯呼吸闪烁 */
  blink?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
