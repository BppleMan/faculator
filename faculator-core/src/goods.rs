mod fluid;
mod item;

pub use fluid::*;
pub use item::*;

enum Goods {
    Item(Item),
    Fluid(Fluid),
}
