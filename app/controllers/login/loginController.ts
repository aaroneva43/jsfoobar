import controllers from '../module';
import angular from 'angular';
import { makeObservable, observable, computed, toJS } from 'mobx';

controllers.controller('LoginController', LoginController);


class fooModel {
  value = 0;
  entries = [{a:1},{a:3}];
  constructor() {
    makeObservable(this, {
      value: observable,
      entries: observable,
    })
  }
}
class ViewModel {
  
  ref = new fooModel();

  constructor(price: number) {
    makeObservable(this, {
      ref: observable,
    });
  }

  get deeep() {
    return this.ref.value + 1;
  }

  reset() {
    this.ref = {
      value: 10,
      entries: [{a:11},{a:22}],
    }
  }

  increase(index:number) {
    this.ref.entries.at(index).a += 1;
    console.log(JSON.stringify(toJS(this.ref))); 
    
  }
}

function LoginController() {
  var $ctrl = this;
  $ctrl.store = new ViewModel(2);
}
