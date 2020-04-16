ng serve --host 0.0.0.0 --port 4201

<li
*ngFor="let menu of menus; let index = index; let first = first; let last = last; let odd = odd; let even = even;">
<a href="#">{{menu.title}}{{index}}</a>
<em>{{first}}{{last}}{{odd}}{{even}}</em>
</li>