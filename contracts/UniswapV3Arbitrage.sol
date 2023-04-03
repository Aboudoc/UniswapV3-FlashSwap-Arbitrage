// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";

import "./interfaces/IERC20.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";

contract UniswapV3FlashSwap {
    ISwapRouter constant router =
        ISwapRouter(0xE592427A0AEce92De3Edee1F18E0157C05861564);

    uint160 internal constant MIN_SQRT_RATIO = 4295128739;
    uint160 internal constant MAX_SQRT_RATIO =
        1461446703485210103287273052203988822378723970342;

    address private constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    address private constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

    IERC20 private constant usdc = IERC20(USDC);
    IERC20 private constant weth = IERC20(WETH);

    function flashSwap(
        address pool0,
        uint24 fee1,
        uint wethAmountIn
    ) external {
        bytes memory data = abi.encode(msg.sender, pool0, fee1);

        IUniswapV3Pool(pool0).swap(
            address(this),
            false,
            int(wethAmountIn),
            MAX_SQRT_RATIO - 1,
            data
        );
    }

    function _swap(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint amountIn
    ) private returns (uint amountOut) {
        IERC20(tokenIn).approve(address(router), amountIn);

        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: tokenIn,
                tokenOut: tokenOut,
                fee: fee,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        amountOut = router.exactInputSingle(params);
    }

    function uniswapV3SwapCallback(
        int amount0,
        int amount1,
        bytes calldata data
    ) external {
        (address caller, address pool0, uint24 fee1) = abi.decode(
            data,
            (address, address, uint24)
        );

        require(msg.sender == address(pool0), "not authorized");

        uint usdcAmountOut = uint(-amount0);
        uint wethAmountIn = uint(amount1);
        uint wethAmountOut = _swap(USDC, WETH, fee1, usdcAmountOut);

        if (wethAmountOut >= wethAmountIn) {
            uint profit = wethAmountOut - wethAmountIn;
            weth.transfer(address(pool0), wethAmountIn);
            weth.transfer(caller, profit);
        } else {
            uint loss = wethAmountIn - wethAmountOut;
            weth.transferFrom(caller, address(this), loss);
            weth.transfer(address(pool0), wethAmountIn);
        }
    }
}
