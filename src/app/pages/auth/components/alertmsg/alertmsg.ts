import {AfterViewInit, Component} from '@angular/core';
import {ModalController, NavParams} from '@ionic/angular';
import {AlertmsgService} from './alertmsg.service';


@Component({
  selector: 'app-alertmsg',
  templateUrl: 'alertmsg.html',
  styleUrls: ['alertmsg.scss']
})

export class AlertmsgComponent implements AfterViewInit{

  timer = {
    id : null,
    second : 5,
    title : this.navParams.data.params.title,
    content : this.navParams.data.params.content
  };

  constructor(private modalController: ModalController,
              private navParams: NavParams,
              private alertSvc: AlertmsgService) {
  }

  ngAfterViewInit() {
    if (this.timer.id){
      clearInterval(this.timer.id);
      this.timer.id = null;
      this.timer.second = 5;
    }
    // 倒计时5秒
    this.timer.id = setInterval(() =>  {
      if (this.timer.second <= 1){
        this.close();
      }else{
        this.timer.second--;
      }
    } , 1000);
  }

  close() {
    const data = {
      status : 0
    };
    this.modalController.dismiss(data).then(() => {
      if (this.timer.id){
        clearInterval(this.timer.id);
        this.timer.id = null;
        this.timer.second = 5;
      }
    });
  }

}
