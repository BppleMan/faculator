use std::ops::Index;

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum Quality {
    Normal,
    Uncommon,
    Rare,
    Epic,
    Legendary,
}

impl Quality {
    pub fn as_quality_index(&self) -> usize {
        match self {
            Quality::Normal => 0,
            Quality::Uncommon => 1,
            Quality::Rare => 2,
            Quality::Epic => 3,
            Quality::Legendary => 4,
        }
    }

    pub fn index_of(index: usize) -> Quality {
        match index {
            0 => Quality::Normal,
            1 => Quality::Uncommon,
            2 => Quality::Rare,
            3 => Quality::Epic,
            4 => Quality::Legendary,
            _ => panic!("品质不支持的索引"),
        }
    }

    pub fn is_legendary(&self) -> bool {
        matches!(self, Quality::Legendary)
    }

    pub const ALL_QUALITIES: [Quality; 5] = [
        Quality::Normal,
        Quality::Uncommon,
        Quality::Rare,
        Quality::Epic,
        Quality::Legendary,
    ];

    pub const NON_LEGENDARY_QUALITIES: [Quality; 4] =
        [Quality::Normal, Quality::Uncommon, Quality::Rare, Quality::Epic];
}
