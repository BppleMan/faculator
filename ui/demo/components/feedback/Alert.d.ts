/** 告警条 · 警示斜纹边 */
export interface AlertProps {
  /** @default 'info' */
  tone?: 'info' | 'ok' | 'warn' | 'danger';
  /** 默认按 tone 取:信息/正常/告警/危险 */
  title?: string;
  /** 右侧操作区(放 Button) */
  action?: React.ReactNode;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
