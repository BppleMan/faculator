/** 图表框架 · 铆钉钢板 + 扫描线屏幕 */
export interface ChartFrameProps {
  title: React.ReactNode;
  /** 右上角英文微标注 */
  tag?: string;
  /** 屏幕区高度 px @default 200 */
  height?: number;
  /** 背景网格 @default true */
  grid?: boolean;
  /** 标题栏右侧工具区 */
  toolbar?: React.ReactNode;
  /** 无 children 时占位文案 */
  placeholder?: string;
  style?: React.CSSProperties;
  /** 实际图表(SVG/canvas)绝对定位铺满 */
  children?: React.ReactNode;
}
export declare function ChartFrame(props: ChartFrameProps): JSX.Element;
