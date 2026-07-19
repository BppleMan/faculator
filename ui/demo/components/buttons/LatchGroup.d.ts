/** 磁带机式锁定键组:按下不回弹、互斥;按另一键原键自动弹起 */
export interface LatchGroupProps {
  options: { value: string; label?: React.ReactNode; icon?: React.ReactNode; title?: string }[];
  /** 当前锁定键;null 表示全部弹起 */
  value?: string | null;
  onChange?: (value: string | null) => void;
  /** 再按已锁定键可弹起(value 置 null) @default false */
  allowRelease?: boolean;
  /** @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function LatchGroup(props: LatchGroupProps): JSX.Element;
