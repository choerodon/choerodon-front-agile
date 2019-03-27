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

    @observable PIAimsLoading = false;

    @computed get getPIAimsLoading() {
      return toJS(this.PIAimsLoading);
    }

    @action setPIAimsLoading(data) {
      this.PIAimsLoading = data;
    }

    @observable PiList = [];
    
    @computed get getPiList() {
      return toJS(this.PiList);
    }

    @action setPiList(data) {
      this.PiList = data;
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

    @observable createStretch = false;

    @computed get getCreateStretch() {
      return toJS(this.createStretch);
    }

    @action setCreateStretch(data) {
      this.createStretch = data;
    }
}

const piStore = new PIStore();

export default piStore;
