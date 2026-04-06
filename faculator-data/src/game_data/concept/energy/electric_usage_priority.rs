use crate::string_enum;

string_enum! {
    /// 电力使用优先级。
    ///
    /// 该值决定实体在电网中的取电、供电或缓冲调度顺序。
    pub enum ElectricUsagePriority {
        /// 一级输入优先级。
        ///
        /// 这类设备会优先从电网取电。
        PrimaryInput => "primary-input",

        /// 二级输入优先级。
        ///
        /// 这类设备取电优先级低于 `primary-input`。
        SecondaryInput => "secondary-input",

        /// 二级输出优先级。
        ///
        /// 这类设备会作为较早参与放电的供电方。
        SecondaryOutput => "secondary-output",

        /// 太阳能优先级。
        ///
        /// 这类设备通常代表太阳能发电来源。
        Solar => "solar",

        /// 三层缓冲优先级。
        ///
        /// 典型场景是蓄电器等延后参与网络调度的设备。
        Tertiary => "tertiary",

        /// 受管理蓄电器优先级。
        ///
        /// 这是导出样本里出现的特殊蓄电器调度模式。
        ManagedAccumulator => "managed-accumulator",

        /// 灯具优先级。
        ///
        /// Factorio 原型 API 中存在该优先级标签。
        Lamp => "lamp"
    }
}
