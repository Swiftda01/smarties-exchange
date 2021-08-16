import { Component, ViewChild } from '@angular/core';
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
  segment: String = 'transfer';

  accountAddress: string = '0x0';
  accountEthBalance: string = '0';
  totalSupply: number = 0;

  constructor(private observer: BreakpointObserver, private tokenService: TokenService) {}

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

    this._getAccount();
    this._getTotalSupply();
  }

  openSegment(segmentName: 'transfer' | 'balance' | 'info') {
    this.segment = segmentName;
  }

  private _getAccount() {
    const thisComponent = this;

    thisComponent.tokenService.getAccountInfo().then(function(acctInfo: any) {
      thisComponent.accountAddress = thisComponent._shortened(acctInfo.fromAccount);
      thisComponent.accountEthBalance = acctInfo.balance;
    }).catch(function(error: any) {
      console.log(error);
    });
  };

  private _shortened(address: string) {
    const addressLength = address.length;

    return address.substring(0, 6) + '...' + address.substring(addressLength - 4, addressLength);
  }

  private _getTotalSupply() {
    const thisComponent = this;

    thisComponent.tokenService.getTotalSupply().then(function(totalSupply: any) {
      thisComponent.totalSupply = totalSupply;
    }).catch(function(error: any) {
      console.log(error);
    });
  }
}
