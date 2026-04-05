use crate::string_enum;

string_enum! {
    /// 可导出实体类型，与 Constants.EXPORTABLE_ENTITY_TYPES 白名单对应。
    pub enum EntityType {
        AssemblingMachine  => "assembling-machine",
        Furnace            => "furnace",
        RocketSilo         => "rocket-silo",
        MiningDrill        => "mining-drill",
        OffshorePump       => "offshore-pump",
        Boiler             => "boiler",
        BurnerGenerator    => "burner-generator",
        Generator          => "generator",
        FusionGenerator    => "fusion-generator",
        Reactor            => "reactor",
        FusionReactor      => "fusion-reactor",
        SolarPanel         => "solar-panel",
        Accumulator        => "accumulator",
        Beacon             => "beacon",
        Lab                => "lab",
        AgriculturalTower  => "agricultural-tower",
        CargoLandingPad    => "cargo-landing-pad",
        SpacePlatformHub   => "space-platform-hub"
    }
}

string_enum! {
    /// 锅炉工作模式。
    pub enum BoilerMode {
        HeatWaterInside      => "heat-water-inside",
        OutputToSeparatePipe => "output-to-separate-pipe"
    }
}

string_enum! {
    /// 效果分享塔计数模式。
    pub enum BeaconCounter {
        Total    => "total",
        SameType => "same-type"
    }
}
