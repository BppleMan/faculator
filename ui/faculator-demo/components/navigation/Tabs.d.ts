/** 标签页 · 琥珀底线 */
export interface TabsProps {
  items: { value: string; label: React.ReactNode; count?: number | string }[];
  value?: string;
  onChange?: (value: string) => void;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function Tabs(props: TabsProps): JSX.Element;
