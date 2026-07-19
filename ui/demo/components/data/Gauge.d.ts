/** 刻度仪表盘 · 指针+辉光弧 @startingPoint section="数据件" subtitle="工业仪表盘" viewport="700x200" */
export interface GaugeProps {
  value?: number;
  /** @default 100 */
  max?: number;
  /** 底部微标注 */
  label?: string;
  unit?: string;
  /** 表盘宽度 px @default 120 */
  size?: number;
  /** @default 'amber' */
  tone?: 'amber' | 'ok' | 'info' | 'danger';
  style?: React.CSSProperties;
}
export declare function Gauge(props: GaugeProps): JSX.Element;
