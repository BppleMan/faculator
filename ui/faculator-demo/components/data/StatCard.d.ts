/** 数值卡 · 等宽大数字 */
export interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  /** 数值颜色 @default 'default' */
  tone?: 'default' | 'amber' | 'ok' | 'info' | 'danger';
  /** 变化量,如 '+12%';以 - 开头自动红色 */
  delta?: string;
  deltaTone?: 'ok' | 'danger' | 'info' | 'amber';
  /** 底部小字说明 */
  hint?: string;
  style?: React.CSSProperties;
}
export declare function StatCard(props: StatCardProps): JSX.Element;
