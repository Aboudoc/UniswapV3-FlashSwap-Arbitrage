const { ethers } = require("hardhat");
const { expect } = require("chai");
require("dotenv").config();

const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const pool0 = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";
const pool1 = "0x8ad599c3A0ff1De082011EFDDc58f1908eb6e6D8";
const fee0 = 500;
const fee1 = 3000;

describe("Arbitrage", function () {
  describe("Flash Swap", function () {
    let accounts, usdc, weth, uniswapV3Arbitrage, fundAmountWeth;

    beforeEach(async function () {
      accounts = await ethers.getSigners();
      fundAmountWeth = 3000n * 10n ** 18n;

      usdc = await ethers.getContractAt("IERC20", USDC);
      weth = await ethers.getContractAt("IWETH", WETH);

      uniswapV3Arbitrage = await ethers.getContractFactory(
        "UniswapV3FlashSwap"
      );

      uniswapV3Arbitrage = await uniswapV3Arbitrage.deploy();
      await uniswapV3Arbitrage.deployed();

      await network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [process.env.WETH_WHALE],
      });

      const wethWhale = await ethers.getSigner(process.env.WETH_WHALE);

      await weth
        .connect(wethWhale)
        .transfer(uniswapV3Arbitrage.address, fundAmountWeth);

      await weth
        .connect(wethWhale)
        .transfer(accounts[0].address, fundAmountWeth);

      wethBalance = await weth.balanceOf(uniswapV3Arbitrage.address);

      console.log(
        "WETH balance for contract",
        ethers.utils.formatEther(wethBalance)
      );
    });

    it("does the arbitrage", async function () {
      const wethAmountIn = 10n * 10n ** 18n;

      const wethBalanceBefore = await weth.balanceOf(
        uniswapV3Arbitrage.address
      );
      const usdcBalanceBefore = await usdc.balanceOf(
        uniswapV3Arbitrage.address
      );

      await weth.approve(uniswapV3Arbitrage.address, wethAmountIn);

      await uniswapV3Arbitrage.flashSwap(pool0, fee1, wethAmountIn);

      const usdcBalanceAfter = await usdc.balanceOf(uniswapV3Arbitrage.address);

      console.log("USDC balance after", usdcBalanceAfter);
    });
  });
});
