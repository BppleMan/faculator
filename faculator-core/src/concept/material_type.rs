use faculator_macros::string_enum;

string_enum! {
    /// 物料类型边界。
    pub enum MaterialType {
        /// 物品型物料。
        ///
        /// `name` 应当到 `items.name` 中解析。
        Item => "item",

        /// 流体型物料。
        ///
        /// `name` 应当到 `fluids.name` 中解析。
        Fluid => "fluid"
    }
}
