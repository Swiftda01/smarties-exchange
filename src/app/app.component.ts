import { Component, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay } from 'rxjs/operators';
import { TokenService } from './token.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  segment: String = 'balance';
  transferForm: FormGroup;

  accountAddress: string = '0x0';
  accountEthBalance: string = '0';
  totalSupply: number = 0;
  balance: number = 0;
  percentage: number = 0;

  constructor(
    private observer: BreakpointObserver,
    private formBuilder: FormBuilder,
    private tokenService: TokenService
  ) {
    this.transferForm = formBuilder.group({
      recipientAddress: ['', Validators.required],
      amountToTransfer: ['', Validators.required],
    });
  }

  ngAfterViewInit() {
    this.observer.observe(
      ['(max-width: 800px)']
    ).pipe(
      delay(1)
    ).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });

    this._getTotalSupply();
    this._getAccount();
  }

  openSegment(segmentName: 'balance' | 'transfer') {
    this.segment = segmentName;
  }

  transferTokens() {
    const thisComponent = this;

    const recipientAddress = this.transferForm.value.recipientAddress;
    const amountToTransfer = this.transferForm.value.amountToTransfer;

    if(confirm(`Are you sure to transfer ${amountToTransfer} tokens?`)) {
      thisComponent.tokenService.transferTokens(recipientAddress, amountToTransfer).then(function(totalSupply: any) {
        alert('Transfer sent')
      }).catch(function(error: any) {
        console.log(error);
        alert(error);
      });
    };
  }

  private _getTotalSupply() {
    const thisComponent = this;

    thisComponent.tokenService.getTotalSupply().then(function(totalSupply: any) {
      thisComponent.totalSupply = totalSupply;
    }).catch(function(error: any) {
      console.log(error);
    });
  }

  private _getAccount() {
    const thisComponent = this;

    thisComponent.tokenService.getAccountInfo().then(function(acctInfo: any) {
      thisComponent.accountAddress = thisComponent._shortened(acctInfo.fromAccount);
      thisComponent.accountEthBalance = acctInfo.balance;
      thisComponent._getBalance();
    }).catch(function(error: any) {
      console.log(error);
    });
  };

  private _shortened(address: string) {
    const addressLength = address.length;

    return address.substring(0, 6) + '...' + address.substring(addressLength - 4, addressLength);
  }

  private _getBalance() {
    const thisComponent = this;

    thisComponent.tokenService.getBalance().then(function(balance: any) {
      thisComponent.balance = balance;
      thisComponent._calculatePercentage();
    }).catch(function(error: any) {
      console.log(error);
    });
  }

  private _calculatePercentage() {
    this.percentage = (this.balance / this.totalSupply) * 100;
  }
}
