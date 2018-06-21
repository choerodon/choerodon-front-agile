import axios from 'axios';
import { store, stores } from 'choerodon-front-boot';
import { observable, action, computed, toJS } from 'mobx';

const { AppState } = stores;

@store('BurndownChartStore')
class BurndownChartStore {
    @observable sprintList = [];

    axiosGetBurndownChartData(id, type) {
      return axios.get(`/agile/v1/project/29/reports/${id}/burn_down_coordinate?type=${type}`);
    }
}

const burndownChartStore = new BurndownChartStore();
export default burndownChartStore;
