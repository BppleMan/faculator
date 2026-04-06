use crate::string_enum;

string_enum! {
    /// 物品原型类型。
    pub enum ItemType {
        /// 弹药。
        ///
        /// 例如子弹、炮弹、火箭弹等可由武器或炮塔消耗的物品。
        Ammo => "ammo",

        /// 护甲。
        ///
        /// 这类物品通常可装备在角色身上，并提供装备网格。
        Armor => "armor",

        /// 单张蓝图。
        ///
        /// 用于记录和复制建筑布局。
        Blueprint => "blueprint",

        /// 蓝图书。
        ///
        /// 用于收纳多张蓝图并成组管理。
        BlueprintBook => "blueprint-book",

        /// 胶囊类物品。
        ///
        /// 例如手雷、机器人胶囊等一次性触发效果物品。
        Capsule => "capsule",

        /// 复制粘贴工具。
        ///
        /// 用于复制实体设置并粘贴到其他实体上。
        CopyPasteTool => "copy-paste-tool",

        /// 拆除规划器。
        ///
        /// 用于批量标记地图上的实体和地块进行拆除。
        DeconstructionItem => "deconstruction-item",

        /// 枪械武器。
        ///
        /// 例如手枪、霰弹枪、火焰喷射器等。
        Gun => "gun",

        /// 普通物品。
        ///
        /// 这是最常见的通用原型类型，用于原料、产物和大多数建筑物品。
        Item => "item",

        /// 携带实体数据的物品。
        ///
        /// 表示物品在背包中同时携带了额外的实体状态数据。
        ItemWithEntityData => "item-with-entity-data",

        /// 模块。
        ///
        /// 可插入机器或 Beacon，用来改变速度、能耗、生产力等属性。
        Module => "module",

        /// 铁路规划器。
        ///
        /// 用于辅助玩家连续铺设铁轨。
        RailPlanner => "rail-planner",

        /// 维修工具。
        ///
        /// 例如修理包，用于修复受损实体。
        RepairTool => "repair-tool",

        /// 选择工具。
        ///
        /// 用于框选区域并对实体应用批量操作。
        SelectionTool => "selection-tool",

        /// 太空平台启动包。
        ///
        /// 用于建立初始太空平台。
        SpacePlatformStarterPack => "space-platform-starter-pack",

        /// 蜘蛛机器人遥控器。
        ///
        /// 用于远程控制蜘蛛机器人。
        SpidertronRemote => "spidertron-remote",

        /// 工具类物品。
        ///
        /// 常见于科研包或特殊用途物品。
        Tool => "tool",

        /// 升级规划器。
        ///
        /// 用于批量标记实体升级。
        UpgradeItem => "upgrade-item"
    }
}

string_enum! {
    /// Item 原型标志位。
    pub enum ItemFlag {
        /// 总是显示该物品。
        ///
        /// 即使常规展示逻辑会隐藏它，UI 也应显式呈现。
        AlwaysShow => "always-show",

        /// 在物品上绘制物流网络覆盖层图标。
        DrawLogisticOverlay => "draw-logistic-overlay",

        /// 物品不会被自动归入未请求垃圾桶。
        ExcludedFromTrashUnrequested => "excluded-from-trash-unrequested",

        /// 在加成统计 GUI 中隐藏该物品。
        HideFromBonusGui => "hide-from-bonus-gui",

        /// 物品不可在同一格子中堆叠。
        NotStackable => "not-stackable",

        /// 物品只能存在于光标中，不能放入容器。
        OnlyInCursor => "only-in-cursor",

        /// 物品可通过控制台命令直接生成。
        Spawnable => "spawnable",

        /// 标记该物品为腐烂后的产物。
        SpoilResult => "spoil-result"
    }
}
