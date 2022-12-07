import {Injectable} from '@angular/core';


@Injectable({providedIn: 'root'})
export class Pagination {
  /**
   * 重新生成分页参数与分页数据
   * {每页数据条数}   size
   * {页码数}        page
   * {全部数据}      data
   * {Function}     callback
   * callback (pageParams, currentPageData)
   * pageParams: 分页的标准
   * currentPageData: 当前页的数据
   */
  getPageData(size, curPage, data, callback) {
    // 计算总页数和总数据条数
    const totalPageSize    = Math.ceil(data.length / size);
    const totalCount = data.length;
    // 计算当前页是否为首页 是否为尾页
    const isFirstPage = curPage === 0 ? true : false;
    const isLastPage  = curPage === totalPageSize - 1 ? true : false;
    // 根据分页参数计算当前页应该显示的数据 slice数组元素分割
    const showData = data.slice(0 + curPage * size, size + curPage * size);
    // 获取当前页总共有多少条数据
    const showDataCount = showData.length;
    const showPage = curPage + 1;

    // 重新生成分页参数
    const pageParams = {
      size,             // 每页数据条数
      showPage,
      curPage,             // 页码数
      isLastPage,             // 是否首页
      isFirstPage,            // 是否尾页
      totalPageSize,       // 总页数
      totalCount,       // 总数据条数
      showData,  // 当前页应该显示的数据
      showDataCount  // 当前页有几条数据
    };
    // 回调
    callback(pageParams);
  }

}
