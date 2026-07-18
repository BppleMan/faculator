#[tokio::main]
async fn main() -> color_eyre::Result<()> {
    color_eyre::install()?;
    println!("faculator-app is waiting for the new data read layer and core DDD.");
    Ok(())
}
