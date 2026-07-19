/** 机械步进数值框 · −/+ 钢面按钮 */
export interface NumberFieldProps {
  label?: string;
  value: number;
  onChange?: (next: number) => void;
  min?: number;
  max?: number;
  /** @default 1 */
  step?: number;
  /** 单位,如 '/min' */
  unit?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}
export declare function NumberField(props: NumberFieldProps): JSX.Element;
