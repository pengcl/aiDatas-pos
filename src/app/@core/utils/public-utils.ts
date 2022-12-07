import {Injectable} from '@angular/core';
import {AuthService} from '../../pages/auth/auth.service';
import {AppService} from '../../app.service';

@Injectable({providedIn: 'root'})
export class PublicUtils {
  aidaShell = (window as any).aidaShell;

  constructor(private appSvc: AppService, private authSvc: AuthService) {

  }

  // 调用打印机
  // keyCode 参数配置的systemSet.keyCode
  // printTemplateDatas 打印的数据
  // callback  回调方法
  printTicketTemplate(printModelName, printTemplateDatas, callback) {
    if (!printModelName || printModelName === '') {
      printModelName = 'Microsoft Print to PDF';
    }
    // console.log('public_utils-printTicketTemplate-->', printTemplateDatas);
    if (!this.aidaShell || !this.aidaShell.printVoucherByJson) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'print_ticket_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg) => {
        // console.log('printCallback: ' + status + ' # ' + msg);
        callback({status, msg});
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.printVoucherByJsonUseMM(aideSellCallName, printModelName, printTemplateDatas, 10000);
  }

  // 获取读卡器端口
  getCardReaderList(cardReaderPort, callback) {
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'getCardReaderList_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg, data) => {
        console.log('readCardCallback: ' + status + ' # ' + msg + data);
        callback({status, msg, data});
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.getCardReaderList(aideSellCallName);
  }

  // 获取卡片类型
  getCardTypeList(cardReaderType, callback) {
    console.log('public_utils-readCard-->', cardReaderType);
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'getCardTypeList_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg, data) => {
        console.log('readCardCallback: ' + status + ' # ' + msg);
        callback({status, msg, data});
        this.aidaShell.cancelCallBack(aideSellCallName);
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.getCardTypeList(aideSellCallName);
  }

  // 读取卡片号
  readCardSerialNum(callback) {
    console.log('public_utils-readCard-->');
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const systemSet = this.appSvc.currentSettings;
    if (systemSet === null || !(systemSet instanceof Array)) {
      callback({status: 'e2', msg: '获取系统设置为空'});
      return;
    }
    let cardReader = null, cardType = null;
    systemSet.forEach(it => {
      if (it.keyCode === 'cardReader') {
        cardReader = it.valueCode;
      } else if (it.keyCode === 'cardType') {
        cardType = it.valueCode;
      }
    });
    if (cardReader === null) {
      callback({status: 'e3', msg: 'cardReader为空'});
      return;
    }
    if (cardType === null) {
      callback({status: 'e4', msg: 'cardType为空'});
      return;
    }
    this.aidaShell.readCardMemberID((status, msg, data) => {
      if (status === 0){
        callback({status, msg, data});
      }else if (status === -3) {
        if(msg &&  msg.indexOf("Can't open card reader device") > -1){
          callback({status, msg: '找不到读卡器，请检查是否已连接', data});
        }else{
          callback({status, msg, data});
        }
      }else {
        this.changePwd(2);
        this.aidaShell.readCardMemberID((status1, err1, data1) => {
          if (status1 !== 0) {
            this.changePwd(0);
            this.aidaShell.readCardMemberID((status2, err2, data2) => {
              this.changePwd(1);
              callback({status: status2, msg: err2, data: data2});
            }, cardType, cardReader);
          } else {
            this.changePwd(1);
            callback({status: status1, msg: err1, data: data1});
          }
        }, cardType, cardReader);
      }
    }, cardType, cardReader);
  }

  changePwd(flag) {
    switch (flag) {
      case 0:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 1, 'FFFFFFFFFFFF');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 2, 'FFFFFFFFFFFF');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, 'FFFFFFFFFFFF');
        break;
      case 1:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, '383333333030');
        break;
      case 2:
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 1, '383333333030');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 2, '383333333030');
        this.aidaShell.setCardCustomPwd((status, err) => {
        }, 'OrstMemberCard', 3, '383333333030');
        break;
    }
  }

  // 设置IC卡读写密码
  setCardCustomPwd(readCardData, callback) {
    console.log('public_utils-readCard-->', readCardData);
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'setCardCustomPwd_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg) => {
        console.log('readCardCallback: ' + status + ' # ' + msg);
        callback({status, msg});
        this.aidaShell.cancelCallBack(aideSellCallName);
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.setCardCustomPwd(aideSellCallName, 'OrstMemberCard', 3, '383333333030');
  }

  // 存储IC卡卡号
  writeCardMemberID(cardNo, callback) {
    console.log('public_utils-writeCardMemberID-->', cardNo);
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const systemSet = this.appSvc.currentSettings;
    if (systemSet === null || !(systemSet instanceof Array)) {
      callback({status: 'e2', msg: '获取系统设置为空'});
      return;
    }
    let cardReaderCode = null;
    systemSet.forEach(it => {
      if (it.keyCode === 'cardReader') {
        cardReaderCode = it.valueCode;
        return;
      }
    });
    if (cardReaderCode === null) {
      callback({status: 'e3', msg: 'cardReader为空'});
      return;
    }
    console.log(cardReaderCode);
    const cardTypeCode = 'OrstMemberCard';

    const aideSellCallName = 'writeCardMemberID_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg) => {
        console.log('writeCardMemberID: ' + status + ' # ' + msg);
        callback({status, msg});
        this.aidaShell.cancelCallBack(aideSellCallName);
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    // setCardCustomPwd
    this.aidaShell.writeCardMemberID(aideSellCallName, cardTypeCode, cardReaderCode, cardNo);

  }

  // 读取IC卡卡号
  readCardMemberID(readCardMemberID, callback) {
    console.log('public_utils-readCard-->', readCardMemberID);
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'readCardMemberID_callback_' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg, data) => {
        console.log('readCardMemberID: ' + status + ' # ' + msg);
        callback({status, msg});
        this.aidaShell.cancelCallBack(aideSellCallName);
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.readCardMemberID(aideSellCallName, 'OrstMemberCard', 'Q-M8_Reader');
  }

  // 获取支持的打印机列表
  getPrinterList(getPrinterCallback, callback) {
    console.log('public_utils-readCard-->', getPrinterCallback);
    if (!this.aidaShell) {
      callback({status: 'e1', msg: 'aidaShell为空或未找到该方法'});
      return;
    }
    const aideSellCallName = 'getPrinterCallback' + (new Date()).getTime();
    try {
      this.aidaShell.registerCallBack(aideSellCallName, (status, msg, data) => {
        console.log('getPrinterCallback: ' + status + ' # ' + msg);
        callback({status, msg, data});
        this.aidaShell.cancelCallBack(aideSellCallName);
      });
    } catch (e) {
      callback({status: 'e1', msg: e.description});
    }
    this.aidaShell.getPrinterList(aideSellCallName);
  }

  // 获取读卡设置
  getCardType() {
    let cardType = 1; // 设置默认值为1
    const systemSet = this.appSvc.currentSettings;
    if (systemSet === null || !(systemSet instanceof Array)) {
      console.log('systemSet为空了');
      return cardType;
    }
    systemSet.forEach(it => {
      if (it.keyCode === 'cardType') {
        if (it.valueCode === 'CommonIdCard') {
          cardType = 2; // ID卡
        } else {
          cardType = 1; // IC卡
        }
        return;
      }
    });
    return cardType;
  }
}
