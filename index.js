import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectBtn = document.getElementById("connectBtn")
const fundBtn = document.getElementById("fundBtn")
const balanceBtn = document.getElementById("balanceBtn")
const withdrawBtn = document.getElementById("withdrawBtn")

connectBtn.onclick = connect
fundBtn.onclick = fund
balanceBtn.onclick = getBalance
withdrawBtn.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (err) {
            console.log(err)
        }
        document.getElementById("connectBtn").innerHTML = "Connected!"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        document.getElementById("connectBtn").innerHTML = "Metamask Required!"
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with: ${ethAmount} ETH...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const txResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })

            await listenForTxToMine(txResponse, provider)
            console.log("Done!")
        } catch (err) {
            console.log(err)
        }
    } else {
        fundBtn.innerHTML = "Metamask Required!"
    }
}

async function withdraw() {
    console.log(`Withdrawing...`)
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const txResponse = await contract.withdraw()
            await listenForTxToMine(txResponse, provider)
        } catch (error) {
            console.log(error)
        }
    } else {
        withdrawBtn.innerHTML = "Metamask Required!"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        try {
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    } else {
        balanceBtn.innerHTML = "Metamask Required!"
    }
}

function listenForTxToMine(txResponse, provider) {
    console.log(`Mining ${txResponse.hash}...`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(txResponse.hash, (txReceipt) => {
                console.log(
                    `Completed with ${txReceipt.confirmations} confirmations`
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}
