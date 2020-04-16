ng serve --host 0.0.0.0 --port 4201

<li
*ngFor="let menu of menus; let index = index; let first = first; let last = last; let odd = odd; let even = even;">
<a href="#">{{menu.title}}{{index}}</a>
<em>{{first}}{{last}}{{odd}}{{even}}</em>
</li>

<ul>
  <li *ngFor="let menu of menus;let i = index;let even = even;">
    <a href="#" [title]="menu.title + ' details'" [class.active]="selectedIndex === i" [class.even]="even"
      (click)="selectedIndex = i;">{{menu.title}}</a>
  </li>
</ul>

<ul>
  <li *ngFor="let menu of menus; let i = index">
    <a
      href="#"
      [title]="menu.title + ' details'"
      [class.active]="selectedIndex === i"
      (click)="selectedIndex = i"
      >{{ menu.title }}</a
    >
    <span class="indicator" *ngIf="i === selectedIndex; else elseTemp"></span>
  </li>
  <ng-template #elseTemp>
    <span>uu</span>
  </ng-template>
</ul>

