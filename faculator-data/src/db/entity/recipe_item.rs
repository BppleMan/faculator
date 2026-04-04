use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "recipe_item")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub item_id: i64,
    pub recipe_id: i64,
    // 输入或输出的流向，1 表示输入，-1 表示输出
    pub flow: i8,
    pub amount: u32,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Item,
    Recipe,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Relation::Item => Entity::belongs_to(super::item::Entity)
                .from(Column::ItemId)
                .to(super::item::Column::Id)
                .into(),
            Relation::Recipe => Entity::belongs_to(super::recipe::Entity)
                .from(Column::RecipeId)
                .to(super::recipe::Column::Id)
                .into(),
        }
    }
}

impl Related<super::item::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Item.def()
    }
}

impl Related<super::recipe::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recipe.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
