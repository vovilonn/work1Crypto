export default [
    { inputs: [], name: "create", outputs: [], stateMutability: "nonpayable", type: "function" },
    {
        inputs: [
            { internalType: "uint256", name: "_id", type: "uint256" },
            { internalType: "uint256", name: "_amount", type: "uint256" },
            { internalType: "uint256", name: "_price", type: "uint256" },
        ],
        name: "createShares",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
];
