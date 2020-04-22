import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { UserInfo } from '../../model';
import { ApiAuth } from 'adhoc-api';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  @Output() isShow = new EventEmitter<boolean>();
  email: string;
  ui: UserInfo;
  isRole = false;

  constructor(private authService: AuthService,
    private authApi: ApiAuth,
    private route: Router) { }

  async ngOnInit() {
    this.email = this.authService.getUserEmail();
    let res = await this.authApi.getUserInfo(this.email)

    this.ui = res as UserInfo;
    this.isRole = this.ui.features.find(key => key === 'management') && this.ui.role === 'Owner' ? true : false;
  }

  close() {
    this.isShow.emit(false);
  }

  logout() {
    this.authService.logout();

    this.route.navigate(['/login']);
  }

}
