/** 切角下拉选择器 */
export interface SelectProps {
  label?: string;
  options: { value: string; label: string }[];
  value?: string;
  onChange?: (value: string) => void;
  /** @default '请选择' */
  placeholder?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
