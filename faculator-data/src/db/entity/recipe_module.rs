use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "recipe_module")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub recipe_id: i64,
    pub module_id: i64,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Recipe,
    Module,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Relation::Recipe => Entity::belongs_to(super::recipe::Entity)
                .from(Column::RecipeId)
                .to(super::recipe::Column::Id)
                .into(),
            Relation::Module => Entity::belongs_to(super::module::Entity)
                .from(Column::ModuleId)
                .to(super::module::Column::Id)
                .into(),
        }
    }
}

impl Related<super::recipe::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Recipe.def()
    }
}

impl Related<super::module::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Module.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
