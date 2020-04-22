
export class Mau {
  day: number;
  num: number;
}

export class Free {
  begin: number;
  end: number;
}

export class Pay {
  begin: number;
  end: number;
  num: number;
}

export const UserRole = {
  Owner: 'management.admin',
  Admin: 'management.editor',
  Collaborator: 'management.normalUser'
};

export class UserInfo {
  id: string;
  email: string;
  created_at: Date;
  invite_code: string;
  features: Array<string>;
  actived: boolean;
  operation_info: Object;
  business_info: Array<string>;
  notify_emails: Array<string>;
  // 付费时间段
  pay: Array<Pay>;
  mau: Array<Mau>;
  // api 使用量
  api: Array<Mau>;
  role: string;
  product: string;
  // 免费时间段
  free: Free;

  constructor(opts?: Object) {
    Object.assign(this, opts);
  }

  isFree() {
    return this.free.end * 1000 > Date.now() ? true : false;
  }

  isPay() {
    return this.pay && this.pay.length > 0 ? true : false;
  }

  // 为什么+2 ：当前日期到下一天总是不足24小时，所以需要+1；结束日期当天算1天，所以需要+1；总共需要+2
  getFreeDay() {
    return Math.floor((this.free.end * 1000 - Date.now()) / 1000 / 60 / 60 / 24) + 2;
  }

  // 付费期 还剩多少天 为什么+2 ：当前日期到下一天总是不足24小时，所以需要+1；结束日期当天算1天，所以需要+1；总共需要+2
  getPayDay() {
    let day = -1;
    for (let p of this.pay) {
      if (p.begin * 1000 <= Date.now() && Date.now() <= (p.end + 60 * 60 * 24) * 1000) {
        let endDate;
        this.nextPayDate(p.end) ? endDate = this.nextPayDate(p.end) : endDate = p;
        day = Math.floor((endDate.end * 1000 - Date.now()) / 1000 / 60 / 60 / 24) + 2;
      }
    }
    return day;
  }

  // 查看传入的日期的第二天 是否有付费期 返回连续的付费期中最后一个付费期
  nextPayDate(date) {
    let p;
    let d = date;
    for (var i = 0; i < this.pay.length; i++) {
      if (d + 60 * 60 * 24 === this.pay[i].begin) {
        p = this.pay[i];
        d = this.pay[i].end;
      }
    }
    return p;
  }

  // 获取 付费期 结束日期 （如果当前所处的付费时间段第二天又是一个付费期 那结束日期算下一个时间段）
  getPayLastDate() {
    for (let p of this.pay) {
      if (p.begin * 1000 <= Date.now() && Date.now() <= (p.end + 60 * 60 * 24) * 1000) {
        return this.nextPayDate(p.end) ? this.nextPayDate(p.end) : p;
      }
    }
  }

  // 获取当前时间点 所处在的付费时间段
  getCurPay() {
    for (let p of this.pay) {
      if (p.begin * 1000 <= Date.now() && Date.now() <= (p.end + 60 * 60 * 24) * 1000) {

        return p;
      }
    }
  }

  getLastUsed(): Mau {
    const apis = this.api.sort((a: Mau, b: Mau) => {
      if (a.day === b.day) {
        return 0;
      }
      return a.day > b.day ? 1 : -1;
    });
    const len = this.api.length;
    const curApiUsed = apis[len - 1];
    return curApiUsed;
  }

  getLastPay() {
    const pays = this.pay.sort((a: Pay, b: Pay) => {
      if (a.end === b.end) {
        return 0;
      }
      return a.end > b.end ? 1 : -1;
    });
    const len = this.pay.length;
    const curPay = pays[len - 1];
    return curPay;
  }

  // 判断账户是否在有效期内
  isPayValid() {
    for (let p of this.pay) {
      if (p.begin * 1000 <= Date.now() && Date.now() <= (p.end + 60 * 60 * 24) * 1000) {
        return true;
      }
    }
  }

  getApiUsedRate() {
    const api = this.getLastUsed();
    const pay = this.getCurPay();
    return api['num'] / pay['num'];
  }

  getRoleStr() {
    return UserRole[this.role];
  }

  // 判断免费期的第二天 是否有 付费期，如果有，就不提示到期
  isNextDayPay() {
    for (let p of this.pay) {
      if (this.free.end + 60 * 60 * 24 == p.begin) {
        return true;
      }
    }
  }
}



