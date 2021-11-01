import ABI from "./abi.js";
const contractAddress = "0xCd8FED47ab8599Da0e15B9fD80fB5d6220b49942";
const mainChainId = "4";

const connectBtn = document.querySelector("#connectBtn");
const showWallet = document.querySelector("#showWallet");
const claimBtn = document.querySelector("#claimBtn");
const receiveBtn = document.querySelector("#receiveBtn");
const walletEl = document.querySelector("#wallet");

const ethereum = window.ethereum;

let wallet;
let contractInstance;
let connected = false;
let signer;
let currentNetwork;
let provider;

//FUNCTIONS

async function connect() {
    if (connected === false) {
        await doConnect();
        connected = true;
        console.log(contractInstance);
    }
    toggleView();
}

async function doConnect() {
    try {
        if (ethereum) {
            currentNetwork = ethereum.networkVersion;
            if (currentNetwork !== mainChainId) {
                await switchEthereumChain();
            }
            // connecting to Metamask
            const res = await ethereum.request({ method: "eth_requestAccounts" });
            wallet = res[0];

            // getting procider and signer
            provider = new ethers.providers.Web3Provider(ethereum);
            signer = provider.getSigner();

            // getting instance of contract
            contractInstance = new ethers.Contract(contractAddress, ABI, signer);
        } else alert("Connect Metamask!");
    } catch (err) {
        console.error(err);
    }
}

async function switchEthereumChain() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x4" }],
        });
    } catch (err) {
        signer = undefined;
        console.error(err);
        // handle other "switch" errors
    }
}

function toggleView() {
    if (connected) {
        connectBtn.disabled = true;
        connectBtn.textContent = "connected";
        walletEl.textContent = wallet.toString();
        showWallet.style.display = "block";
        claimBtn.style.display = "block";
        receiveBtn.style.display = "block";
    }
}

function claim() {
    contractInstance.claim();
}

function receive() {
    contractInstance.receive();
}

// EVENT LISTENERS

connectBtn.addEventListener("click", () => connect());
claimBtn.addEventListener("click", () => claim());
receiveBtn.addEventListener("click", () => receive());
