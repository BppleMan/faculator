use crate::string_enum;

string_enum! {
    /// 星球 / 地表属性类型。
    ///
    /// 这组标签会同时出现在：
    ///
    /// - `recipes.surface_conditions[].property`
    /// - `entities.surface_conditions[].property`
    /// - `space_locations.surface_properties` 的字段语义中
    pub enum SurfaceProperty {
        /// 昼夜循环长度。
        ///
        /// 通常用于描述一天有多少 tick。
        DayNightCycle => "day-night-cycle",

        /// 磁场强度。
        ///
        /// 太空与行星环境会用它描述电磁相关环境强弱。
        MagneticField => "magnetic-field",

        /// 太阳能倍率。
        ///
        /// 用来描述该地表环境下太阳能设备的有效表现。
        SolarPower => "solar-power",

        /// 气压。
        ///
        /// 常用于限制某些配方或建筑只能在特定气压范围内工作。
        Pressure => "pressure",

        /// 重力。
        ///
        /// 常用于限制某些配方或建筑只能在特定重力范围内工作。
        Gravity => "gravity"
    }
}
