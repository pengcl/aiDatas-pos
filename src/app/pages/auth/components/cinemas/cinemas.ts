import {Component} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {getPage, currentPageData} from '../../../../@theme/modules/pagination/pagination.component';
import {FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-cinemas',
  templateUrl: 'cinemas.html',
  styleUrls: ['../../../../../theme/ion-modal.scss', 'cinemas.scss']
})
export class CinemasComponent {
  cinemas;
  dateSource;
  cinema;
  page = {
    currentPage: 1,
    pageSize: 12
  };
  currentPageData = currentPageData;
  form: FormGroup = new FormGroup({
    cinemaName: new FormControl('')
  });

  constructor(private modalController: ModalController,
              private navParams: NavParams) {
    this.dateSource = this.navParams.data.cinemas;
    this.cinemas = JSON.parse(JSON.stringify(this.dateSource));
    this.page = getPage(this.cinemas, this.page.pageSize);
  }

  setCinema(cinema) {
    this.cinema = cinema;
    this.modalController.dismiss(this.cinema).then();
  }

  query() {
    const search = this.form.get('cinemaName').value;
    this.cinemas = this.dateSource.filter(cinema => {
      return cinema.cinemaName.indexOf(search) !== -1 || cinema.cinemaCode.indexOf(search) !== -1;
    });
    this.page = getPage(this.cinemas, this.page.pageSize);
    /*if (search) {
      const arr = [];
      this.dateSource.forEach(item => {
        if (item.cinemaName.indexOf(search) !== -1 || item.cinemaCode.indexOf(search) !== -1) {
          arr.push(item);
        }
      });
      this.cinemas = arr;
    } else {
      this.cinemas = this.dateSource;
    }*/
  }

  cancel() {
    this.modalController.dismiss(null).then();
  }

  pageChange(e) {
    this.page = e;
  }

}
