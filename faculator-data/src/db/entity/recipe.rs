use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, DeriveEntityModel)]
#[sea_orm(table_name = "recipe")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i64,
    pub name: String,
    pub machine_id: i64,
    pub time: f64,
}

#[derive(Copy, Clone, Debug, EnumIter)]
pub enum Relation {
    Machine,
}

impl RelationTrait for Relation {
    fn def(&self) -> RelationDef {
        match self {
            Relation::Machine => Entity::belongs_to(super::machine::Entity)
                .from(Column::MachineId)
                .to(super::machine::Column::Id)
                .into(),
        }
    }
}

impl Related<super::machine::Entity> for Entity {
    fn to() -> RelationDef {
        Relation::Machine.def()
    }
}

impl ActiveModelBehavior for ActiveModel {}
