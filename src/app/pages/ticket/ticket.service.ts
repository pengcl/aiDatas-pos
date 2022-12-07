import {Injectable} from '@angular/core';
import {ToastService} from '../../@theme/modules/toast';
import {RequestService} from '../../@core/utils/request.service';
import {AuthService} from '../auth/auth.service';
import {Observable, BehaviorSubject} from 'rxjs';

interface FilmsInputDto {
  cinemaCode: string;
  planDate: string;
  uidComp: string;
}

interface FilmInputDto {
  terminalCode: string;
  uidComp: string;
  uidField: string;
  uidPlan: string;
  uidPosShopCart: string;
}

@Injectable({providedIn: 'root'})
export class TicketService {
  private ticketType;
  private selected = {};
  private items;
  private item;
  private info;
  private date;
  private regions;
  private plansStatus = new BehaviorSubject<any>(this.currentPlans);
  private planStatus = new BehaviorSubject<any>(this.currentPlan);
  private selectedStatus = new BehaviorSubject<any>(this.currentSelected);
  private regionsStatus = new BehaviorSubject<any>(this.currentRegions);
  private ticketTypeStatus = new BehaviorSubject<any>(this.currentTicketType);
  private infoStatus = new BehaviorSubject<any>(this.currentInfo);
  private dateStatus = new BehaviorSubject<any>(this.currentDate);
  private forceFreshStatus = new BehaviorSubject<any>(false);
  private time;
  private releaseTime;

  constructor(private requestSvc: RequestService,
              private toastSvc: ToastService,
              private authSvc: AuthService) {
  }

  plans(data: FilmsInputDto): Observable<any> { // 影片列表
    return this.requestSvc.send('/posResuorceService-api/pos/getPosPlanList', data);
  }

  plan(data: FilmInputDto): Observable<any> { // 影片
    return this.requestSvc.send('/posResuorceService-api/pos/getPosPlanTotalInfo', data);
  }

  regionList(data: { uid: string }): Observable<any> {// 座位区域
    return this.requestSvc.send('/posResuorceService-api/posResource/regionList', data);
  }

  counts(plans): Observable<any> { // 影片
    return this.requestSvc.send('/planAndPriceService-api/plan/queryPlanCalList', plans);
  }

  checkDatabase(uidPlan): Observable<any> {
    const data = {
      terminalCode: this.authSvc.currentTerminalCode,
      uidPlan
    };
    return this.requestSvc.send('/posResuorceService-api/pos/getResTimeInt', data);
  }

  addSelected(seats) {
    const currentSelected = this.currentSelected;
    const selected = {};
    const ticketType = this.currentTicketType;
    seats.forEach(seat => {
      if (currentSelected[seat.uid]) {
        selected[seat.uid] = currentSelected[seat.uid];
      } else {
        seat.ticketType = ticketType;
        seat.levelPrice = seat.ticketType.levelPriceDTO.filter(item => {
          return seat.resSeatLevelCode === item.seatLevelCode;
        })[0];
        selected[seat.uid] = seat;
      }
    });
    this.updateSelectedStatus(selected);
  }

  get currentTicketType() {
    return this.ticketType;
  }

  get currentSelected() {
    return this.selected;
  }

  get currentRegions() {
    return this.regions;
  }

  get currentPlans() {
    return this.items;
  }

  get currentPlan() {
    return this.item;
  }

  get currentInfo() {
    return this.info;
  }

  get currentDate() {
    return this.date;
  }

  get currentTime() {
    return this.time;
  }

  get currentReleaseTime() {
    return this.releaseTime;
  }

  getPlansStatus(): Observable<any> {
    return this.plansStatus.asObservable();
  }

  getPlanStatus(): Observable<any> {
    return this.planStatus.asObservable();
  }

  getSelectedStatus(): Observable<any> {
    return this.selectedStatus.asObservable();
  }

  getRegionsStatus(): Observable<any> {
    return this.selectedStatus.asObservable();
  }

  getTicketTypeStatus(): Observable<any> {
    return this.ticketTypeStatus.asObservable();
  }

  getInfoStatus(): Observable<any> {
    return this.infoStatus.asObservable();
  }

  getDateStatus(): Observable<any> {
    return this.dateStatus.asObservable();
  }

  getForceFreshStatus(): Observable<any> {
    return this.forceFreshStatus.asObservable();
  }

  updateForceFreshStatus(status: boolean) {
    this.forceFreshStatus.next(status);
  }

  updatePlanStatus(plan) {
    this.item = plan;
    this.planStatus.next(this.item);
  }

  updatePlansStatus(plans) {
    this.items = plans;
    this.plansStatus.next(this.items);
  }

  updateSelectedStatus(selected) {
    this.selected = selected;
    this.selectedStatus.next(this.selected);
  }

  updateRegionsStatus(regions) {
    this.regions = regions;
    this.regionsStatus.next(this.regions);
  }

  updateTicketTypeStatus(ticketType) {
    this.ticketType = ticketType;
    this.ticketTypeStatus.next(this.ticketType);
  }

  updateInfoStatus(info, unNext?) {
    this.info = info;
    if (unNext) {
      return false;
    }
    this.infoStatus.next(this.info);
  }

  updateDateStatus(date) {
    this.date = date;
    this.dateStatus.next(this.date);
  }

  updateTime(time) {
    this.time = time;
  }

  updateReleaseTime(time) {
    this.releaseTime = time;
  }
}
