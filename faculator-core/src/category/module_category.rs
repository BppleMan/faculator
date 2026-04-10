use faculator_macros::string_enum;

string_enum! {
	/// 模块类别边界。
	pub enum ModuleCategory {
		/// 效率模块类别。
		///
		/// 这类模块通常降低能耗或资源消耗。
		Efficiency => "efficiency",

		/// 生产力模块类别。
		///
		/// 这类模块通常提高单位输入产出效率。
		Productivity => "productivity",

		/// 品质模块类别。
		///
		/// 这类模块影响产物生成更高品质的概率。
		Quality => "quality",

		/// 速度模块类别。
		///
		/// 这类模块提高机器运行速度。
		Speed => "speed"
	}
}