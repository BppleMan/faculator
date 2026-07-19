/** 分段切换器(视图切换) */
export interface SegmentedProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Segmented(props: SegmentedProps): JSX.Element;
