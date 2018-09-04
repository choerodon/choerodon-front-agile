import axios from 'axios';
import { observable, action, computed } from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('IterationBoardStore')
class IterationBoardStore {
    @observable sprintDetailData={};

    axiosGetSprintDetailData(pageRequest) {
      return axios.post(`/agile/v1/project/${AppState.currentMenuType.id}/SprintDetail?page=${pageRequest.page}&size=${pageRequest.size}`);
    }
}
