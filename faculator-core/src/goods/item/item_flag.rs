use std::collections::BTreeSet;

use faculator_macros::string_enum;
use serde::{Deserialize, Serialize};

string_enum! {
    /// faculator 当前支持的物品标志位边界。
    pub enum ItemFlag {
        /// 总是显示该物品。
        ///
        /// 即使常规展示逻辑会隐藏它，UI 也应显式呈现。
        AlwaysShow => "always-show",

        /// 在物品上绘制物流网络覆盖层图标。
        DrawLogisticOverlay => "draw-logistic-overlay",

        /// 物品不会被自动归入未请求垃圾桶。
        ExcludedFromTrashUnrequested => "excluded-from-trash-unrequested",

        /// 在加成统计 GUI 中隐藏该物品。
        HideFromBonusGui => "hide-from-bonus-gui",

        /// 物品不可在同一格子中堆叠。
        NotStackable => "not-stackable",

        /// 物品只能存在于光标中，不能放入容器。
        OnlyInCursor => "only-in-cursor",

        /// 物品可通过控制台命令直接生成。
        Spawnable => "spawnable",

        /// 标记该物品为腐烂后的产物。
        SpoilResult => "spoil-result"
    }
}

/// 物品标志位集合。
///
/// 这里使用 `BTreeSet` 而不是位掩码，避免把 core 边界和固定整数位宽绑定在一起。
#[derive(Default, Debug, Clone, PartialEq, Eq)]
#[derive(Serialize, Deserialize)]
pub struct ItemFlagSet(BTreeSet<ItemFlag>);

impl ItemFlagSet {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn has_flag(&self, flag: ItemFlag) -> bool {
        self.0.contains(&flag)
    }

    pub fn insert(&mut self, flag: ItemFlag) {
        self.0.insert(flag);
    }

    pub fn len(&self) -> usize {
        self.0.len()
    }

    pub fn is_empty(&self) -> bool {
        self.0.is_empty()
    }

    pub fn iter(&self) -> impl Iterator<Item = &ItemFlag> {
        self.0.iter()
    }
}

impl FromIterator<ItemFlag> for ItemFlagSet {
    fn from_iter<T: IntoIterator<Item = ItemFlag>>(iter: T) -> Self {
        Self(iter.into_iter().collect())
    }
}