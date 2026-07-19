/** 凹槽进度条 · 可流动斜纹/分段 */
export interface ProgressBarProps {
  value?: number;
  /** @default 100 */
  max?: number;
  /** @default 'amber' */
  tone?: 'amber' | 'ok' | 'info' | 'danger';
  label?: string;
  /** 右上角显示百分比 @default true */
  showValue?: boolean;
  /** 流动斜纹(进行中) */
  flowing?: boolean;
  /** 分段格数(0=连续) */
  segments?: number;
  /** @default 12 */
  height?: number;
  style?: React.CSSProperties;
}
export declare function ProgressBar(props: ProgressBarProps): JSX.Element;
