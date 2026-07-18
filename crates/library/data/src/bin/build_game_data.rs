use color_eyre::Result;
use faculator_data::game_data::GameData;

#[tokio::main]
async fn main() -> Result<()> {
    let _ = color_eyre::install();

    let game_data: GameData = serde_json::from_str(include_str!("../../../assets/exported/game-data.json"))?;

    println!("{}", game_data.info()?);

    Ok(())
}
