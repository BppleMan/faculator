use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "machine")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub item_id: i64,
    pub speed: f64,
    // 能耗
    // pub power: f64,
    // 模块槽位
    pub module_slots: u32,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Item,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Self::Item => Entity::belongs_to(super::item::Entity)
                .from(Column::ItemId)
                .to(super::item::Column::Id)
                .into(),
        }
    }
}

impl Related<super::item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Item.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
