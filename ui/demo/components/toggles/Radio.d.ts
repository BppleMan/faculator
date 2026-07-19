/** 状态灯式单选(圆形是系统里唯一的圆) */
export interface RadioProps {
  checked?: boolean;
  onChange?: (checked: true) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Radio(props: RadioProps): JSX.Element;
