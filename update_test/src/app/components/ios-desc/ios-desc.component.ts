import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-ios-desc',
  templateUrl: './ios-desc.component.html',
  styleUrls: ['./ios-desc.component.scss']
})
export class IosDescComponent implements OnInit {
  @Input() app;
  sdkCode: string;

  constructor(private toastrService: ToastrService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.sdkCode = this.app.app_key;
  }

  clip(e) {
    const txt = this.translate.instant('explist.copy');
    this.toastrService.success(txt);
  }
}
