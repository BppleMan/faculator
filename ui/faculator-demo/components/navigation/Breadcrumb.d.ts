/** 下钻面包屑 · 当前级琥珀框 */
export interface BreadcrumbProps {
  items: { label: React.ReactNode; [k: string]: any }[];
  /** 点击非末级 */
  onNavigate?: (item: any, index: number) => void;
  style?: React.CSSProperties;
}
export declare function Breadcrumb(props: BreadcrumbProps): JSX.Element;
