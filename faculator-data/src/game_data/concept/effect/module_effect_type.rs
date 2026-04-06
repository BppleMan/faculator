use crate::string_enum;

string_enum! {
    /// 模块效果类型。
    ///
    /// 这组标签会同时出现在：
    ///
    /// - `items.module_effects` 的效果键
    /// - `entities.allowed_effects`
    /// - `recipes.allowed_effects`
    ///
    /// 因此它不是普通字符串，而是一组稳定的效果语义标签。
    pub enum ModuleEffectType {
        /// 能耗效果。
        ///
        /// 该效果会提高或降低机器运行时的能量消耗。
        Consumption => "consumption",

        /// 速度效果。
        ///
        /// 该效果会提高或降低机器执行配方、研究或采矿的速度。
        Speed => "speed",

        /// 生产力效果。
        ///
        /// 该效果会改变单位输入可获得的有效输出。
        Productivity => "productivity",

        /// 污染效果。
        ///
        /// 该效果会提高或降低机器运行时造成的污染排放。
        Pollution => "pollution",

        /// 品质效果。
        ///
        /// 该效果会改变产物升级到更高品质的概率。
        Quality => "quality"
    }
}
