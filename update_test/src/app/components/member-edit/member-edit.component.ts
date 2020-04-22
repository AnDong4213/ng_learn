import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  Inject,
} from "@angular/core";
import { emailValidator } from "../../utils/validators/email";
import {
  NgForm,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ApiAuth } from "adhoc-api";
import { App, UserRole } from "../../model";
import { ToastrService } from "ngx-toastr";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-member-edit",
  templateUrl: "./member-edit.component.html",
  styleUrls: ["./member-edit.component.scss"],
})
export class MemberEditComponent implements OnInit {
  member;
  submitted = false;
  apps: Array<App>;
  curappids: Array<string>;
  selectRole;
  activeSelect;

  isLoading = true;

  memberForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toastr: ToastrService,
    private apiAuth: ApiAuth,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<MemberEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.selectRole = [
      { text: "management.editor", key: "Admin" },
      { text: "management.normalUser", key: "Collaborator" },
    ];
    const initActiveselect = this.data.member
      ? this.selectRole.find((item) => item.key === this.data.member.role)
      : null;
    if (initActiveselect) {
      this.activeSelect = Object.assign({}, initActiveselect);
    } else {
      this.activeSelect = Object.assign({}, this.selectRole[0]);
    }
  }

  async ngOnInit() {
    this.member = this.data.member;
    this.curappids =
      this.member && this.member.apps
        ? this.member.apps.reduce((arr: Array<string>, app: Object) => {
            arr.push(app["id"]);
            return arr;
          }, [])
        : [];
    const email = this.member ? this.member.email : "";
    const comment = this.member ? this.member.owner_comment : "";
    this.buildForm(email, comment);
    let result = await this.apiAuth.getAllApp();

    this.apps = result as Array<App>;
    this.isLoading = false;
  }

  buildForm(email, comment) {
    this.memberForm = this.fb.group({
      email: [
        {
          value: email,
          disabled: this.member ? true : false,
        },
        emailValidator,
      ],
      comment: [comment || ""],
      role: [""],
      apps: [""],
    });
  }

  closeDialog() {
    this.dialogRef.close("close");
  }

  async submit() {
    const val = this.memberForm.value;
    if (this.member) {
      const res = await this.apiAuth.updateMembers({
        id: this.member.id,
        email: val["email"],
        owner_comment: val["comment"],
        role: this.activeSelect.key,
        apps_id: this.curappids,
      });

      this.closeDialog();
    } else {
      const res = await this.apiAuth.createMembers({
        email: val["email"],
        owner_comment: val["comment"],
        role: this.activeSelect.key,
        apps_id: this.curappids,
      });

      const data = res;
      if (data.hasOwnProperty("error_code") && data["error_code"] !== 0) {
        this.toastr.error(data["reason_display"]);
      } else {
        this.toastr.success(data["reason_display"]);
        this.closeDialog();
      }
    }
  }

  isChecked(appid) {
    return this.curappids.indexOf(appid) > -1 ? true : false;
  }

  check(app) {
    const index = this.curappids.indexOf(app["id"]);
    if (index > -1) {
      this.curappids.splice(index, 1);
    } else {
      this.curappids.push(app.id);
    }
  }

  select(e) {
    this.activeSelect = this.selectRole.find((item) => item.key === e);
  }

  translateKey(key) {
    return this.translate.get(key);
  }
}
