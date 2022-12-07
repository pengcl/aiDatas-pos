import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { RequestService } from '../../@core/utils/request.service';
import { AppService } from '../../app.service';
import { AuthService } from '../auth/auth.service';
import { GiveInputDto } from '../coupon/coupon.service';

@Injectable({providedIn: 'root'})
export class VipService {
  private memberDetail; // 当前登录的会员信息
  private memberInfo = new BehaviorSubject<any>(this.currentMemberDetail);  // 会员信息
  private freshState = null;
  private freshStatus = new BehaviorSubject<any>(null);

  constructor(private requestSvc: RequestService,
              private appSvc: AppService,
              private authSvc: AuthService) {
  }

  get currentFreshStatus() {
    return this.freshState;
  }

  get currentMemberDetail() {
    return this.memberDetail;
  }

  getFreshStatus(): Observable<any> {
    return this.freshStatus.asObservable();
  }

  updateFreshStatus(freshState: { caller: string, memberParams: any }) {
    this.freshState = freshState;
    this.freshStatus.next(this.freshState);
  }

  // 更新会员资料
  updateMemberDetail(memberDetail) {
    this.memberDetail = memberDetail;
    this.memberInfo.next(this.memberDetail);
  }

  // 清空会员资料
  clearMemberDetail() {
    this.memberDetail = null;
    this.memberInfo.next(this.memberDetail);
  }

  // 订阅会员资料
  getMemberInfo(): Observable<any> {
    return this.memberInfo.asObservable();
  }

  // 会员查询
  memberQuery(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/posMemberQuery', data);
  }

  // 余额结转查询绑定的卡
  queryBindCard(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/queryBindCard', data);
  }

  // 交易记录查询
  queryMemberTradeRecord(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/queryMemberReCardRecord', data);
  }

  // operates
  operates(data: any): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/memberSpecial/list', data);
  }

  // operate
  operate(data: any): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/memberSpecial/save', data);
  }

  // operate
  cancel(uid: string): Observable<any> {
    return this.requestSvc.send('/memberService-api/memberSpecial/cancel', {uid});
  }

  // operateCoupons
  operateCoupons(data: any): Observable<any> {
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/ticketService-api/ticketUsing/queryMemberTicketByUidBill', data);
  }

  // 积分查询
  queryMemberPointsRecord(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/queryMemberRecord', data);
  }

  // 修改会员资料
  updateMemberInfo(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/updateMemberInfo', data);
  }

  // 验证密码
  passwordVerify(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/verifyPassword', data);
  }

  // 修改密码
  passwordChange(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/changePassword', data);
  }

  // 重置密码
  passwordReset(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/resetPassword', data);
  }

  // 读取会员卡旧接口
  readCard(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/readCard', data);
  }

  // 读取卡号查询会员卡新接口
  queryCardByReadCardNo(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.terminalCode = this.authSvc.currentTerminalCode;
    return this.requestSvc.send('/memberService-api/member/queryCardByReadCardNo', data);
  }

  // 判断会员是否已注册
  phoneIfRegister(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/phoneIfRegister', data);
  }

  // 修改前验证
  updateBeforeVerify(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/updateBeforeVerify', data);
  }

  // 创建会员开卡充值
  createMember(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/create', data);
  }

  // 会员充值
  memberCardRecharge(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.terminalCode = this.authSvc.currentTerminalCode;
    return this.requestSvc.send('/memberService-api/member/topUp', data);
  }

  // 充值冲销
  cancelRecharge(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/sterilisation', data);
  }

  // 补卡读取会员卡
  patchReadCard(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/patchReadCard', data);
  }

  // 会员卡升级
  upgradeChangeCard(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.terminalCode = this.authSvc.currentTerminalCode;
    return this.requestSvc.send('/memberService-api/member/upgradeChangeCard', data);
  }

  // 补卡
  reissueCard(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/reissueCard', data);
  }

  // 会员卡注销
  cancellation(data: any): Observable<any> {
    return this.requestSvc.send('/memberService-api/member/cancellation', data);
  }

  // 余额结转
  balanceTransfer(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/balanceTransfer', data);
  }

  // 查询会员卡续费信息
  queryCardRenewal(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/queryCardRenewal', data);
  }

  // 冻结会员卡
  freezeCard(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/freezeCard', data);
  }

  // 解冻会员卡
  thawCard(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/thawCard', data);
  }

  // 查询充值记录
  queryMemCardRecharge(data: any): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    return this.requestSvc.send('/orderService-api/billManagement/queryMemberRechargeBill', data);
  }

  // 查询会员交易记录详情
  queryMemTradeRecordDetail(data: any): Observable<any> {
    return this.requestSvc.send('/orderService-api/posBill/getPosOrderDetail', data);
  }

  // 查询会员票券
  queryMemberTicket(data: any): Observable<any> {
    data.uidOrg = this.authSvc.currentUidOrg;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/ticketService-api/ticketUsing/posQueryMemberTicket', data);
  }

  // 设置默认卡（未实现）
  setDefualtCard(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/setDefaultMemberCard', data);
  }

  // 会员卡续期-积分，直接缴费
  memberCardRenewal(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/memberService-api/member/memberCardRenewal', data);
  }

  // 查询单个会员卡充值活动
  rechargeCampaignQuery(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    data.channelCode = 'QIANTAI';
    return this.requestSvc.send('/campaignService-api/shopcar/rechargeCampaignQuery', data);
  }

  // 查询票券
  coupons(data: any): Observable<any> {
    data.terminalCode = this.authSvc.currentTerminalCode;
    data.accountCinema = this.appSvc.currentCinema.cinemaCode;
    data.uidOrg = this.appSvc.currentOrg;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/ticketService-api/ticket/ticketIssuesList', data);
  }

  // 票券赠送
  give(data: GiveInputDto): Observable<any> {
    data.cinemaCode = this.appSvc.currentCinema.cinemaCode;
    data.uidComp = this.appSvc.currentCinema.uidComp;
    return this.requestSvc.send('/ticketService-api/ticketUsing/tickeGiftReceive', data);
  }
}
