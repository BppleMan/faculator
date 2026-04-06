use crate::string_enum;

string_enum! {
    /// 流体箱生产类型。
    ///
    /// 该字段表达的是流体接口在机器上的工作方向，而不是任意说明文本。
    pub enum FluidBoxProductionType {
        /// 只作为输入口。
        ///
        /// 机器只能从该流体箱读取流体。
        Input => "input",

        /// 只作为输出口。
        ///
        /// 机器只能向该流体箱排出流体。
        Output => "output",

        /// 同时承担输入和输出。
        ///
        /// 某些接口会双向参与流体交换。
        InputOutput => "input-output"
    }
}
