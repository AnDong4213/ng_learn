import { Component, OnInit, Input } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-h5-desc',
  templateUrl: './h5-desc.component.html',
  styleUrls: ['./h5-desc.component.scss']
})
export class H5DescComponent implements OnInit {
  @Input() app;
  sdkCode: string;

  constructor(private toastrService: ToastrService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.sdkCode =
      `<script src="https://sdk.appadhoc.com/ab.plus.js" charset="utf-8"></script>
    <script>
    adhoc('init', {
      appKey: '${this.app.app_key}'
    })
    </script>`;
  }

  clip(e) {
    const txt = this.translate.instant('explist.copy');
    this.toastrService.success(txt);
  }

}
