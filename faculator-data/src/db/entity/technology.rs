use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "technology")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub name: String,

    pub group_name: String,

    pub subgroup: String,

    pub order: String,

    pub hidden: bool,

    pub essential: bool,

    pub enabled: bool,

    pub visible_when_disabled: bool,

    pub upgrade: bool,

    pub level: u64,

    pub max_level: u64,

    pub research_unit_count: u64,

    pub research_unit_energy: u64,

    pub research_trigger_type: Option<String>,

    pub allows_productivity: bool,

    pub research_unit_count_formula: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
