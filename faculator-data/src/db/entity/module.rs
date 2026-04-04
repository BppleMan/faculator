use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "module")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub item_id: i64,
    pub production_bonus: f64,
    pub speed_bonus: f64,
    pub power_bonus: f64,
    pub quality_bonus: f64,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Item,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Relation::Item => Entity::belongs_to(super::item::Entity)
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
