use faculator_macros::string_enum;

string_enum! {
	/// 燃料类别边界。
	pub enum FuelCategory {
		/// 化学燃料。
		///
		/// 典型例子是煤炭、固体燃料等常规可燃物。
		Chemical => "chemical",

		/// 食物类燃料。
		///
		/// 该类别通常由生物 / 有机相关内容使用。
		Food => "food",

		/// 聚变燃料。
		///
		/// 用于更高阶的聚变能源体系。
		Fusion => "fusion",

		/// 核燃料。
		///
		/// 典型例子是核燃料棒等高能燃料。
		Nuclear => "nuclear",

		/// 营养类燃料。
		///
		/// 该类别常用于生物生产链中的营养供给。
		Nutrients => "nutrients"
	}
}