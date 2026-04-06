use crate::string_enum;

string_enum! {
    /// 研究触发器类型。
    pub enum ResearchTriggerType {
        /// 通过建造某类实体触发研究。
        ///
        /// 导出只给出触发类型，不在本层补充额外参数。
        BuildEntity => "build-entity",

        /// 通过捕获孢子塔 / 刷怪塔触发研究。
        CaptureSpawner => "capture-spawner",

        /// 通过制造某件物品触发研究。
        CraftItem => "craft-item",

        /// 通过创建太空平台触发研究。
        CreateSpacePlatform => "create-space-platform",

        /// 通过开采某类实体触发研究。
        MineEntity => "mine-entity"
    }
}
