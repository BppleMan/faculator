use crate::string_enum;

string_enum! {
    /// 装备原型类型。
    pub enum EquipmentType {
        /// 主动防御装备。
        ///
        /// 这类装备通常会主动发射攻击或防御效果，例如个人激光防御。
        ActiveDefense => "active-defense-equipment",

        /// 电池装备。
        ///
        /// 这类装备为装甲网格提供额外电量缓存。
        Battery => "battery-equipment",

        /// 传送带免疫装备。
        ///
        /// 安装后角色不再被传送带推走。
        BeltImmunity => "belt-immunity-equipment",

        /// 能量护盾装备。
        ///
        /// 这类装备将装甲电力转化为护盾值。
        EnergyShield => "energy-shield-equipment",

        /// 装备幽灵。
        ///
        /// 这是占位型原型，用于表示尚未真正安装完成的装备。
        EquipmentGhost => "equipment-ghost",

        /// 发电装备。
        ///
        /// 这类装备持续向装甲网格提供电力。
        Generator => "generator-equipment",

        /// 背包容量加成装备。
        ///
        /// 这类装备会直接增加角色的物品栏容量。
        InventoryBonus => "inventory-bonus-equipment",

        /// 移动速度加成装备。
        ///
        /// 典型例子是外骨骼，会提升角色移动速度。
        MovementBonus => "movement-bonus-equipment",

        /// 夜视装备。
        ///
        /// 安装后角色在夜间或低光环境中获得更高可见度。
        NightVision => "night-vision-equipment",

        /// 机器人港装备。
        ///
        /// 安装后角色携带个人物流 / 建造机器人港能力。
        Roboport => "roboport-equipment",

        /// 太阳能板装备。
        ///
        /// 这类装备在装甲网格中提供被动太阳能发电。
        SolarPanel => "solar-panel-equipment"
    }
}
