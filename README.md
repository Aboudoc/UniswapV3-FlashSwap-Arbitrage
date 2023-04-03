# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

Try running some of the following tasks:

```shell
npm init -y
npm add --save-dev hardhat
npm add @uniswap/v3-periphery
npm add @uniswap/v3-core
npm add --save-dev dotenv

```

Arbitrage between USDC/ETH 0.3% fee pool and USDC/ETH 0.05% fee pool.

For this challenge, we will

Borrow USDC from one pool
Swap USDC back to WETH in another pool
Repay first pool with WETH
If the amount of WETH bought back in step 2 is greater than the amount repaid in step 3, then there is profit from the the arbitrage. Otherwise there was a loss.
