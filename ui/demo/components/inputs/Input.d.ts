/** 凹槽输入框 · 聚焦琥珀辉光 */
export interface InputProps {
  /** 顶部微标注(自动全大写宽字距样式) */
  label?: string;
  /** @default 'md' */
  size?: 'sm' | 'md';
  /** 错误态:红边红字 */
  error?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  /** 数值输入用等宽字体 */
  mono?: boolean;
  /** 其余属性透传给 <input>(value/onChange/placeholder 等) */
  [inputProp: string]: any;
}
export declare function Input(props: InputProps): JSX.Element;
