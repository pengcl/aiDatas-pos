import {Injectable, ElementRef} from '@angular/core';
import {Observable, Subject} from 'rxjs';

export declare interface Status {
  status: boolean;
  calculate: boolean;
  selected: any;
  start: { x: number, y: number };
  end: { x: number, y: number };
}

@Injectable({providedIn: 'root'})
export class MouseService {
  status: Status = {status: false, calculate: false, selected: [], start: {x: 0, y: 0}, end: {x: 0, y: 0}};
  private elementsStatus = new Subject<Status>();

  constructor() {
  }

  get currentStatus(): Status {
    return this.status;
  }

  getElementsStatus(): Observable<Status> {
    return this.elementsStatus.asObservable();
  }

  updateElementsStatus(status: Status) {
    this.status = status;
    this.elementsStatus.next(this.status);
  }

  clearElements(): Status {
    this.status = {status: false, calculate: false, selected: [], start: {x: 0, y: 0}, end: {x: 0, y: 0}};
    this.elementsStatus.next(this.status);
    return this.status;
  }
}
