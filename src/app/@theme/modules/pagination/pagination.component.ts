import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  OnInit
} from '@angular/core';
import {PageDto} from './pagination.dto';

export const getPage = (items, pageSize?) => {
  const realItems = items.filter(item => {
    return !!item;
  });
  const page: PageDto = {
    currentPage: 1,
    pageSize: pageSize ? pageSize : 10,
    totalPage: 0,
    totalSize: 0
  };
  if (realItems) {
    page.totalPage = Math.ceil(realItems.length / (pageSize ? pageSize : 10));
    page.totalSize = realItems.length;
  }
  return page;
};

export const currentPageData = (items, page: PageDto) => {
  if (!items) {
    return [];
  }
  const currentPageItems = items.slice((page.currentPage - 1) * page.pageSize, page.currentPage * page.pageSize);
  return currentPageItems;
};

@Component({
  selector: 'pagination',
  exportAs: 'Pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['pagination.component.scss']
})
export class PaginationComponent implements OnInit, OnDestroy {
  @Input() vertical = false;
  @Input() page: PageDto = {
    currentPage: 1,
    pageSize: 10,
    startIndex: 0,
    totalPage: 0,
    totalSize: 0
  };
  @Output() change = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
  }

  prev(isDisabled) {
    if (!isDisabled) {
      this.page.currentPage = this.page.currentPage - 1;
      this.change.next(this.page);
    }
  }

  next(isDisabled) {
    if (!isDisabled) {
      this.page.currentPage = this.page.currentPage + 1;
      this.change.next(this.page);
    }
  }

  ngOnDestroy(): void {
  }
}
