import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Inject,
} from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { ToastrService } from "ngx-toastr";
import { White_List } from "../../model";
import {
  NgForm,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";

import { ApiExperiment } from "adhoc-api";
import { TranslateService } from "@ngx-translate/core";
import { checkFileSizeValid } from "../../utils/validators";

@Component({
  selector: "app-white-list-dialog",
  templateUrl: "./white-list-dialog.component.html",
  styleUrls: ["./white-list-dialog.component.scss"],
})
export class WhiteListDialogComponent implements OnInit {
  whiteListForm: FormGroup;
  defaultOpt: any;
  thisFile: any;
  thisFileName: string;
  thisFileSize: string;
  optLabel: string = "equal";

  ifEmptyError: Boolean = false;
  ifExceedError: Boolean = false;
  ifTypeError: Boolean = false;
  ifUploadError: Boolean = false;

  fileSelected: Boolean = false;
  uploadStat: string = "add";
  optData = new Array<any>();

  @ViewChild("dataSize") dataSize: ElementRef;

  constructor(
    public dialogRef: MatDialogRef<WhiteListDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private toastrService: ToastrService,
    private translate: TranslateService,
    private apiExp: ApiExperiment
  ) {}

  ngOnInit() {
    this.optData.push({ id: 1, text: "是" }, { id: 2, text: "不是" });
    this.defaultOpt = this.optData[0];
    if (this.data.audience && this.data.audienceId) {
      this.uploadStat = "edit";
      if (this.data.audience.description === "") {
        this.fileSelected = false;
        this.uploadStat = "add";
        return;
      }
      this.fileSelected = true;

      // 回显文件名称和size

      const dataInfo = this.data.audience.description.split(",");
      this.thisFileName = dataInfo[0];
      this.thisFileSize = dataInfo[1];
      const editFileSize = this.unitCalc(dataInfo[1]);

      this.dataSize.nativeElement.innerHTML =
        editFileSize.size + editFileSize.unit;

      //回显 是或不是 的默认条件
      const thisOpt = this.data.audience.new_conditions.filter((item) => {
        return item.typ === "op";
      })[1];
      this.defaultOpt =
        thisOpt.name === "equal"
          ? this.optData[0]
          : thisOpt.name === "not_equal"
          ? this.optData[1]
          : null;
    }
    // this.buildForm();
  }

  // 选择要上传的文件, 附件原单位（B）
  uploadFile(file) {
    this.ifEmptyError = false;
    this.ifExceedError = false;
    this.ifTypeError = false;
    this.ifUploadError = false;
    this.thisFile = file.target.files[0];
    this.thisFileName = this.thisFile.name;
    const fileType = this.thisFileName.split(".")[1];

    const fileSize = this.unitCalc(this.thisFile.size);
    this.thisFileSize = this.thisFile.size;
    if (fileType === "txt" || fileType === "TXT") {
      if (Number(fileSize.size) === 0) {
        this.ifEmptyError = true;
      } else if (Number(fileSize.size) > 5 && fileSize.unit == "MB") {
        this.ifExceedError = true;
      } else {
        this.dataSize.nativeElement.innerHTML = fileSize.size + fileSize.unit;
        this.fileSelected = true;
      }
    } else {
      this.ifTypeError = true;
    }

    let input = new FormData();
    input.append("file", this.thisFile);

    this.apiExp.uploadWhiteList(this.data.appId, input).then((res) => {});
  }

  unitCalc(bytes) {
    if (bytes === 0) return { size: "0", unit: "B" };
    var k = 1024,
      sizes = ["B", "KB", "MB"],
      i = Math.floor(Math.log(bytes) / Math.log(k));

    var dataObj = {
      size: (bytes / Math.pow(k, i)).toPrecision(3),
      unit: sizes[i],
    };

    return dataObj;
  }

  buildForm(): void {
    this.whiteListForm = this.fb.group({
      uploadfile: ["", Validators.compose([Validators.required])],
    });
  }

  submit(form) {
    if (
      this.ifEmptyError ||
      this.ifExceedError ||
      this.ifTypeError ||
      this.ifUploadError
    ) {
      return;
    }
    if (this.uploadStat === "add" && !this.fileSelected) {
      this.ifUploadError = true;
      return;
    }

    this.uploadStat === "add"
      ? this.addSubmit()
      : this.uploadStat === "edit"
      ? this.editSubmit()
      : null;
  }

  addSubmit() {
    if (!this.fileSelected) {
      this.dialogRef.close("true");
      this.uploadStat = "add";
      return;
    }

    if (this.data.audienceId) {
      this.data.audience.description =
        this.thisFileName + "," + this.thisFileSize;
      this.data.audience.new_conditions.forEach((item) => {
        if (
          item.typ == "op" &&
          (item.name === "equal" || item.name === "not_equal")
        ) {
          item.name = this.optLabel;
        }
        if (item.name == "White_List_Device") {
          item.from = "summary";
        }
      });

      this.apiExp
        .updateAudiences(
          this.data.appId,
          this.data.audienceId,
          this.data.audience
        )
        .then((res) => {
          if (res["status"] === "OK" && this.data.audience.description != "") {
            const txt = this.translate.instant("whitelist.successChangeMsg");
            this.toastrService.success(txt);
          }
          this.uploadStat = "edit";
          this.dialogRef.close("true");
        });
    } else {
      const condition = [];
      condition.push(
        {
          typ: "op",
          name: "left_bracket",
        },
        {
          typ: "param",
          name: "White_List_Device",
          from: "summary",
          description: "White_List_Device",
        },
        {
          typ: "op",
          name: this.optLabel,
        },
        {
          typ: "param",
          name: "true",
        },
        {
          typ: "op",
          name: "right_bracket",
        }
      );

      const infoData = {
        name: White_List,
        description: this.thisFile.name + "," + this.thisFile.size,
        conditions: "",
        new_conditions: condition,
      };

      this.apiExp.setAudiences(this.data.appId, infoData).then((res) => {
        if (res["status"] === "OK" && infoData.description != "") {
          const txt = this.translate.instant("whitelist.successCreateMsg");
          this.toastrService.success(txt);
          this.uploadStat = "edit";
        }

        this.dialogRef.close();
      });
    }
  }

  editSubmit() {
    if (this.fileSelected) {
      this.data.audience.description =
        this.thisFileName + "," + this.thisFileSize;
      this.data.audience.new_conditions.forEach((item) => {
        if (
          item.typ == "op" &&
          (item.name === "equal" || item.name === "not_equal")
        ) {
          item.name = this.optLabel;
        }
        if (item.name == "White_List_Device") {
          item.from = "summary";
        }
      });
    } else {
      this.data.audience.description = "";
      this.uploadStat = "add";
    }

    this.apiExp
      .updateAudiences(
        this.data.appId,
        this.data.audienceId,
        this.data.audience
      )
      .then((res) => {
        if (res["status"] === "OK" && this.data.audience.description != "") {
          const txt = this.translate.instant("whitelist.successChangeMsg");
          this.toastrService.success(txt);
        }

        if (this.fileSelected) {
          this.dialogRef.close("editCon");
        } else {
          this.dialogRef.close("noCon");
        }
      });
  }

  switchFilter(selectedItem) {
    selectedItem.text === "是"
      ? (this.optLabel = "equal")
      : selectedItem.text === "不是"
      ? (this.optLabel = "not_equal")
      : null;
  }

  // 点击移除按钮，删除已选择的文件
  deleteFileSel() {
    this.fileSelected = false;
    this.ifEmptyError = false;
    this.ifExceedError = false;
    this.ifTypeError = false;
    this.ifUploadError = false;
    this.dataSize.nativeElement.innerHTML = "5M以内";
  }

  close() {
    this.dialogRef.close();
  }
}
