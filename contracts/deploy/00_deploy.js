require("hardhat-deploy")
require("hardhat-deploy-ethers")

const { networkConfig } = require("../helper-hardhat-config")


const private_key = network.config.accounts[0]
const wallet = new ethers.Wallet(private_key, ethers.provider)

module.exports = async ({ deployments }) => {
    const { deploy } = deployments;
    console.log("Wallet Ethereum Address:", wallet.address)
    const chainId = network.config.chainId
    const tokensToBeMinted = networkConfig[chainId]["tokensToBeMinted"]

    
    const Deployer = await deploy("Deployer", {
        from: wallet.address,
        args: ["604800", "0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E", "0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E", "0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E", "0x840C1b6ce85bBFEbcFAd737514c0097B078a7E7E"],
        log: true,
    });
}