import axios from 'axios';
import { observable, action, computed } from 'mobx';
import { store, stores } from 'choerodon-front-boot';
import { loadSprintIssues, loadSprint } from '../../../api/NewIssueApi';

const { AppState } = stores;

@store('IterationBoardStore')
class IterationBoardStore {
    @observable sprints=[];

    @observable currentSprint={};

    @observable doneData=[];

    @observable undoData=[];

    @observable undoAndNotEstimated =[];

    @observable loading =true;

    @computed getSprints() {
      return this.sprints();
    }

    @action setSprints(data) {
      this.sprints = data;
    }

    @computed get getCurrentSprint() {
      return this.currentSprint;
    }

    @action setCurrentSprint(data) {
      this.currentSprint = data;
    }

    @computed get getDoneData() {
      return this.doneData;
    }

    @action setDoneData(data) {
      this.doneData = data;
    }

    @computed get getUndoData() {
      return this.undoData;
    }

    @action setUndoData(data) {
      this.undoData = data;
    }

    @computed getUndoAndNotEstimated() {
      return this.undoAndNotEstimated;
    }

    @action setUndoAndNotEstimated(data) {
      this.undoAndNotEstimated = data;
    }

    @computed getLoading() {
      return this.loading;
    }

    @action setLoading(data) {
      this.loading = data;
    }

    axiosGetDoneData(pageRequest) {
      this.setLoading(true);
      loadSprintIssues(this.currentSprint.sprintId, 'done')
        .then((res) => {
          this.setDoneData(res.content);
          this.setLoading(false);
        });
      // /agile/v1/projects/316/sprint/415/issues?status=unfinished&page=0&size=99999
    }
}
