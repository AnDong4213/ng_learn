import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { ApiAuth } from "adhoc-api";
import { NotifyInfoComponent } from "./notify-info/notify-info.component";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";

import { Subject, Observable } from "rxjs";
import {
  VEXBuiltInThemes,
  Modal,
  DialogPreset,
  DialogFormModal,
  DialogPresetBuilder,
  VEXModalContext,
  vexV3Mode,
  providers,
} from "ngx-modialog/plugins/vex";

@Component({
  selector: "app-message-list",
  templateUrl: "./message-list.component.html",
  styleUrls: ["./message-list.component.scss"],
})
export class MessageListComponent implements OnInit {
  @Output() isShow = new EventEmitter<boolean>();
  @Output() redPoint = new EventEmitter<boolean>();
  notifys: Array<object>;
  curNotify = {};
  isLoading = true;
  isHasNotify: boolean;
  notifys$: Subject<object>;

  constructor(
    private apiAuth: ApiAuth,
    public modal: Modal,
    private translate: TranslateService,
    public dialog: MatDialog
  ) {
    this.notifys = new Array<object>();

    this.notifys$ = new Subject<object>();
    this.notifys$.subscribe((notifys) => {
      const index = this.notifys.indexOf(notifys);
      if (index > -1) {
        this.notifys.splice(index, 1);
      }
    });
  }

  async ngOnInit() {
    const res = await this.apiAuth.getNotify();

    this.notifys = res.reverse();
    this.isLoading = false;
    this.notifys.length > 0
      ? (this.isHasNotify = true)
      : (this.isHasNotify = false);
  }

  openDialog(mes) {
    const dialogRef = this.dialog.open(NotifyInfoComponent, {
      data: { mes, notifys$: this.notifys$ },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (this.notifys.length === 0) {
        this.redPoint.emit(false);
      }
    });
  }

  delAllConfirm() {
    const dic = this.translate.instant([
      "message.del",
      "modal.cancel",
      "modal.ok",
    ]);
    this.modal
      .confirm()
      .message(dic["message.del"])
      .cancelBtn(dic["modal.cancel"])
      .okBtn(dic["modal.ok"])
      .showCloseButton(true)
      .open()
      .then((resultPromise) => {
        return resultPromise.result.then(
          (r) => {
            this.delAll();
          },
          (err) => {}
        );
      });
  }

  delAll() {
    this.notifys.filter(async (n) => {
      const res = await this.apiAuth.delNotify(n["id"]);
      this.notifys$.next(n);
    });
    this.redPoint.emit(false);
  }

  close() {
    this.isShow.emit(false);
  }
}
