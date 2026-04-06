use crate::string_enum;

string_enum! {
    /// 装备类别。
    ///
    /// 该值用于连接：
    ///
    /// - `equipment.equipment_categories[]`
    /// - `equipment_grids.equipment_categories[]`
    ///
    /// 它表达的是“某件装备能装进哪类网格”，不是普通标签文本。
    pub enum EquipmentCategory {
        /// 标准护甲装备类别。
        ///
        /// 绝大多数角色护甲与蜘蛛装备网格都允许这类装备。
        Armor => "armor",

        /// Automatic Train Painter 使用的自定义装备类别。
        ///
        /// 这是导出样本里出现的 mod 注入类别。
        AtpEquipmentCategory => "atp-equipment-category"
    }
}
