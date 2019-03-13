import axios from 'axios';
import {
  observable, action, computed, toJS, 
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';

const { AppState } = stores;
const format = 'YYYY-MM-DD';

@store('PIStore')
class PIStore {
    @observable PIListLoading = false;

    @computed get getPIListLoading() {
      return toJS(this.PIListLoading);
    }

    @action setPIListLoading(data) {
      this.PIListLoading = data;
    }

    @observable PIDetailLoading = false;

    @computed get getPIDetailLoading() {
      return toJS(this.PIDetailLoading);
    }

    @action setPIDetailLoading(data) {
      this.PIDetailLoading = data;
    }

    @observable PiList = [];
    
    @computed get getPiList() {
      return toJS(this.PiList);
    }

    @action setPiList(data) {
      this.PiList = data;
      if (window.sessionStorage) {
        sessionStorage.PiList = JSON.stringify(data);
      }
    }

    @observable PiAims = {}
      
    @computed get getPiAims() {
      return toJS(this.PiAims);
    }
  
    @action setPiAims(data) {
      this.PiAims = data;
    }

    @observable editPIVisible=false;

    @computed get getEditPIVisible() {
      return toJS(this.editPIVisible);
    }

    @action setEditPIVisible(data) {
      this.editPIVisible = data;
    }

    @observable createPIVisible=false;

    @computed get getCreatePIVisible() {
      return toJS(this.createPIVisible);
    }

    @action setCreatePIVisible(data) {
      this.createPIVisible = data;
    }

    @observable editPiAimsCtrl = [];

    @computed get getEditPiAimsCtrl() {
      return toJS(this.editPiAimsCtrl);
    }

    @action setEditPiAimsCtrl(data) {
      this.editPiAimsCtrl = data;
    }
}

const piStore = new PIStore();

export default piStore;
