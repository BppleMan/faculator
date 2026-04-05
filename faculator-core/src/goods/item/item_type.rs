use crate::string_enum;

string_enum! {
    /// 物品原型类型。
    pub enum ItemType {
        /// 弹药（炮弹、子弹、炮台弹匣等）。
        Ammo => "ammo",
        /// 护甲装备。
        Armor => "armor",
        /// 蓝图，可记录并复制建筑布局。
        Blueprint => "blueprint",
        /// 蓝图书，可存放多张蓝图。
        BlueprintBook => "blueprint-book",
        /// 胶囊，使用后触发即时效果（如手榴弹、机器人胶囊）。
        Capsule => "capsule",
        /// 复制粘贴工具，用于复制实体设置。
        CopyPasteTool => "copy-paste-tool",
        /// 拆除规划器，批量标记拆除区域。
        DeconstructionItem => "deconstruction-item",
        /// 枪械武器。
        Gun => "gun",
        /// 普通物品（原料、产物等通用类型）。
        Item => "item",
        /// 携带实体数据的物品（如存储了实体状态的物品）。
        ItemWithEntityData => "item-with-entity-data",
        /// 模块，可插入机器插槽以改变机器属性。
        Module => "module",
        /// 铁路规划器，辅助铺设铁轨。
        RailPlanner => "rail-planner",
        /// 维修包，用于修复受损实体。
        RepairTool => "repair-tool",
        /// 选择工具，在地图上框选实体执行批量操作。
        SelectionTool => "selection-tool",
        /// 太空平台启动包，用于建立初始太空平台。
        SpacePlatformStarterPack => "space-platform-starter-pack",
        /// 蜘蛛机器人遥控器，远程操控蜘蛛机器人。
        SpidertronRemote => "spidertron-remote",
        /// 工具类物品（如斧头、科研工具等）。
        Tool => "tool",
        /// 升级规划器，批量标记实体升级。
        UpgradeItem => "upgrade-item"
    }
}

string_enum! {
    /// Item 原型标志位。
    pub enum ItemFlag {
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
