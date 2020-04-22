import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { ApiExperiment } from 'adhoc-api';
import { ApiAuth } from 'adhoc-api';
import { Experiment } from '../../../../model/experiment';
import { VersionStatus, StatusDict, VersionTyp } from '../../../../model/version';


@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss']
})
export class LogComponent implements OnInit {
  @Output() isShowLog = new EventEmitter<boolean>();
  @Input() versions: Experiment;
  @Input() groupId: string;
  @Input() expType: string;
  StatusDict = StatusDict;
  VersionStatus = VersionStatus;
  VersionTyp = VersionTyp;
  FlagNum = 0;

  curUser = {
    id: '',
    email: ''
  };
  userEmail: string;
  memberEmails = {};

  versionList = {};

  options = {
     create: '创建试验',
     delVariable: '移除变量',
     addVariable: '添加变量',
     delIndex: '移除指标',
     addIndex: '添加指标',
     updatFlow: '调整试验流量',
     addVersion: '添加版本',
     delVersion: '删除版本',
     updateVersionName: '修改版本名称',
     updateUrl: '修改页面链接',
     start: '开始试验',
     stop: '停止试验'
  };

  logs: Array<Object>;

  constructor(private apiExp: ApiExperiment,
    private apiAuth: ApiAuth) { 
    this.logs = new Array<Object>();
  }

  ngOnInit() {

    this.getVersionList();

    this.getUser(async () =>{
      const log = await this.apiExp.getChangeLogs(this.groupId);
      const members = await this.apiAuth.getMembers();

        for(let l of log){
          if( l.user_id == this.curUser.id ){
            this.userEmail = this.curUser.email;
            this.getLogs(l);
          }else {
            this.userEmail = (members.find(item => item.id === l.user_id) || {email: ''})['email'];
            this.getLogs(l);
          }
        }
      })
    
  }


  getVersionList(){
    for(let v in this.versions){
      let id =this.versions[v].id;
      let name =this.versions[v].name;
      this.versionList[id] = name;
    }
  }

  async getUser(callback){
    const user = await this.apiAuth.getUser()
      this.curUser.id = user['id'];
      this.curUser.email = user['email'];
      return callback();
    
  }

  async getUserByid(userid,callback){
    const user = await this.apiAuth.getUserById(userid)
      this.userEmail = user['email'];
      return callback();
    
  }

  getLogs(l) {

        // 创建试验
        this.logCreate(l);

        // 添加变量/删除变量
        if ((this.versions[0].typ !== this.VersionTyp.EXP_TYPE_BUILD) && (this.versions[0].typ !== this.VersionTyp.EXP_TYPE_URL)) {
         this.logFlag(l);
        }

        // 添加指标/删除指标
        this.logStats(l);

        // 调整流量
        this.logFlow(l);

        // 新建版本
        this.logCreateVersion(l);

        // 删除版本
        this.logDeleteVersion(l);

        // 更改版本名称、描述
        this.logVersionName(l);

        // 修改版本链接
        this.logUrl(l);

        // 开始试验
        this.logStart(l);

        this.logs = this.logs.sort((a, b) => {
          return a['date'] - b['date'];
        });
  }


  // 创建试验
  logCreate(l){
    if(l.group_change){
      if( l.group_change.method == 'create' ){
        let log = {
          person: this.userEmail,
          time: Date(),
          date: l.created_at,
          option: '',
          detail: Array<any>()
        }
        log.time = new Date(l.created_at * 1000).toLocaleString();
  
        log.option = this.options.create;
        log.detail.push(l.group_change.after.name);
        this.logs.unshift(log);
      }
    }
  }

  // 添加变量/删除变量
  logFlag(l){
    if( l.experiment_changes ){
      let log = {
        person: this.userEmail,
        time: Date(),
        date: l.created_at,
        option: '',
        detail: Array<any>()
      }
      let isChangeFlags = false;
  
      log.time = new Date(l.created_at * 1000).toLocaleString();
  
      for( let key in l.experiment_changes ){
        let beforeFlagsNum = 0;
        let afterFlagsNum = 0;
  
        if( !l.experiment_changes[key].before.annotation && !l.experiment_changes[key].after.annotation && JSON.stringify(l.experiment_changes[key].before.flags) != JSON.stringify(l.experiment_changes[key].after.flags) ){
  
          let beforeFlagsStr = '';
          for( let k in l.experiment_changes[key].before.flags ){
            beforeFlagsNum++;
            beforeFlagsStr = beforeFlagsStr + k + ' = ' + l.experiment_changes[key].before.flags[k] + ' ';
          }
          beforeFlagsStr ? '' : beforeFlagsStr = '无';
        
          log.detail.push(this.versionList[key] + ' 更改之前的变量：'  + beforeFlagsStr);
  
          let afterFlagsStr = '';
          for( let k in l.experiment_changes[key].after.flags ){
            afterFlagsNum++;
            afterFlagsStr = afterFlagsStr + k + ' = ' + l.experiment_changes[key].after.flags[k] + ' ';
          }
          afterFlagsStr ? '' : afterFlagsStr = '无';
          log.detail.push(this.versionList[key] + ' 更改之后的变量：' + afterFlagsStr);
          beforeFlagsNum < afterFlagsNum ? log.option = this.options.addVariable : log.option = this.options.delVariable;
          isChangeFlags = true;
        }
      }
      isChangeFlags ? this.logs.unshift(log) : '';
    }
  }

  // 添加指标/删除指标
  logStats(l){
    if( l.experiment_changes ){
      let log = {
        person: this.userEmail,
        time: Date(),
        date: l.created_at,
        option: '',
        detail: Array<any>()
      }
      log.time = new Date(l.created_at * 1000).toLocaleString();
      let isChangeIndex = false;

      if(this.expType == this.VersionTyp.EXP_TYPE_URL){
        for( let key in l.experiment_changes ){
          if( l.experiment_changes[key].before.stats && l.experiment_changes[key].after.stats && (l.experiment_changes[key].before.stats.toLocaleString() !== l.experiment_changes[key].after.stats.toLocaleString()) && (l.experiment_changes[key].before.stats.length>0 || l.experiment_changes[key].after.stats.length>0)){
            let beforeStats = l.experiment_changes[key].before.stats;
            let afterStats = l.experiment_changes[key].after.stats;
  
            beforeStats.length < afterStats.length ? log.option = this.options.addIndex : log.option = this.options.delIndex;
            isChangeIndex = true;
  
            beforeStats.length > 0 || afterStats.length > 0 ? 
            log.detail.push((this.versionList[key] || '[已删除版本]') + ' ' + log.option + '：' + this.findDiff(beforeStats, afterStats)) : '';
  
          }
        }
        isChangeIndex ? this.logs.unshift(log) : '';
  
      }else{
        let oneOfExpKey = Object.keys(l.experiment_changes)[0];
        let thisExpChange = l.experiment_changes[oneOfExpKey]
  
          if(thisExpChange){
          if( thisExpChange.before.stats && thisExpChange.after.stats && (thisExpChange.before.stats.toLocaleString() !== thisExpChange.after.stats.toLocaleString()) && (thisExpChange.before.stats.length>0 || thisExpChange.after.stats.length>0)){
           
            let beforeStats = thisExpChange.before.stats;
            let afterStats = thisExpChange.after.stats;
       
            beforeStats.length < afterStats.length ? log.option = this.options.addIndex : log.option = this.options.delIndex;
            isChangeIndex = true;
            let textMsg = '';
            
            textMsg = log.option + '：' + this.findDiff(beforeStats, afterStats);
            beforeStats.length > 0 || afterStats.length > 0 ? log.detail.push(textMsg) : '';
            
          }
          
          isChangeIndex ? this.logs.unshift(log) : '';
        }
      }
    }
  }

  findDiff(arrayA, arrayB){
    return arrayA.concat(arrayB).filter(v => !arrayA.includes(v) || !arrayB.includes(v))
  }

  // 调整流量
  logFlow(l){
    if( l.experiment_changes ){
      let log = {
        person: this.userEmail,
        time: Date(),
        date: l.created_at,
        option: '',
        detail: Array<any>()
      }
      let isChangeFlow = false;
      for( let key in l.experiment_changes ){
        if( (l.experiment_changes[key].before.traffic || l.experiment_changes[key].before.traffic ==0) && (l.experiment_changes[key].after.traffic || l.experiment_changes[key].after.traffic ==0) && (l.experiment_changes[key].before.traffic !=l.experiment_changes[key].after.traffic) ){
          log.time = new Date(l.created_at * 1000).toLocaleString();
          log.detail.push('调整了' + this.versionList[key] + '流量：' + l.experiment_changes[key].before.traffic + '%为' + l.experiment_changes[key].after.traffic + '%');
          log.option = this.options.updatFlow;
          isChangeFlow = true;
        }
      }
      isChangeFlow ? this.logs.unshift(log) : '';
    }
  }
  

  // 新建版本
  logCreateVersion(l){
    if( !l.group_change && l.experiment_changes ){
      for( let key in l.experiment_changes ){
        if(l.experiment_changes[key].method === 'create'){
          let log = {
            person: this.userEmail,
            time: Date(),
            date: l.created_at,
            option: '',
            detail: Array<any>()
          }
          log.time = new Date(l.created_at * 1000).toLocaleString();
          log.option = this.options.addVersion;
          log.detail.push(l.experiment_changes[key].after.name);
          this.logs.unshift(log);
        }
      }
    }
  }

    // 删除版本
  logDeleteVersion(l){
    if( !l.group_change && l.experiment_changes ){
      for( let key in l.experiment_changes ){
        if (l.experiment_changes[key].method === 'delete') {
          let log = {
            person: this.userEmail,
            time: Date(),
            date: l.created_at,
            option: '',
            detail: Array<any>()
          }
          log.time = new Date(l.created_at * 1000).toLocaleString();
          log.option = this.options.delVersion;
          log.detail.push(l.experiment_changes[key].before.name);
          this.logs.unshift(log);
        }
      }
    }
  }

  // 更改版本名称、描述
  logVersionName(l){
    if( l.experiment_changes ){
      for( let key in l.experiment_changes){
        if( l.experiment_changes[key].before.name && (l.experiment_changes[key].before.name != l.experiment_changes[key].after.name && l.experiment_changes[key].after.name) ){
          let log = {
            person: this.userEmail,
            time: Date(),
            date: l.created_at,
            option: '',
            detail: Array<any>()
          }
          log.time = new Date(l.created_at * 1000).toLocaleString();
          log.option = this.options.updateVersionName;
          log.detail.push(l.experiment_changes[key].before.name + ' 将名称更改为 ' + l.experiment_changes[key].after.name);
  
          this.logs.unshift(log);
        }
      }
    }
  }

  // 修改版本链接
  logUrl(l){
    if( l.experiment_changes ){
      for( let key in l.experiment_changes ){
        if( l.experiment_changes[key].before.annotation && l.experiment_changes[key].after.annotation && JSON.stringify(l.experiment_changes[key].before.annotation.base_url) != `""` && JSON.stringify(l.experiment_changes[key].before.annotation.base_url) != JSON.stringify(l.experiment_changes[key].after.annotation.base_url) ){
          let log = {
            person: this.userEmail,
            date: l.created_at,
            time: Date(),
            option: '',
            detail: Array<any>()
          }
          log.time = new Date(l.created_at * 1000).toLocaleString();
          log.detail.push('修改了' + (this.versionList[key] || '[已删除版本]') + '链接：' + l.experiment_changes[key].before.annotation.base_url + '为' + l.experiment_changes[key].after.annotation.base_url);
          log.option = this.options.updateUrl;
          this.logs.unshift(log);
        }
  
      }
    }
  }


  // 开始试验
  logStart(l){
    if( l.group_change && l.group_change.method == 'update' && l.experiment_changes ){
      let log = {
        person: this.userEmail,
        time: Date(),
        date: l.created_at,
        option: '',
        detail: Array<any>()
      }
      log.time = new Date(l.created_at * 1000).toLocaleString();
  
      let beforeStatus;
      let afterStatus;
  
      let isChangeStatus = false;
  
      for (let key in l.experiment_changes) {
        if(l.experiment_changes[key].before.status && l.experiment_changes[key].after.status && l.experiment_changes[key].before.status != l.experiment_changes[key].after.status) {
          beforeStatus = l.experiment_changes[key].before.status;
          afterStatus = l.experiment_changes[key].after.status;
          isChangeStatus = true;
        }
      }
      if(isChangeStatus){
        // log.detail.push( '试验状态由 ' + this.StatusDict[beforeStatus] + ' 更改为 ' + this.StatusDict[afterStatus] );
        // log.detail.push( '修改试验状态为：' + this.StatusDict[afterStatus] );
        log.detail.push((this.StatusDict[afterStatus] === 'statusDict.active') ? '开始运行试验' : '停止运行试验') ;
        
        VersionStatus.Run == afterStatus ? log.option = this.options.start :
        VersionStatus.Stop == afterStatus ? log.option = this.options.stop : '';
        this.logs.unshift(log);
      }
      
    }
  }


  closeLog() {
    this.isShowLog.emit(false);
  }

}
