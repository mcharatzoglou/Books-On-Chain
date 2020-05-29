var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "menu present vital hero wage join dawn metal enforce umbrella voice attitude";

module.exports = {
 networks: {
  ropsten: {
      provider: function() { 
       return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/v3/3d2fb3e53a8d474f9144a1c3d4eed829");
      },
      network_id: "*",
      gas: 4500000,
      gasPrice: 10000000000,
  }
 }
};