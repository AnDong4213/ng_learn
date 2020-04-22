import { Directive, EmbeddedViewRef, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { RoleService } from '../service/role.service';
import { UserInfo } from '../model';

@Directive({
  selector: '[appRole]'
})
export class RoleDirective implements OnDestroy {
  private _context: RoleContext = new RoleContext();
  private _thenTemplateRef: TemplateRef<RoleContext> | null = null;
  private _elseTemplateRef: TemplateRef<RoleContext> | null = null;
  private _thenViewRef: EmbeddedViewRef<RoleContext> | null = null;
  private _elseViewRef: EmbeddedViewRef<RoleContext> | null = null;

  userRoles: Array<string>;
  isShow: boolean;
  userInfo$;

  constructor(private _viewContainer: ViewContainerRef,
    templateRef: TemplateRef<RoleContext>,
    private roleService: RoleService) {
    this._thenTemplateRef = templateRef;
  }

  @Input()
  set appRole(condition: any) {
    this._context.$implicit = this._context.ngIf = condition;
    this.testRole(this._context.$implicit, () => {
      this._updateView();
    });
  }

  @Input()
  set appRoleThen(templateRef: TemplateRef<RoleContext>) {
    this._thenTemplateRef = templateRef;
    this._thenViewRef = null; // clear previous view if any.
    this.testRole(this._context.$implicit, () => {
      this._updateView();
    });
  }

  @Input()
  set appRoleElse(templateRef: TemplateRef<RoleContext>) {
    this._elseTemplateRef = templateRef;
    this._elseViewRef = null; // clear previous view if any.
    this.testRole(this._context.$implicit, () => {
      this._updateView();
    });
  }


  private _updateView() {
    if (this.isShow) {
      if (!this._thenViewRef) {
        this._viewContainer.clear();
        this._elseViewRef = null;
        if (this._thenTemplateRef) {
          this._thenViewRef =
            this._viewContainer.createEmbeddedView(this._thenTemplateRef, this._context);
        }
      }
    } else {
      if (!this._elseViewRef) {
        this._viewContainer.clear();
        this._thenViewRef = null;
        if (this._elseTemplateRef) {
          this._elseViewRef =
            this._viewContainer.createEmbeddedView(this._elseTemplateRef, this._context);
        }
      }
    }
  }

  private testRole(roles, callback) {
    this.userInfo$ = this.roleService.getRoles().then(res => {
      this.userRoles = res.features;
      this.isShow = true;
      roles.forEach(r => {
        if (!this.userRoles.includes(r)) {
          this.isShow = false;
          return;
        }
      });
      return callback();
    }).catch(
      e => {
        this.isShow = false;
        return callback();
      }
    );
  }

  ngOnDestroy() {
    // this.userInfo$.unsubscribe();
  }

}

export class RoleContext {
  public $implicit: any = null;
  public ngIf: any = null;
}
