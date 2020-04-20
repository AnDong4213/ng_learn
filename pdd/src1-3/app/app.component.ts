import { Component, OnInit, ViewChild } from '@angular/core';
import {
  TopMenu,
  ImageSlider,
  ImageSliderComponent,
} from './shared/components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  title = 'pdd';
  scrollableTabBgColor = 'red';
  topMenus: TopMenu[] = [
    {
      title: '热门',
      link: '',
    },
    {
      title: '男装',
      link: '',
    },
    {
      title: '百货',
      link: '',
    },
    {
      title: '运动',
      link: '',
    },
    {
      title: '手机',
      link: '',
    },
    {
      title: '家纺',
      link: '',
    },
    {
      title: '食品',
      link: '',
    },
    {
      title: '电器',
      link: '',
    },
    {
      title: '鞋包',
      link: '',
    },
    {
      title: '汽车',
      link: '',
    },
    {
      title: '水果',
      link: '',
    },
    {
      title: '电脑',
      link: '',
    },
    {
      title: '内衣',
      link: '',
    },
    {
      title: '家装',
      link: '',
    },
    {
      title: '母婴',
      link: '',
    },
    {
      title: '美妆',
      link: '',
    },
    {
      title: '家具',
      link: '',
    },
  ];
  imageSliders: ImageSlider[] = [
    {
      imgUrl:
        'https://media.istockphoto.com/photos/morning-jogging-picture-id497687118',
      link: '',
      caption: '',
    },
    {
      imgUrl:
        'https://media.istockphoto.com/photos/listening-the-music-picture-id508949258',
      link: '',
      caption: '',
    },
    {
      imgUrl:
        'https://media.istockphoto.com/photos/pretty-young-teenage-girl-relaxing-on-a-grass-picture-id521982322',
      link: '',
      caption: '',
    },
    {
      imgUrl:
        'https://media.istockphoto.com/photos/beautiful-women-working-out-in-gym-picture-id623680490',
      link: '',
      caption: '',
    },
    {
      imgUrl:
        'https://media.istockphoto.com/photos/jogging-with-my-best-friend-picture-id850045040',
      link: '',
      caption: '',
    },
  ];
  username = '搜索时2';

  // @ViewChild('imageSlider') imgSlider: ImageSliderComponent; // 使用别名 imageSlider #imageSlider
  @ViewChild(ImageSliderComponent, { static: true })
  imgSlider: ImageSliderComponent;

  ngOnInit() {
    console.log('还没初始化....');
  }

  ngAfterViewInit(): void {
    console.log('imgSlider', this.imgSlider);
  }

  handleTabSelected(tab: TopMenu) {
    const colors = ['red', 'blue', 'black'];
    const idx = Math.floor(Math.random() * 3);
    this.scrollableTabBgColor = colors[idx];
    console.log(tab);
  }
}
