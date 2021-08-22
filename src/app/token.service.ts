import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import TruffleContract from 'truffle-contract';
import { ToastrService } from 'ngx-toastr';

const Web3 = require('web3');
const tokenContractAbi = require('../../truffle/build/contracts/Token.json');

declare let window: any;

@Injectable({
  providedIn: 'root'
})

export class TokenService {
  private metaMaskChanged = new BehaviorSubject(false);
  private account: any = null;
  private enable: any;
  private web3Provider: any;
  private supportedChainIds: Array<number> = [
    4 // Rinkeby
  ]

  constructor(private toaster: ToastrService) {
    if (window.ethereum === undefined) {
      toaster.warning(
        'Non-Ethereum browser detected. Install MetaMask to use this exchange.'
      );
    } else {
      this.web3Provider = window.ethereum;
      window.web3 = new Web3(this.web3Provider);
      this.enable = this._enableMetaMaskAccount();
    }
  }

  metaMaskHasChanged(): Observable<boolean> {
    return this.metaMaskChanged.asObservable();
  }

  checkIfNetworkIsSupported(): Promise<any> {
    let thisService = this;

    return new Promise((resolve, reject) => {
      window.web3.eth.net.getId().then(function(chainId: number) {
        return resolve(thisService.supportedChainIds.includes(chainId));
      }).catch(function(err: any){
        console.log(err);
        return reject('Error in getChainId service call');
      });
    });
  }

  getAccountInfo(): Promise<any> {
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

  getTotalSupply(): Promise<any> {
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

  getBalance(): Promise<any> {
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

  transferTokens(recipientAddress: string, amountToTransfer: number): Promise<any> {
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

  isValidAddress(address: string): boolean {
    return window.web3.utils.isAddress(address);
  }

  private async _enableMetaMaskAccount(): Promise<any> {
    let thisService = this;
    let enable = false;

    await new Promise((resolve, reject) => {
      window.ethereum.on('accountsChanged', function () {
        thisService.metaMaskChanged.next(true);
      });

      window.ethereum.on('chainChanged', function () {
        thisService.metaMaskChanged.next(true);
      })

      enable = window.ethereum.enable();
    });

    return Promise.resolve(enable);
  }
}
