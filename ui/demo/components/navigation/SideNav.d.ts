/** 侧边导航 · 分区 + 琥珀激活线 */
export interface SideNavProps {
  sections: { title?: string; items: { key: string; label: React.ReactNode; icon?: React.ReactNode; meta?: React.ReactNode }[] }[];
  activeKey?: string;
  onSelect?: (key: string, item: any) => void;
  /** @default 220 */
  width?: number | string;
  style?: React.CSSProperties;
}
export declare function SideNav(props: SideNavProps): JSX.Element;
