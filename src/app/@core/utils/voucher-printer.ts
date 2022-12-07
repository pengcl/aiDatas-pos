import {Injectable} from '@angular/core';
import {AuthService} from '../../pages/auth/auth.service';
import {AppService} from '../../app.service';
import {RequestService} from './request.service';
import {Observable} from 'rxjs';
import {PublicUtils} from './public-utils';

@Injectable({providedIn: 'root'})
export class VoucherPrinter {

  constructor(private authSvc: AuthService,
              private appSvc: AppService,
              private requestSvc: RequestService,
              private publicUtils: PublicUtils) {

  }

  // 根据keyCode或去参数配置中的打印机型号
  // printerMovieTicket  影票打印机
  // printerMer          卖品打印机
  // printerCouTicket    票券打印机
  // cardReader	         读卡器
  // cardType	           卡类型
  // terSaleScoTicket    零售终端售卖范围
  // terSaleScoMer	     零售终端售卖范围
  // merSaleWare	       卖品销售出库关联仓库
  getModelCodeByKey(keyCode){
    const systemSet = this.appSvc.currentSettings;
    let printModelCode = '';
    systemSet.forEach(it => {
      if (it.keyCode === keyCode) {
        printModelCode = it.valueCode;
      }
    });
    return printModelCode;
  }

  print(paramData, printUrl, callBack){
    let isPrint = true;
    const cinema = this.appSvc.currentCinema;
    if (cinema){
      paramData.uidComp = cinema.uidComp;
      const printlist = cinema.teminalVoPrintList;
      if (paramData.typeCodePrint === 'jiaoyixipiao'){
        // 是否打印交易小票
        let printFlag = true;
        printlist.forEach(item => {
          if (paramData.billHaveGoods === 'ticket_and_mer'){
            // 影票 + 卖品
            if (item.dicCode === 'printMoTicket'){
              if (item.dicValue === '0'){
                printFlag = false;
              }else{
                printFlag = true;
              }
            }
            if (item.dicCode === 'printMerTicket'){
              if (item.dicValue === '0'){
                printFlag = false;
              }else{
                printFlag = true;
              }
            }
          }else if (paramData.billHaveGoods === 'ticket'){
            // 纯影票
            if (item.dicCode === 'printMoTicket'){
              if (item.dicValue === '0'){
                printFlag = false;
              }else{
                printFlag = true;
              }
            }
          }else if (paramData.billHaveGoods === 'mer'){
            // 纯卖品
            if (item.dicCode === 'printMerTicket'){
              if (item.dicValue === '0'){
                printFlag = false;
              }else{
                printFlag = true;
              }
            }
          }else{
            printFlag = false;
          }
        });
        isPrint = printFlag;
      }else{
        printlist.forEach(item => {
          if (item.dicCode === paramData.dicCode){
            // console.log('paramData.dicCode', paramData.dicCode);
            if (item.dicValue !== '1'){
              isPrint = false;
            }
          }
        });
      }
    }
    if (!isPrint){
      callBack({status: '-1', msg: '不需打印'});
      return;
    }
    let printModelCode = '';
    if (paramData.typeCode === 'T001'){
      // 交易影票打印机
      printModelCode = this.getModelCodeByKey('printerMovieTicket');
    }else{
      // 交易小票打印机器
      printModelCode = this.getModelCodeByKey('printerMer');
    }
    if (printModelCode === ''){
      callBack({status: '-2', msg: '找不到对应的打印机'});
      return;
    }
    const methodName = printUrl ? printUrl : '/printTempletService-api/templetPrint/print';
    this.invokeInterface(paramData, methodName).subscribe(result => {
      const printResult = {
        status: '0',
        msg: '打印成功',
        typeCode: paramData.typeCode
      };
      if (result.status.status === '0' || result.status.status === 0) {// 成功
        if (result.data){
          // console.log('printData--->', JSON.stringify(result.data));
          this.publicUtils.printTicketTemplate(printModelCode, result.data, (res) => {
            // console.log('printTicketTemplate->result-->', res);
            if (res.status === '0' || res.status === 0){
              printResult.status = '0';
              printResult.msg = '打印成功';
            }else{
              printResult.status = res.status + '';
              printResult.msg = '打印失败';
            }
          });
        }else{
          printResult.status = result.status.status + '';
          printResult.msg = result.status.msg2Client;
        }
      }else{
        printResult.status = result.status.status + '';
        printResult.msg = result.status.msg2Client;
      }
      if (callBack){
        // console.log('callBack--->', printResult);
        callBack(printResult);
      }else{
        // console.log('callBack---hint-->', printResult);
        let tipType = 'danger';
        if (result.status.status === '0' || result.status.status === 0){
          tipType = 'success';
        }
        alert(printResult.msg);
      }
    });
  }

  printTask(taskList, callBack){
    taskList.forEach(item => {
      this.print(item, null, callBack);
    });
  }

  invokeInterface(data , methodName): Observable<any> {
    return this.requestSvc.send(methodName, data);
  }

}
