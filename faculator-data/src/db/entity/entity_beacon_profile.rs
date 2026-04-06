use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "entity_beacon_profile")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub entity_name: String,

    #[sea_orm(primary_key, auto_increment = false)]
    pub quality_index: u64,

    pub effectivity: Decimal,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
