use crate::string_enum;

string_enum! {
    /// 可导出实体类型，与导出器允许输出的实体白名单对应。
    pub enum EntityType {
        /// 组装机。
        ///
        /// 用于执行大多数常规制造配方。
        AssemblingMachine => "assembling-machine",

        /// 炉子。
        ///
        /// 主要用于熔炼类配方。
        Furnace => "furnace",

        /// 火箭发射井。
        ///
        /// 负责火箭构建与发射相关流程。
        RocketSilo => "rocket-silo",

        /// 采矿机。
        ///
        /// 可从资源点持续提取矿物或流体。
        MiningDrill => "mining-drill",

        /// 海上泵。
        ///
        /// 直接从水体等环境中抽取流体。
        OffshorePump => "offshore-pump",

        /// 锅炉。
        ///
        /// 通过燃料或流体热源把输入流体加热到目标温度。
        Boiler => "boiler",

        /// 燃烧发电机。
        ///
        /// 通过燃烧燃料持续输出电力。
        BurnerGenerator => "burner-generator",

        /// 常规发电机。
        ///
        /// 典型例子是蒸汽机和汽轮机。
        Generator => "generator",

        /// 聚变发电机。
        ///
        /// 使用聚变相关能量链路产电。
        FusionGenerator => "fusion-generator",

        /// 核反应堆。
        ///
        /// 通过反应堆邻接和热能系统工作。
        Reactor => "reactor",

        /// 聚变反应堆。
        ///
        /// 对应聚变能源体系中的核心发热设备。
        FusionReactor => "fusion-reactor",

        /// 太阳能板。
        ///
        /// 在白天或特定环境下被动产电。
        SolarPanel => "solar-panel",

        /// 蓄电器。
        ///
        /// 用于存储和释放电力。
        Accumulator => "accumulator",

        /// Beacon。
        ///
        /// 向周围机器分发模块效果。
        Beacon => "beacon",

        /// 实验室。
        ///
        /// 消耗科技包推进研究。
        Lab => "lab",

        /// 农业塔。
        ///
        /// 处理种植、收获等农业行为。
        AgriculturalTower => "agricultural-tower",

        /// 货运着陆平台。
        ///
        /// 负责太空物流中的货物接收与投放。
        CargoLandingPad => "cargo-landing-pad",

        /// 太空平台枢纽。
        ///
        /// 代表太空平台系统中的核心实体。
        SpacePlatformHub => "space-platform-hub"
    }
}

string_enum! {
    /// 锅炉工作模式。
    pub enum BoilerMode {
        /// 在锅炉内部直接加热水并输出。
        HeatWaterInside => "heat-water-inside",

        /// 将加热结果输出到独立管道。
        OutputToSeparatePipe => "output-to-separate-pipe"
    }
}

string_enum! {
    /// Beacon 计数模式。
    pub enum BeaconCounter {
        /// 统计范围内所有 Beacon 的影响。
        Total => "total",

        /// 只按同类型 Beacon 计数。
        SameType => "same-type"
    }
}
