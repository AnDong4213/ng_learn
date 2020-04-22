import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-applet-desc',
  templateUrl: './applet-desc.component.html',
  styleUrls: ['./applet-desc.component.scss']
})
export class AppletDescComponent implements OnInit {
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
