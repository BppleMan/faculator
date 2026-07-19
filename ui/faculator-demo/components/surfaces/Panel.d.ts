/** 铆钉钢板面板 @startingPoint section="容器" subtitle="铆钉钢板面板" viewport="700x220" */
export interface PanelProps {
  title?: React.ReactNode;
  /** 右上英文微标注 */
  tag?: string;
  /** 四角铆钉 @default true */
  rivets?: boolean;
  /** 大切角轮廓(会裁掉铆钉角,二选一) */
  chamfer?: boolean;
  /** 标题栏右侧工具区 */
  toolbar?: React.ReactNode;
  /** @default '12px 16px' */
  padding?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Panel(props: PanelProps): JSX.Element;
