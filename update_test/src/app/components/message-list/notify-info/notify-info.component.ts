import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  Inject,
} from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ApiAuth } from "adhoc-api";
import { Subject } from "rxjs/";

@Component({
  selector: "app-notify-info",
  templateUrl: "./notify-info.component.html",
  styleUrls: ["./notify-info.component.scss"],
})
export class NotifyInfoComponent implements OnInit {
  notify: any;
  notifys$: Subject<object>;

  @ViewChild("dataContainer") dataContainer: ElementRef;

  constructor(
    private apiAuth: ApiAuth,
    public dialogRef: MatDialogRef<NotifyInfoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit() {
    this.notify = this.data.mes;
    this.notifys$ = this.data.notifys$;
    this.dataContainer.nativeElement.innerHTML = this.notify.message;
  }

  async close(notify) {
    const res = await this.apiAuth.delNotify(notify.id);

    this.notifys$.next(notify);
    this.dialogRef.close();
  }
}
