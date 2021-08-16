import { Injectable } from '@angular/core';
import TruffleContract from 'truffle-contract';

const Web3 = require('web3');

declare let require: any;
declare let window: any;

const tokenContractAbi = require('../../truffle/build/contracts/Token.json');

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
    return new Promise((resolve, reject) => {
      window.web3.eth.getCoinbase(function(err: any, account: string) {
        if(err === null) {
          window.web3.eth.getBalance(account, function(err: any, balance: string) {
            if(err === null) {
              return resolve(
                {
                  fromAccount: account,
                  balance: window.web3.utils.fromWei(balance, 'ether')
                }
              );
            } else {
              return reject('Error');
            }
          });
        }
      });
    });
  }

  getTotalSupply() {
    let that = this;
    return new Promise((resolve, reject) => {
      let tokenContract = TruffleContract(tokenContractAbi);
      tokenContract.setProvider(that.web3Provider);

      tokenContract.deployed().then(function(instance: any) {
        return instance.totalSupply().then(function(totalSupply: number) {
          return resolve(totalSupply);
        }).catch(function(error: any){
          return reject('Error in getTotalSupply service call');
        });
      });
    })
  }

  private async _getAccount(): Promise<any> {
    if (this.account == null) {
      this.account = await new Promise((resolve, reject) => {
        window.web3.eth.getAccounts((err: any, retAccount: any) => {
          if (retAccount.length > 0) {
            this.account = retAccount[0];
            resolve(this.account);
          } else {
            alert('No accounts found');
            reject('No accounts found');
          }

          if (err != null) {
            alert('Error retrieving account');
            reject('Error retrieving account');
          }
        });
      }) as Promise<any>;
    }
    return Promise.resolve(this.account);
  }

  public async getUserEthBalance(): Promise<any> {
    const account = await this._getAccount();

    return new Promise((resolve, reject) => {
      window.web3.eth.getBalance(account, function(err: any, balance: any) {
        if (!err) {
          const retVal = {
            account: account,
            balance: balance
          };

          resolve(retVal);
        } else {
          reject({account: 'error', balance: 0});
        }
      });
    }) as Promise<any>;
  }
}
