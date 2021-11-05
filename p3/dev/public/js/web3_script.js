import ABI from "./abi.js";
const contractAddress = "0x4cb7670a8bd08489315d4ea7f9097cd7983c4e81";
const mainChainId = "4";

const connectBtn = document.querySelector("#connectBtn");
const showWallet = document.querySelector("#showWallet");
const walletEl = document.querySelector("#wallet");
const mintBtn = document.querySelector("#mintBtn");
const tokenList = document.querySelector("#tokenList");

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
    getTokensByOwner();
    toggleView();
}

async function doConnect() {
    try {
        if (ethereum) {
            currentNetwork = ethereum.networkVersion;
            if (currentNetwork !== mainChainId) {
                await switchRinkebyNetwork();
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

async function validateNetwork() {
    if (currentNetwork !== ethereum.networkVersion) {
        await switchRinkebyNetwork();
    }
    return true;
}

async function switchRinkebyNetwork() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x4" }],
        });
    } catch (err) {
        signer = undefined;
        console.error(err);
    }
}

async function getTokensByOwner() {
    const getArrayData = (_bigNumberArray) => {
        const len = _bigNumberArray.length;
        let converted = [];
        converted.push("[");
        for (i = 0; i < len; i++) {
            converted.push(Number(_bigNumberArray[i]));
            converted.push(",");
        }
        converted.pop();
        converted.push("]");
        return converted;
    };
    try {
        const tokens = await contractInstance.tokensOfOwner(ethereum.selectedAddress);
        console.log(tokens);
        // renders here because the data fetch is asynchronous
        if (tokens.length === 0 || tokens === []) {
            tokenList.textContent = "-";
        } else {
            tokenList.textContent = getArrayData(tokens);
        }
    } catch (err) {
        alert(err.message);
    }
}

// HANDLERS

async function mint() {
    try {
        await validateNetwork();
        const trustedInstance = contractInstance.connect(signer);
        const price = await trustedInstance.ETERNITY_PRICE();
        const res = await trustedInstance.mintPublic(1, { value: price });
    } catch (err) {
        alert(err.message);
    }
}

function toggleView() {
    if (connected) {
        connectBtn.disabled = true;
        connectBtn.textContent = "connected";
        walletEl.textContent = wallet.toString();
        showWallet.style.display = "block";
        mintBtn.style.display = "block";
    }
}

// EVENT LISTENERS

connectBtn.addEventListener("click", () => connect());
mintBtn.addEventListener("click", () => mint());
