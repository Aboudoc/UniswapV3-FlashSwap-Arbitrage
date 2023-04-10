const { expect } = require("chai");
const { ethers, network } = require("hardhat");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////This can be used to check if transfer from whale is working well//////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

// DAI_WHALE must be an account, not contract
const DAI_WHALE = process.env.DAI_WHALE;
const USDC_WHALE = process.env.USDC_WHALE;

describe("Test unlock accounts", () => {
  let accounts;
  let dai;
  let daiWhale;
  let usdcWhale;
  let usdc;

  before(async () => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    daiWhale = await ethers.getSigner(DAI_WHALE);
    dai = await ethers.getContractAt("IERC20", DAI);

    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    usdcWhale = await ethers.getSigner(USDC_WHALE);
    usdc = await ethers.getContractAt("IERC20", USDC);

    accounts = await ethers.getSigners();
  });

  it("unlock account", async () => {
    const amount = 100n * 10n ** 18n;
    const usdcAmount = 1000n * 10n ** 6n;
    console.log(
      "DAI balance of account BEFORE transfer",
      await dai.balanceOf(accounts[6].address)
    );
    console.log("DAI balance of whale", await dai.balanceOf(DAI_WHALE));

    console.log(
      "USDC balance of account BEFORE transfer",
      await usdc.balanceOf(accounts[6].address)
    );
    console.log("USDC balance of whale", await usdc.balanceOf(USDC_WHALE));

    expect(await dai.balanceOf(DAI_WHALE)).to.gte(amount);

    console.log(
      "----------------------Transfer 100 DAI--------------------------"
    );
    await dai.connect(daiWhale).transfer(accounts[6].address, amount);
    await usdc.connect(usdcWhale).transfer(accounts[6].address, usdcAmount);

    console.log(
      "DAI balance of account",
      await dai.balanceOf(accounts[6].address)
    );
    console.log(
      "DAI balance of whale AFTER transfer",
      await dai.balanceOf(DAI_WHALE)
    );
    console.log(
      "----------------------Transfer 1000 USDC------------------------"
    );

    console.log(
      "USDC balance of account",
      await usdc.balanceOf(accounts[6].address)
    );
    console.log(
      "USDC balance of whale AFTER transfer",
      await usdc.balanceOf(USDC_WHALE)
    );
  });
});
