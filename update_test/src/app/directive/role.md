#权限控制指令使用方法：

1. `import { Role } from '../../../../model/role';`

2. 创建一个权限数组变量 例如: `logRole = [Role.appbuilder, Role.audience];`

3. 在页面中使用方法和ngIf类似： `*appRole="logRole;else stpl"`

4. 写一个template，没权限的时候显示：`<ng-template #stpl> <div>查看日志-请升级您的账户</div> </ng-template>`
