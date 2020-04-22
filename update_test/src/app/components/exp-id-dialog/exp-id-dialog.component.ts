import { Component, OnInit, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ToastrService } from "ngx-toastr";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-exp-id-dialog",
  templateUrl: "./exp-id-dialog.component.html",
  styleUrls: ["./exp-id-dialog.component.scss"],
})
export class ExpIdDialogComponent implements OnInit {
  thisVersion;
  clientId;

  constructor(
    public dialogRef: MatDialogRef<ExpIdDialogComponent>,
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
