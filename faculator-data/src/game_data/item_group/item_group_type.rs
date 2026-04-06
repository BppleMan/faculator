use crate::string_enum;

string_enum! {
    /// item-group 原型类型。
    pub enum ItemGroupType {
        /// 表示一个顶层物品分组。
        ///
        /// 当前导出样本中该集合的 `type` 固定为 `item-group`。
        ItemGroup => "item-group"
    }
}
