import { Injectable } from '@angular/core';
import TruffleContract from 'truffle-contract';

const Web3 = require('web3');
const tokenContractAbi = require('../../truffle/build/contracts/Token.json');

declare let window: any;

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  private account: any = null;
  private readonly web3: any;
  private enable: any;
  private web3Provider: any;

  constructor() {
    if (window.ethereum === undefined) {
      alert('Non-Ethereum browser detected. Install MetaMask');
    } else {
      if (typeof window.web3 !== 'undefined') {
        this.web3 = window.web3.currentProvider;
      } else {
        this.web3 = new Web3.providers.HttpProvider('http://localhost:8545');
      }
      console.log('transfer.service :: constructor :: window.ethereum');
      window.web3 = new Web3(window.ethereum);
      console.log('transfer.service :: constructor :: this.web3');
      console.log(this.web3);
      this.enable = this._enableMetaMaskAccount();
    }
  }

  private async _enableMetaMaskAccount(): Promise<any> {
    let enable = false;

    await new Promise((resolve, reject) => {
      enable = window.ethereum.enable();
    });

    return Promise.resolve(enable);
  }

  getAccountInfo() {
    let thisService = this;

    return new Promise((resolve, reject) => {
      window.web3.eth.getCoinbase(function(err: any, account: string) {
        if(err === null) {
          window.web3.eth.getBalance(account, function(err: any, balance: string) {
            if(err === null) {
              thisService.account = account;

              return resolve(
                {
                  fromAccount: account,
                  balance: window.web3.utils.fromWei(balance, 'ether')
                }
              );
            } else {
              console.log(err);
              return reject('Error');
            }
          });
        }
      });
    });
  }

  getTotalSupply() {
    return new Promise((resolve, reject) => {
      let tokenContract = TruffleContract(tokenContractAbi);
      tokenContract.setProvider(this.web3Provider);

      tokenContract.deployed().then(function(instance: any) {
        return instance.totalSupply().then(function(totalSupply: number) {
          return resolve(totalSupply);
        }).catch(function(err: any){
          console.log(err);
          return reject('Error in getTotalSupply service call');
        });
      });
    })
  }

  getBalance() {
    let thisService = this;

    return new Promise((resolve, reject) => {
      let tokenContract = TruffleContract(tokenContractAbi);
      tokenContract.setProvider(this.web3Provider);

      tokenContract.deployed().then(function(instance: any) {
        return instance.balanceOf(thisService.account).then(function(balance: number) {
          return resolve(balance);
        }).catch(function(err: any){
          console.log(err);
          return reject('Error in balanceOf service call');
        });
      });
    })
  }

  transferTokens(recipientAddress: string, amountToTransfer: number) {
    let thisService = this;

    return new Promise((resolve, reject) => {
      let tokenContract = TruffleContract(tokenContractAbi);
      tokenContract.setProvider(this.web3Provider);

      tokenContract.deployed().then(function(instance: any) {
        return instance.transfer(
          recipientAddress,
          amountToTransfer,
          { from: thisService.account }
        ).then(function(response: any) {
          console.log(response)
          return resolve({ success: true });
        }).catch(function(err: any){
          console.log(err);
          return reject('Error in transfer service call');
        });
      });
    })
  }

  isValidAddress(address: string) {
    return window.web3.utils.isAddress(address)
  }
}
