import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-devtest-cp-id-dialog",
  templateUrl: "./devtest-cp-id-dialog.component.html",
  styleUrls: ["./devtest-cp-id-dialog.component.scss"],
})
export class DevtestCpIdDialogComponent implements OnInit {
  thisVersion;
  clientId;

  constructor(
    public dialogRef: MatDialogRef<DevtestCpIdDialogComponent>,
    private translate: TranslateService,
    private toastrService: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.thisVersion = this.data.thisVersion;
    this.clientId = this.data.thisClientId;
  }

  close() {
    this.dialogRef.close();
  }

  clip() {
    const txt = this.translate.instant("sdkcfg.copy");
    this.toastrService.success(txt);
  }
}
