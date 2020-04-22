import { Directive, HostListener, Input } from "@angular/core";
import {
  CdkStepper,
  CdkStepperNext,
  CdkStepperPrevious,
} from "@angular/cdk/stepper";
import { MatStepper } from "@angular/material";

@Directive({
  selector: "button[myStepperNext]",
  providers: [{ provide: CdkStepper, useExisting: MatStepper }],
})
export class MyStepperNextDirective extends CdkStepperNext {
  @Input() complete;

  @HostListener("click") onClick() {
    if (!this.complete) {
      return;
    }
    this.complete.subscribe((result) => {
      if (result) {
        this._stepper.next();
      }
    });
  }
}
