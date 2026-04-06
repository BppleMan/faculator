use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "quality")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub level: u64,

    pub color_r: Decimal,

    pub color_g: Decimal,

    pub color_b: Decimal,

    pub color_a: Decimal,

    pub next: Option<String>,

    pub next_probability: Decimal,

    pub beacon_power_usage_multiplier: Decimal,

    pub mining_drill_resource_drain_multiplier: Decimal,

    pub science_pack_drain_multiplier: Decimal,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
