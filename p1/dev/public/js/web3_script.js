import ABI from "./abi.js";
const contractAddress = "0xCd8FED47ab8599Da0e15B9fD80fB5d6220b49942";
const mainChainId = "97";

const connectBtn = document.querySelector("#connectBtn");
const showWallet = document.querySelector("#showWallet");
const claimBtn = document.querySelector("#claimBtn");
const receiveBtn = document.querySelector("#receiveBtn");
const walletEl = document.querySelector("#wallet");
const txModal = document.querySelector("#txModal");

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
                await switchBscNetwork();
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
        await switchBscNetwork();
    }
    return true;
}

async function switchBscNetwork() {
    try {
        await ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x61" }],
        });
    } catch (err) {
        signer = undefined;
        console.error(err);
    }
}

// HANDLERS

async function claim() {
    await validateNetwork();
    contractInstance.claim();
}

function openReciveModal() {
    txModal.style.display = "block";

    const handleTransaction = async (e) => {
        const target = e.target;
        console.log(target.id);

        switch (target.id) {
            case "closeModal":
                txModal.removeEventListener("click", handleTransaction);
                txModal.style.display = "none";
                break;
            case "submit": {
                const amount = document.forms.txForm.amount.value;
                if (amount && amount > 0) {
                    await receive(amount);
                    txModal.removeEventListener("click", handleTransaction);
                    txModal.style.display = "none";
                } else {
                    alert("Amount is not valid!");
                }

                break;
            }

            default:
                break;
        }
    };

    txModal.addEventListener("click", handleTransaction);
}

async function receive(amount) {
    try {
        await validateNetwork();
        const transactionParams = {
            to: contractAddress,
            from: ethereum.selectedAddress,
            value: ethers.utils.hexlify(ethers.utils.parseEther(amount.toString())),
        };
        const txHash = await ethereum.request({
            method: "eth_sendTransaction",
            params: [transactionParams],
        });
        alert("txHash: " + txHash);
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
        claimBtn.style.display = "block";
        receiveBtn.style.display = "block";
    }
}

// EVENT LISTENERS

connectBtn.addEventListener("click", () => connect());
claimBtn.addEventListener("click", () => claim());
receiveBtn.addEventListener("click", () => openReciveModal());
