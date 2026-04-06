use crate::string_enum;

string_enum! {
    /// 科技效果类型。
    pub enum TechnologyEffectType {
        /// 提高某类弹药的伤害倍率。
        AmmoDamage => "ammo-damage",

        /// 提高火炮射程。
        ArtilleryRange => "artillery-range",

        /// 提高传送带堆叠大小上限。
        BeltStackSizeBonus => "belt-stack-size-bonus",

        /// 提高批量机械臂容量。
        BulkInserterCapacityBonus => "bulk-inserter-capacity-bonus",

        /// 改变部分配方可获得的生产力效果。
        ///
        /// 当前导出样本中该 effect 没有附加字段，只通过类型表达语义。
        ChangeRecipeProductivity => "change-recipe-productivity",

        /// 提高角色生命值。
        CharacterHealthBonus => "character-health-bonus",

        /// 增加角色背包格数。
        CharacterInventorySlotsBonus => "character-inventory-slots-bonus",

        /// 解锁角色物流请求能力。
        CharacterLogisticRequests => "character-logistic-requests",

        /// 增加角色物流垃圾位数量。
        CharacterLogisticTrashSlots => "character-logistic-trash-slots",

        /// 提高角色手工采矿速度。
        CharacterMiningSpeed => "character-mining-speed",

        /// 解锁悬崖拆除能力。
        CliffDeconstructionEnabled => "cliff-deconstruction-enabled",

        /// 允许实体死亡时创建幽灵。
        CreateGhostOnEntityDeath => "create-ghost-on-entity-death",

        /// 提高某类枪械的射速。
        GunSpeed => "gun-speed",

        /// 提高机械臂堆叠手容量。
        InserterStackSizeBonus => "inserter-stack-size-bonus",

        /// 提高实验室生产力。
        LaboratoryProductivity => "laboratory-productivity",

        /// 提高实验室研究速度。
        LaboratorySpeed => "laboratory-speed",

        /// 增加可跟随机器人数上限。
        MaximumFollowingRobotsCount => "maximum-following-robots-count",

        /// 提高矿机生产率。
        MiningDrillProductivityBonus => "mining-drill-productivity-bonus",

        /// 解锁流体采矿能力。
        MiningWithFluid => "mining-with-fluid",

        /// 允许铁路规划器铺设高架轨道。
        RailPlannerAllowElevatedRails => "rail-planner-allow-elevated-rails",

        /// 允许在深海油洋上放置轨道支撑。
        RailSupportOnDeepOilOcean => "rail-support-on-deep-oil-ocean",

        /// 提高列车制动力。
        TrainBrakingForceBonus => "train-braking-force-bonus",

        /// 提高炮塔攻击能力。
        TurretAttack => "turret-attack",

        /// 解锁电路网络能力。
        UnlockCircuitNetwork => "unlock-circuit-network",

        /// 解锁更高品质等级。
        UnlockQuality => "unlock-quality",

        /// 解锁某个配方。
        UnlockRecipe => "unlock-recipe",

        /// 解锁某个空间地点。
        UnlockSpaceLocation => "unlock-space-location",

        /// 解锁太空平台能力。
        UnlockSpacePlatforms => "unlock-space-platforms",

        /// 解锁载具物流能力。
        VehicleLogistics => "vehicle-logistics",

        /// 提高物流 / 建造机器人的移动速度。
        WorkerRobotSpeed => "worker-robot-speed",

        /// 提高物流 / 建造机器人的载货量。
        WorkerRobotStorage => "worker-robot-storage"
    }
}
