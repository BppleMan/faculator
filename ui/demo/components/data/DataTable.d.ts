/** 数据表格 · 板缝分隔 */
export interface DataTableProps {
  columns: { key: string; title: string; align?: 'left' | 'right' | 'center'; width?: number | string; mono?: boolean; color?: string; render?: (val: any, row: any, i: number) => React.ReactNode }[];
  rows: any[];
  /** 行 key 字段名,缺省用索引 */
  rowKey?: string;
  onRowClick?: (row: any, i: number) => void;
  /** 紧凑行高 */
  dense?: boolean;
  style?: React.CSSProperties;
}
export declare function DataTable(props: DataTableProps): JSX.Element;
