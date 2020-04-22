import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

import { UserInfo, ChildAccount } from "../../model";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { phoneValidator } from "../../utils/validators/phone";

@Component({
  selector: "app-bind-mobile-modal",
  templateUrl: "./bind-mobile-modal.component.html",
  styleUrls: ["./bind-mobile-modal.component.scss"],
})
export class BindMobileModalComponent implements OnInit {
  childAccount: ChildAccount;
  userInfo: UserInfo;
  username: string;
  mobile: string;
  error_msg: string;
  submitted: boolean = false;

  bindMobileForm: FormGroup;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<BindMobileModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.childAccount = new ChildAccount();
  }

  ngOnInit() {
    this.buildForm();
    this.initData();
  }

  buildForm(): void {
    this.bindMobileForm = this.fb.group(
      {
        username: [
          this.childAccount.username,
          Validators.compose([Validators.required]),
        ],
        phone: [
          this.childAccount.phone,
          Validators.compose([Validators.required, phoneValidator()]),
        ],
        department: [
          this.childAccount.department,
          Validators.compose([Validators.required]),
        ],
      },
      {}
    );
  }

  initData() {
    if (!this.data.operation_info) {
      return;
    }

    const { name, phone, position } = this.data.operation_info;
    this.childAccount.username = name;
    this.childAccount.phone = phone;
    this.childAccount.department = position;
  }

  async submit(f) {
    const { userInfo } = this.data;

    this.submitted = true;
    if (!f.valid) {
      return;
    }
    this.submitted = false;
    this.childAccount.username = this.bindMobileForm.value.username;
    this.childAccount.department = this.bindMobileForm.value.department;
    this.childAccount.phone = this.bindMobileForm.value.phone;

    const user_id = userInfo.id;
    const params = JSON.stringify({
      operation_info: {
        name: this.childAccount.username,
        position: this.childAccount.department,
        phone: this.childAccount.phone,
      },
    });
    const res = await this.http
      .post(`${environment.auth_domain}/admin/${user_id}`, params)
      .toPromise()
      .then((result) => {
        this.closeDialog();
      })
      .catch((error) => {
        console.log(error, "update userInfo error");
      });
  }

  closeDialog() {
    this.dialogRef.close("close");
    this.bindMobileForm.reset();
  }

  clear() {
    this.bindMobileForm.reset();
  }
}
