import {
  Component,
  OnInit,
  ViewEncapsulation,
  EventEmitter,
  Output,
} from "@angular/core";
import { Router } from "@angular/router";
import { ModalComponent, DialogRef } from "ngx-modialog";
import { DialogPreset } from "ngx-modialog/plugins/vex";
import { User } from "../../model";
import { AuthService } from "../../service/auth.service";
import {
  NgForm,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-password-confirm",
  templateUrl: "./password-confirm.component.html",
  styleUrls: ["./password-confirm.component.scss"],
})
export class PasswordConfirmComponent implements OnInit {
  user: User;
  error_msg: string;
  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private toast: ToastrService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PasswordConfirmComponent>
  ) {
    this.user = new User();
    this.user.username = this.authService.getUser();
  }
  ngOnInit() {}

  close() {
    this.dialogRef.close();
  }

  ok() {
    const dic = this.translate.instant([
      "confirmpwd.pwd",
      "confirmpwd.success",
    ]);
    if (!this.user.password) {
      this.error_msg = dic["confirmpwd.pwd"];
      return;
    }
    this.authService.login(this.user, (res) => {
      if (res.hasOwnProperty("error_code")) {
        this.error_msg = res.reason_display;
      } else {
        this.error_msg = "";
        this.dialogRef.close("true");
        this.toast.success(dic["confirmpwd.success"]);
      }
    });
  }
}

export const PasswordConfirmRouter = {
  path: "password_confirm",
  component: PasswordConfirmComponent,
};
