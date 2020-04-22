import { Component, ViewEncapsulation, OnInit, Inject } from "@angular/core";
import { Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";

import {
  NgForm,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import {
  App,
  APP_TYPE_H5,
  APP_TYPE_ANDROID,
  APP_TYPE_IOS,
  APP_TYPE_DEF,
  Audience,
} from "../../model";
import { ApiExperiment } from "adhoc-api";
import { CurAppService } from "../../service/cur-app.service";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import {
  CheckRepeatValidator,
  CheckInputBlankValidator,
} from "../../utils/validators/index";

@Component({
  selector: "app-user-filter-create",
  templateUrl: "./user-filter-create.component.html",
  styleUrls: ["./user-filter-create.component.scss"],
})
export class UserFilterCreateComponent implements OnInit {
  APP_TYPE_DEF = APP_TYPE_DEF;
  APP_TYPE_H5 = APP_TYPE_H5;
  APP_TYPE_IOS = APP_TYPE_IOS;
  APP_TYPE_ANDROID = APP_TYPE_ANDROID;

  conditions = [
    {
      name: "OS",
      type: "string",
      custom: false,
      input: false,
      options: [
        "iOS",
        "Android",
        "Windows Phone",
        "BlackBerry",
        "Mac OS",
        "Windows",
        "Linux",
      ],
      key: "OS",
      appType: APP_TYPE_DEF,
    },
    {
      name: "自定义标签",
      type: "number",
      input: true,
      custom: true,
      options: [],
      key: "",
      appType: APP_TYPE_DEF,
    },
    {
      name: "iOS 版本",
      type: "number",
      custom: false,
      input: false,
      options: [
        "12.1",
        "12.0",
        "11.3",
        "11.2",
        "11.1",
        "11.0",
        "10.3",
        "10.2",
        "10.1",
        "10.0",
        "9.3",
        "9.2",
        "9.1",
        "9.0",
        "8.4",
        "8.3",
        "8.2",
        "8.1",
        "8.0",
        "7.1",
        "7.0",
      ],
      key: "os_version",
      appType: APP_TYPE_IOS,
    },
    {
      name: "Android 版本",
      type: "number",
      custom: false,
      input: false,
      options: [
        "9.0",
        "8.0",
        "7.0",
        "6.0",
        "5.1",
        "5.0",
        "4.4",
        "4.3",
        "4.2",
        "4.1",
        "4.0",
        "3.2",
        "3.1",
        "3.0",
        "2.3",
        "2.2",
      ],
      key: "os_version",
      appType: APP_TYPE_ANDROID,
    },
    {
      name: "浏览器",
      type: "string",
      custom: false,
      input: false,
      options: [
        "Chrome",
        "Firefox",
        "Safari",
        "Opera",
        "IE",
        "Edge",
        "WeChat",
        "BIDUBrowser",
        "QQBrowser",
        "UCBrowser",
        "LBBROWSER",
        "360",
      ],
      key: "browser",
      appType: APP_TYPE_H5,
    },
    {
      name: "Chrome 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: [
        "69",
        "68",
        "67",
        "66",
        "65",
        "64",
        "63",
        "62",
        "61",
        "60",
        "59",
        "58",
        "57",
        "56",
        "55",
        "54",
        "53",
        "52",
        "51",
        "50",
        "49",
        "48",
        "47",
        "46",
        "45",
        "44",
        "43",
        "42",
        "41",
        "40",
        "39",
        "38",
        "37",
        "36",
        "35",
        "34",
        "33",
        "32",
        "31",
        "30",
        "29",
        "28",
        "27",
        "26",
        "25",
        "24",
      ],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Firefox 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: [
        "62",
        "61",
        "60",
        "59",
        "58",
        "57",
        "56",
        "55",
        "54",
        "53",
        "52",
        "51",
        "50",
        "49",
        "48",
        "47",
        "46",
        "45",
        "44",
        "43",
        "42",
        "41",
        "40",
        "39",
        "38",
        "37",
        "36",
        "35",
        "34",
        "33",
        "32",
        "31",
        "30",
        "29",
        "28",
        "27",
        "26",
        "25",
        "24",
      ],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Safari 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: ["12", "11", "10", "9", "8", "7", "6", "5"],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Opera 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: [
        "56",
        "55",
        "54",
        "53",
        "52",
        "42",
        "41",
        "40",
        "39",
        "38",
        "37",
        "36",
        "35",
        "34",
        "33",
        "32",
        "31",
        "30",
        "29",
        "28",
        "27",
        "26",
        "25",
        "24",
        "23",
        "22",
        "21",
        "20",
      ],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Internet Explorer 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: ["11", "10", "9", "8"],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Microsoft Edge 浏览器版本",
      type: "number",
      custom: false,
      input: false,
      options: ["44", "43", "42", "25", "23", "20", "19", "16", "15", "13"],
      key: "browser_version",
      appType: APP_TYPE_H5,
    },
    {
      name: "Referrer URL",
      custom: false,
      input: true,
      type: "string",
      options: [],
      key: "referrer",
      appType: APP_TYPE_H5,
    },
    {
      name: "国家和地区",
      custom: false,
      input: false,
      type: "string",
      options: [
        "中国",
        "日本",
        "韩国",
        "朝鲜",
        "中国香港",
        "中国台湾",
        "中国澳门",
        "芬兰",
        "爱沙尼亚",
        "波兰",
        "英国",
        "意大利",
        "德国",
        "西班牙",
        "奥地利",
        "法国",
        "葡萄牙",
        "瑞士",
        "列支敦士登",
        "印度",
        "美国",
        "加拿大",
        "墨西哥",
        "哥伦比亚",
        "巴西",
        "阿根廷",
        "智利",
        "乌拉圭",
        "委内瑞拉",
        "秘鲁",
        "澳大利亚",
        "新西兰",
        "以色列",
        "爱尔兰",
        "比利时",
        "阿联酋",
        "科威特",
        "菲律宾",
        "沙特阿拉伯",
        "阿曼",
        "巴林",
        "也门",
        "印尼",
        "泰国",
        "南非",
      ],
      key: "country",
      appType: APP_TYPE_DEF,
    },
    {
      name: "系统语言",
      type: "string",
      custom: false,
      input: false,
      options: [
        "Chinese",
        "Arabic",
        "Danish",
        "Dutch",
        "English",
        "Finnish",
        "French",
        "Hindi",
        "Japanese",
        "Korean",
        "Norwegian",
        "Portuguese",
        "Russian",
        "Spanish",
        "Swedish",
        "Indonesian",
        "Thai",
        "Traditional Chinese",
      ],
      key: "language",
      appType: APP_TYPE_DEF,
    },
    {
      name: "市",
      type: "string",
      custom: false,
      input: false,
      options: ["北京", "上海", "天津", "重庆"],
      key: "region_city",
      appType: APP_TYPE_DEF,
    },
    {
      name: "省",
      type: "string",
      custom: false,
      input: false,
      options: [
        "黑龙江",
        "辽宁",
        "吉林",
        "河北",
        "河南",
        "湖北",
        "湖南",
        "山东",
        "山西",
        "陕西",
        "安徽",
        "浙江",
        "江苏",
        "福建",
        "广东",
        "海南",
        "四川",
        "云南",
        "贵州",
        "青海",
        "内蒙古",
        "甘肃",
        "江西",
        "台湾",
      ],
      key: "region_province",
      appType: APP_TYPE_DEF,
    },
    // {
    //   name: '市',
    //   type: 'string',
    //   options: ['石家庄市','唐山市','邯郸市','保定市','沧州市','太原市','大同市','晋中市','呼和浩特市','包头市','沈阳市','大连市','鞍山市','抚顺市','锦州市','长春市','吉林市','哈尔滨市','齐齐哈尔市','大庆市','南京市','无锡市','徐州市','常州市','苏州市','南通市','盐城市','扬州市','泰州市','杭州市','宁波市','温州市','嘉兴市','绍兴市','金华市','台州市','合肥市','芜湖市','淮南市','福州市','厦门市','泉州市','漳州市','南昌市','九江市','赣州市','济南市','青岛市','淄博市','烟台市','潍坊市','济宁市','临沂市','郑州市','洛阳市','安阳市','新乡市','南阳市','周口市','武汉市','宜昌市','襄樊市','长沙市','衡阳市','岳阳市','常德市','广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','东莞市','中山市','揭阳市','南宁市','柳州市','桂林市','海口市','成都市','绵阳市','贵阳市','遵义市','昆明市','拉萨市','西安市','宝鸡市','咸阳市','兰州市','西宁市','银川市','乌鲁木齐市'],
    //   key: 'region_city',
    //   appType: DEF_CONDITIONS_TYPE
    // },
    // {
    //   name: '省',
    //   type: 'string',
    //   options: ['全球','大中华','亚洲其他','大洋洲','欧洲','北美洲','南美洲','非洲','中国大陆','香港','澳门','台湾','北京市','天津市','河北省','山西省','内蒙古','辽宁省','吉林省','黑龙江省','上海市','江苏省','浙江省','安徽省','福建省','江西省','山东省','河南省','湖北省','湖南省','广东省','广西','海南省','重庆市','四川省','贵州省','云南省','西藏','陕西省','甘肃省','青海省','宁夏','新疆'],
    //   key: 'region_province',
    //   appType: DEF_CONDITIONS_TYPE
    // },
    {
      name: "设备类型",
      type: "string",
      custom: false,
      input: false,
      options: [
        "PC",
        "Mac",
        "手机",
        "平板",
        "智能电视",
        "可穿戴设备",
        "嵌入式设备",
      ],
      key: "device_type",
      appType: APP_TYPE_DEF,
    },
    // {name: '设备名称', type: 'string', input: true, key: 'device_name'},
    {
      name: "设备型号",
      type: "string",
      custom: false,
      input: true,
      options: [],
      key: "device_model",
      appType: APP_TYPE_DEF,
    },
    {
      name: "屏幕宽度",
      type: "number",
      custom: false,
      input: true,
      options: [],
      key: "display_width",
      appType: APP_TYPE_DEF,
    },
    {
      name: "屏幕高度",
      type: "number",
      custom: false,
      input: true,
      options: [],
      key: "display_height",
      appType: APP_TYPE_DEF,
    },
    {
      name: "应用版本",
      type: "number",
      custom: false,
      input: true,
      options: [],
      key: "app_version",
      appType: APP_TYPE_DEF,
    },
  ];

  opsNumber = [
    {
      label: "是",
      type: "number",
      val: "equal",
    },
    {
      label: "不是",
      type: "number",
      val: "not_equal",
    },
    {
      label: "大于",
      type: "number",
      val: "bigger",
    },
    {
      label: "小于",
      type: "number",
      val: "smaller",
    },
  ];

  opsString = [
    {
      label: "是",
      type: "string",
      val: "equal",
    },
    {
      label: "不是",
      type: "string",
      val: "not_equal",
    },
  ];

  opsStringVague = [
    {
      label: "是",
      type: "string",
      val: "equal",
    },
    {
      label: "不是",
      type: "string",
      val: "not_equal",
    },
    {
      label: "包含",
      type: "string",
      val: "include",
    },
    {
      label: "不包含",
      type: "string",
      val: "exclude",
    },
  ];

  link = [
    {
      label: "或者",
      symbol: "||",
      val: "or",
    },
    {
      label: "并且",
      symbol: "&&",
      val: "and",
    },
  ];

  summaryMap = {
    OS: { iOS: "iOS", Android: "google_android" },
    language: {
      Arabic: "ar",
      Chinese: "zh",
      Danish: "da",
      Dutch: "nl",
      English: "en",
      Finnish: "fi",
      French: "fr",
      Hindi: "hi",
      Japanese: "ja",
      Korean: "ko",
      Norwegian: "no",
      Portuguese: "pt",
      Russian: "ru",
      Spanish: "es",
      Swedish: "sv",
    },
    device_type: {
      手机: "mobile",
      平板: "tablet",
      智能电视: "smarttv",
      可穿戴设备: "wearable",
      嵌入式设备: "embedded",
    },
    region_province: {
      全球: "000000000000000000000000",
      大中华: "000000000000000000000001",
      亚洲其他: "000000000000000000000002",
      大洋洲: "000000000000000000000003",
      欧洲: "000000000000000000000004",
      北美洲: "000000000000000000000005",
      南美洲: "000000000000000000000006",
      非洲: "000000000000000000000007",
      中国大陆: "000000000000000000000008",
      香港: "000000000000000000000009",
      澳门: "000000000000000000000010",
      台湾: "000000000000000000000011",
      北京市: "000000000000000000000012",
      天津市: "000000000000000000000013",
      河北省: "000000000000000000000014",
      山西省: "000000000000000000000015",
      内蒙古: "000000000000000000000016",
      辽宁省: "000000000000000000000017",
      吉林省: "000000000000000000000018",
      黑龙江省: "000000000000000000000019",
      上海市: "000000000000000000000020",
      江苏省: "000000000000000000000021",
      浙江省: "000000000000000000000022",
      安徽省: "000000000000000000000023",
      福建省: "000000000000000000000024",
      江西省: "000000000000000000000025",
      山东省: "000000000000000000000026",
      河南省: "000000000000000000000027",
      湖北省: "000000000000000000000028",
      湖南省: "000000000000000000000029",
      广东省: "000000000000000000000030",
      广西: "000000000000000000000031",
      海南省: "000000000000000000000032",
      重庆市: "000000000000000000000033",
      四川省: "000000000000000000000034",
      贵州省: "000000000000000000000035",
      云南省: "000000000000000000000036",
      西藏: "000000000000000000000037",
      陕西省: "000000000000000000000038",
      甘肃省: "000000000000000000000039",
      青海省: "000000000000000000000040",
      宁夏: "000000000000000000000041",
      新疆: "000000000000000000000042",
    },
    country: {
      中国: "CN",
      日本: "JP",
      韩国: "KR",
      朝鲜: "KP",
      中国香港: "HK",
      中国台湾: "TW",
      芬兰: "FI",
      爱沙尼亚: "EE",
      波兰: "PL",
      英国: "GB",
      意大利: "IT",
      德国: "DE",
      西班牙: "ES",
      奥地利: "AT",
      法国: "FR",
      葡萄牙: "PT",
      瑞士: "CH",
      列支敦士登: "LI",
      印度: "IN",
      美国: "US",
      加拿大: "CA",
      墨西哥: "MX",
      哥伦比亚: "CO",
      巴西: "BR",
      阿根廷: "AR",
      智利: "CL",
      乌拉圭: "UY",
      委内瑞拉: "VE",
      秘鲁: "PE",
      澳大利亚: "AU",
      新西兰: "NZ",
      比利时: "BE",
      阿联酋: "AE",
      科威特: "KW",
      菲律宾: "PH",
      沙特阿拉伯: "SA",
      阿曼: "OM",
      巴林: "BH",
      也门: "YE",
      印尼: "ID",
      泰国: "TH",
      南非: "ZA",
    },
    region_city: {
      石家庄市: "000000000000000000000043",
      唐山市: "000000000000000000000044",
      邯郸市: "000000000000000000000045",
      保定市: "000000000000000000000046",
      沧州市: "000000000000000000000047",
      太原市: "000000000000000000000049",
      大同市: "000000000000000000000050",
      晋中市: "000000000000000000000051",
      呼和浩特市: "000000000000000000000053",
      包头市: "000000000000000000000054",
      沈阳市: "000000000000000000000056",
      大连市: "000000000000000000000057",
      鞍山市: "000000000000000000000058",
      抚顺市: "000000000000000000000059",
      锦州市: "000000000000000000000060",
      长春市: "000000000000000000000062",
      吉林市: "000000000000000000000063",
      哈尔滨市: "000000000000000000000065",
      齐齐哈尔市: "000000000000000000000066",
      大庆市: "000000000000000000000067",
      南京市: "000000000000000000000069",
      无锡市: "000000000000000000000070",
      徐州市: "000000000000000000000071",
      常州市: "000000000000000000000072",
      苏州市: "000000000000000000000073",
      南通市: "000000000000000000000074",
      盐城市: "000000000000000000000075",
      扬州市: "000000000000000000000076",
      泰州市: "000000000000000000000077",
      杭州市: "000000000000000000000079",
      宁波市: "000000000000000000000080",
      温州市: "000000000000000000000081",
      嘉兴市: "000000000000000000000082",
      绍兴市: "000000000000000000000083",
      金华市: "000000000000000000000084",
      台州市: "000000000000000000000085",
      合肥市: "000000000000000000000087",
      芜湖市: "000000000000000000000088",
      淮南市: "000000000000000000000089",
      福州市: "000000000000000000000091",
      厦门市: "000000000000000000000092",
      泉州市: "000000000000000000000093",
      漳州市: "000000000000000000000094",
      南昌市: "000000000000000000000096",
      九江市: "000000000000000000000097",
      赣州市: "000000000000000000000098",
      济南市: "000000000000000000000100",
      青岛市: "000000000000000000000101",
      淄博市: "000000000000000000000102",
      烟台市: "000000000000000000000103",
      潍坊市: "000000000000000000000104",
      济宁市: "000000000000000000000105",
      临沂市: "000000000000000000000106",
      郑州市: "000000000000000000000108",
      洛阳市: "000000000000000000000109",
      安阳市: "000000000000000000000110",
      新乡市: "000000000000000000000111",
      南阳市: "000000000000000000000112",
      周口市: "000000000000000000000113",
      武汉市: "000000000000000000000115",
      宜昌市: "000000000000000000000116",
      襄樊市: "000000000000000000000117",
      长沙市: "000000000000000000000119",
      衡阳市: "000000000000000000000120",
      岳阳市: "000000000000000000000121",
      常德市: "000000000000000000000122",
      广州市: "000000000000000000000124",
      韶关市: "000000000000000000000125",
      深圳市: "000000000000000000000126",
      珠海市: "000000000000000000000127",
      汕头市: "000000000000000000000128",
      佛山市: "000000000000000000000129",
      江门市: "000000000000000000000130",
      湛江市: "000000000000000000000131",
      茂名市: "000000000000000000000132",
      肇庆市: "000000000000000000000133",
      惠州市: "000000000000000000000134",
      东莞市: "000000000000000000000135",
      中山市: "000000000000000000000136",
      揭阳市: "000000000000000000000137",
      南宁市: "000000000000000000000139",
      柳州市: "000000000000000000000140",
      桂林市: "000000000000000000000141",
      海口市: "000000000000000000000143",
      成都市: "000000000000000000000145",
      绵阳市: "000000000000000000000146",
      贵阳市: "000000000000000000000148",
      遵义市: "000000000000000000000149",
      昆明市: "000000000000000000000151",
      拉萨市: "000000000000000000000153",
      西安市: "000000000000000000000155",
      宝鸡市: "000000000000000000000156",
      咸阳市: "000000000000000000000157",
      兰州市: "000000000000000000000159",
      西宁市: "000000000000000000000161",
      银川市: "000000000000000000000163",
      乌鲁木齐市: "000000000000000000000165",
    },
  };

  summaryMapRevolve = {};

  summaryMaps;

  curItemId = 0;
  brackets = Array<any>();
  curNum = 0;
  // items = Array<any>();
  links = Array<any>();
  app: App;
  submitted: Boolean = false;

  audience = new Audience();
  audienceForm: FormGroup;

  condition = Array<any>();
  conditionFormula: string;
  formGroup: Object;
  saveAudienceName: String;
  saveAudienceDisc: String;

  constructor(
    private toastrService: ToastrService,
    private router: Router,
    private apiExperiment: ApiExperiment,
    private curApp: CurAppService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<UserFilterCreateComponent>
  ) {
    this.app = this.curApp.getApp();
  }

  ngOnInit() {
    if (this.app.typ == this.APP_TYPE_H5 || this.app.typ == this.APP_TYPE_DEF) {
      this.conditions.push({
        name: "投放渠道",
        type: "string",
        custom: false,
        input: true,
        options: [],
        key: "source",
        appType: APP_TYPE_DEF,
      });
    }

    for (let key in this.summaryMap) {
      let keyItem = this.summaryMap[key];
      this.summaryMapRevolve[key] = {};
      for (let itemkey in keyItem) {
        let subkey = keyItem[itemkey];
        this.summaryMapRevolve[key][subkey] = itemkey;
      }
    }

    this.summaryMaps = this.summaryMapRevolve;

    this.buildForm();
    if (
      this.app.typ !== this.APP_TYPE_H5 &&
      this.app.typ !== this.APP_TYPE_DEF
    ) {
      if (this.app.typ === this.APP_TYPE_IOS) {
        this.conditions = this.conditions.filter(
          (condition) =>
            condition.appType === this.APP_TYPE_IOS ||
            condition.appType === this.APP_TYPE_DEF
        );
      }
      if (this.app.typ === this.APP_TYPE_ANDROID) {
        this.conditions = this.conditions.filter(
          (condition) =>
            condition.appType === this.APP_TYPE_ANDROID ||
            condition.appType === this.APP_TYPE_DEF
        );
      }
    }
    this.inItBrackets();
  }

  // 初始化 添加一个括号 添加一个条件；多个括号时，添加括号之间的关联条件；更新condition数据
  inItBrackets() {
    let newItem = {
      curItemId: 0,
      name: this.conditions[0].name,
      key: this.conditions[0].key,
      op: this.opsString[0].val,
      value: this.conditions[0].options[0],
      isNameInput: false,
      isValueInput: false,
      ops: this.opsString,
      from: this.conditions[0].custom ? "custom" : "summary",
      data: this.conditions[0].options,
    };
    this.brackets.push({
      id: this.curNum,
      data: [newItem],
      links: [],
    });

    if (this.brackets.length > 1) {
      this.links.push(this.link[0]);
    }
    this.conditionFormat();
  }

  // 添加条件，当一个括号内存在多个条件时，添加条件间的关联
  addItem(num) {
    this.curItemId = this.curItemId + 1;
    this.brackets[num].data.push({
      curItemId: this.curItemId,
      name: this.conditions[0].name,
      key: this.conditions[0].key,
      op: this.opsString[0].val,
      value: this.conditions[0].options[0],
      isNameInput: false,
      isValueInput: false,
      ops: this.opsString,
      from: this.conditions[0].custom ? "custom" : "summary",
      data: this.conditions[0].options,
    });
    if (this.brackets[num].data.length > 1) {
      this.brackets[num].links.push(this.link[0]);
    }

    this.conditionFormat();
  }

  // 删除条件，删除条件间的关联，条件 == 0 ，删除所在括号，删除括号间关联
  delItem(num, i) {
    this.brackets[num].data.splice(i, 1);
    if (this.brackets[num].links.length > 0) {
      i == 0
        ? this.brackets[num].links.splice(0, 1)
        : this.brackets[num].links.splice(i - 1, 1);
    }
    if (this.brackets[num].data.length == 0) {
      this.brackets.splice(num, 1);
      if (num > 0) {
        this.links.splice(num - 1, 1);
      }
    }
    this.conditionFormat();
  }

  // 添加括号
  addBracket() {
    this.curNum++;
    this.inItBrackets();
    this.conditionFormat();
  }

  // 修改条件名称，同时需改其他属性值
  selectName(num, i, value) {
    this.saveAudienceName = this.audienceForm.controls["name"].value;
    this.saveAudienceDisc = this.audienceForm.controls["description"].value;

    this.conditions.filter((condition) => {
      if (condition.name == value) {
        this.brackets[num].data[i].name = value;
        this.brackets[num].data[i].data = condition.options;
        this.brackets[num].data[i].key = condition.key;
        this.brackets[num].data[i].value = condition.options[0] || "";
        this.brackets[num].data[i].from = condition.custom
          ? "custom"
          : "summary";

        if (condition.type == "number") {
          this.brackets[num].data[i].ops = this.opsNumber;
        } else if (
          condition.type == "string" &&
          condition.name == "Referrer URL"
        ) {
          this.brackets[num].data[i].ops = this.opsStringVague;
        } else {
          this.brackets[num].data[i].ops = this.opsString;
        }

        // condition.type == 'number' ? this.brackets[num].data[i].ops = this.opsNumber : this.brackets[num].data[i].ops = this.opsString;
        condition.input
          ? (this.brackets[num].data[i].isValueInput = true)
          : (this.brackets[num].data[i].isValueInput = false);
        condition.custom
          ? (this.brackets[num].data[i].isNameInput = true)
          : (this.brackets[num].data[i].isNameInput = false);
      }
    });

    /**
     * 之前存在一个问题是，所有生成的自定义标签的formControlName都是用的一个
     * 不利于分开判断每一个的状态
     * 修复：选择名称的时候如果是自定义标签，生成一个带 i 索引的表单formControlName
     * 并回显之前的自定义的数据
     */

    if (
      this.brackets[num].data[i].isNameInput &&
      this.brackets[num].data[i].isValueInput
    ) {
      let thiskey = "itemKey" + num.toString() + i.toString();
      let thisvalue = "itemValue" + num.toString() + i.toString();
      this.formGroup[thiskey] = ["", Validators.compose([Validators.required])];

      this.formGroup[thisvalue] = [
        "",
        Validators.compose([Validators.required, CheckInputBlankValidator()]),
      ];

      this.audienceForm = this.fb.group(this.formGroup);
      this.audienceForm.controls["name"].setValue(this.saveAudienceName);
      this.audienceForm.controls["description"].setValue(this.saveAudienceDisc);

      // 遍历brackets，将已有的自定义的表单的数据都保存上去

      this.brackets.map((con, num) => {
        con.data.map((item, index) => {
          if (item.isValueInput && item.isNameInput) {
            this.audienceForm.controls["itemKey" + num + index].setValue(
              item.key
            );
            this.audienceForm.controls["itemValue" + num + index].setValue(
              item.value
            );
          } else if (item.isValueInput && !item.isNameInput) {
            this.audienceForm.controls["itemValue" + num + index].setValue(
              item.value
            );
          }
        });
      });
    } else if (
      !this.brackets[num].data[i].isNameInput &&
      this.brackets[num].data[i].isValueInput
    ) {
      let thisvalue = "itemValue" + num.toString() + i.toString();

      this.formGroup[thisvalue] = [
        "",
        Validators.compose([Validators.required, CheckInputBlankValidator()]),
      ];

      this.audienceForm = this.fb.group(this.formGroup);
      this.audienceForm.controls["name"].setValue(this.saveAudienceName);
      this.audienceForm.controls["description"].setValue(this.saveAudienceDisc);

      // 遍历brackets，将已有的自定义的表单的数据都保存上去

      this.brackets.map((con, num) => {
        con.data.map((item, index) => {
          if (item.isValueInput && item.isNameInput) {
            this.audienceForm.controls["itemKey" + num + index].setValue(
              item.key
            );
            this.audienceForm.controls["itemValue" + num + index].setValue(
              item.value
            );
          } else if (item.isValueInput && !item.isNameInput) {
            this.audienceForm.controls["itemValue" + num + index].setValue(
              item.value
            );
          }
        });
      });
    }

    this.conditionFormat();
  }

  addInputKey(num, i, value) {
    this.conditions.filter((condition) => {
      this.brackets[num].data[i].key = value;
    });
    this.conditionFormat();
  }

  addInputValue(num, i, value) {
    console.log(value, this.containChina(value));
    this.conditions.filter((condition) => {
      if (this.brackets[num].data[i].name === "投放渠道") {
        const sourceVal = value.replace(/\s/g, "");
        this.brackets[num].data[i].value = encodeURIComponent(sourceVal);
      } else {
        this.brackets[num].data[i].value = value;
      }
    });
    this.conditionFormat();
  }

  // 修改op（是、不是、大于、小于）
  selectOp(num, i, value) {
    this.brackets[num].data[i].op = value;
    this.conditionFormat();
  }

  // 修改条件值
  selectValue(num, i, value) {
    this.brackets[num].data[i].value = value;
    this.conditionFormat();
  }

  // 修改条件间的关联
  selectLink(num, i, value) {
    this.brackets[num].links[i - 1] = this.link[value];
    this.conditionFormat();
  }

  // 修改括号间的关联
  selectBracketLink(num, value) {
    this.links[num - 1] = this.link[value];
    this.conditionFormat();
  }

  findRealValue(key, value) {
    let realValue;
    for (const k in this.summaryMaps[key]) {
      if (this.summaryMaps[key][k] === value) {
        realValue = k;
      }
    }
    return realValue ? realValue : value;
  }

  // 整理数据
  conditionFormat() {
    this.conditionFormula = "";
    this.condition = [];
    for (let num = 0; num < this.brackets.length; num++) {
      if (num > 0 && this.links.length > 0) {
        this.condition.push({
          typ: "op",
          name: this.links[num - 1].val,
        });
      }

      this.condition.push({
        typ: "op",
        name: "left_bracket",
      });
      for (let i = 0; i < this.brackets[num].data.length; i++) {
        let value = this.brackets[num].data[i].value;

        if (this.summaryMap[this.brackets[num].data[i].key]) {
          value = this.findRealValue(this.brackets[num].data[i].key, value);
        }

        this.condition.push(
          {
            typ: "param",
            name: this.brackets[num].data[i].key,
            from: this.brackets[num].data[i].from,
            description: this.brackets[num].data[i].name,
          },
          {
            typ: "op",
            name: this.brackets[num].data[i].op,
          },
          {
            typ: "param",
            name: value,
          }
        );

        if (i < this.brackets[num].links.length) {
          this.condition.push({
            typ: "op",
            name: this.brackets[num].links[i].val,
          });
        }
      }
      this.condition.push({
        typ: "op",
        name: "right_bracket",
      });
    }

    this.condition.filter((c) => {
      let name = c.name;

      c.name == "left_bracket"
        ? (name = "( ")
        : c.name == "right_bracket"
        ? (name = " )")
        : c.name == "equal"
        ? (name = " = ")
        : c.name == "not_equal"
        ? (name = " != ")
        : c.name == "include"
        ? (name = " ⊇ ")
        : c.name == "exclude"
        ? (name = " ⊉ ")
        : c.name == "bigger"
        ? (name = " > ")
        : c.name == "smaller"
        ? (name = " < ")
        : c.name == "and"
        ? (name = " && ")
        : c.name == "or"
        ? (name = " || ")
        : (name = c.name);

      console.log(name);
      this.conditionFormula += decodeURIComponent(name);
    });
  }

  close() {
    this.dialogRef.close();
  }

  onSubmit({ value, valid }: { value: Audience; valid: boolean }) {
    if (!this.audienceForm) {
      return;
    }
    this.submitted = true;
    if (valid) {
      const data = {
        name: value.name,
        description: value.description,
        conditions: "",
        new_conditions: this.condition,
      };

      this.addAudience(this.app.id, data);
    }
  }

  buildForm() {
    let audienceAry = [];
    this.data.audiences.length != 0
      ? this.data.audiences.map((item) => audienceAry.push(item["name"]))
      : null;
    this.formGroup = {
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          CheckRepeatValidator(audienceAry),
        ],
      ],
      description: [""],
    };
    this.audienceForm = this.fb.group(this.formGroup);
  }

  /* 请求接口，添加定向分分组 */
  addAudience(appid, data) {
    this.apiExperiment.setAudiences(appid, data).then((res) => {
      this.toastrService.success("受众创建成功!");
      this.dialogRef.close("true");
    });
  }

  containChina(str) {
    return /.*[\u4e00-\u9fa5]+.*/.test(str);
  }
}

export const UserFilterEditRouter = {
  path: "app_user_filter_create",
  component: UserFilterCreateComponent,
};
