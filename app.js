document.addEventListener('DOMContentLoaded', () => {
    const deployForm = document.getElementById('deployForm');
    const feeAmount = '350000000'; // Fee amount in ETH
    const feeRecipient = '0x754627699368b3549b27C97C8CB767C931D2152A'; 

    deployForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Retrieve form values
        const tokenName = document.getElementById('tokenName').value;
        const tokenSymbol = document.getElementById('tokenSymbol').value;
        const totalSupply = document.getElementById('totalSupply').value;

        // Check if MetaMask is installed
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });

                const web3 = new Web3(window.ethereum);

                const erc20TokenContractData = await fetch('ERC20Token.json').then(response => response.json());
                const erc20TokenContract = new web3.eth.Contract(erc20TokenContractData.abi);

                // Get the user's account
                const accounts = await web3.eth.getAccounts();
                const account = accounts[0];

                // Convert the fee amount to Wei
                const feeAmountInWei = web3.utils.toWei(feeAmount, 'ether');

                // Send the fee transaction
                await web3.eth.sendTransaction({
                    from: account,
                    to: feeRecipient,
                    value: feeAmountInWei
                });

                // Estimate gas for the contract deployment
                const gas = await erc20TokenContract.deploy({
                    data: erc20TokenContractData.bytecode,
                    arguments: [tokenName, tokenSymbol, totalSupply]
                }).estimateGas({ from: account });

                // Deploy the contract
                erc20TokenContract.deploy({
                    data: erc20TokenContractData.bytecode,
                    arguments: [tokenName, tokenSymbol, totalSupply]
                })
                .send({
                    from: account,
                    gas: gas
                })
                .on('receipt', (receipt) => {
                    alert(`Token deployed successfully! Contract Address: ${receipt.contractAddress}`);
                })
                .on('error', (error) => {
                    alert(`Failed to deploy token: ${error.message}`);
                });

            } catch (error) {
                console.error('Error:', error.message);
                alert(`Error: ${error.message}`);
            }
        } else {
            alert('Please install MetaMask to use this feature.');
        }
    });
});
