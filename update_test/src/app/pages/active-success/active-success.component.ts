import { Component, OnInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';

import { ApiAuth } from 'adhoc-api';

@Component({
  selector: 'app-active-success',
  templateUrl: './active-success.component.html',
  styleUrls: ['./active-success.component.scss']
})
export class ActiveSuccessComponent implements OnInit {
  s: number = 3;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private apiAuth: ApiAuth) { }

  async ngOnInit() {
    const code = this.route.snapshot.params['code'];
    const email = this.route.snapshot.params['email'];
    const res = await this.apiAuth.active(email, code)

    const data = res;
    this.begin(() => {
      this.router.navigate(['/login']);
    });

  }

  begin(callback) {
    setTimeout(() => {
      --this.s;
      if (this.s > 0) {
        return this.begin(callback);
      } else {
        return callback();
      }
    }, 1000);
  }

}


export const ActiveSuccessRouter = {
  path: 'active/:code/:email',
  component: ActiveSuccessComponent
}
