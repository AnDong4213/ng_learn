import { Component, OnInit, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-check-pwd',
  templateUrl: './check-pwd.component.html',
  styleUrls: ['./check-pwd.component.scss']
})
export class CheckPwdComponent implements OnInit, OnChanges {

  len: Boolean = false;
  nu: Boolean = false;
  en: Boolean = false;

  @Input() pwd: string;

  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(map) {

    if (map.pwd.currentValue !== map.pwd.previousValue) {
      this.checkPassword();
    }

  }

  checkPassword() {
    const pwd = this.pwd;
    pwd && /.{8,}/.test(pwd) ? this.len = true : this.len = false;
    pwd && /[\d\W]/.test(pwd) ? this.nu = true : this.nu = false;
    pwd && /[a-zA-Z]+/.test(pwd) ? this.en = true : this.en = false;
  }

}
