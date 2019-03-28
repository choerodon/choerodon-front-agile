import axios from 'axios';
import {
  observable, action, computed, toJS, reaction,
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';

const { AppState } = stores;

@store('FeatureStore')
class FeatureStore {
  @observable featureList = [];

  @observable epics = [];

  @observable spinIf = false;

  @observable epicVisible = false;

  @observable colorLookupValue = [];

  @observable epicList = [];

  @observable chosenEpic = 'all';

  @observable issueMap = observable.map();

  @observable allPiList = [];

  @observable issueTypes = [];

  @observable defaultPriority = false;

  @observable multiSelected = observable.map();

  @observable clickIssueId = null;

  @observable clickIssueDetail = {};

  @observable isDragging = '';

  @observable selectedIssueId = [];

  @observable issueCantDrag = false;

  @action setFeatureList(data) {
    this.featureList = data;
  }

  @computed get getFeatureList() {
    return this.featureList;
  }

  @action setEpics(data) {
    this.epics = data;
  }

  @computed get getEpics() {
    return this.epics;
  }

  @action setSpinIf(data) {
    this.spinIf = data;
  }

  @computed get getSpinIf() {
    return this.spinIf;
  }

  @action setEpicVisible(data) {
    this.epicVisible = data;
  }

  @computed get getEpicVisible() {
    return this.epicVisible;
  }

  @action toggleVisible() {
    this.epicVisible = !this.epicVisible;
  }

  @computed get getColorLookupValue() {
    return this.colorLookupValue;
  }

  @action setColorLookupValue(data) {
    this.colorLookupValue = data;
  }

  @action setEpicData(data) {
    this.epicList = data;
  }

  @computed get getEpicData() {
    return this.epicList;
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  @computed get getIssueTypes() {
    return this.issueTypes;
  }

  @computed get getIsDragging() {
    return this.isDragging;
  }

  @action setIsDragging(data) {
    this.isDragging = data;
  }

  @action toggleIssueDrag(data) {
    this.issueCantDrag = data;
  }

  @computed get getIssueCantDrag() {
    return this.issueCantDrag;
  }

  @action setDefaultPriority(data) {
    this.defaultPriority = data;
  }

  @computed get getDefaultPriority() {
    return this.defaultPriority;
  }

  @computed get getChosenEpic() {
    return this.chosenEpic;
  }

  @computed get getBacklogData() {
    return this.backlogData;
  }

  @computed get getPiList() {
    return this.allPiList;
  }

  @computed get getIssueMap() {
    return this.issueMap;
  }

  @action setChosenEpic(data) {
    if (data === 'all') {
      this.filterSelected = false;
    }
    this.spinIf = true;
    this.addToEpicFilter(data);
    this.chosenEpic = data;
  }

  @action setFeatureData({ backlogAllFeatures, allPiList }) {
    this.spinIf = false;
    this.issueMap.set('0', backlogAllFeatures);
    this.backlogData = backlogAllFeatures;
    allPiList.forEach((pi) => {
      this.issueMap.set(pi.id.toString(), pi.subFeatureDTOList || []);
    });
    this.allPiList = allPiList;
  }

  getFeatureListData = () => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/pi/backlog_pi_list?organizationId=${AppState.currentMenuType.organizationId}`, {});

  getCurrentEpicList = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/program/epics`);

  @action initData(issueTypes, defaultPriority, epics, listData) {
    if (issueTypes && !issueTypes.failed) {
      this.setIssueTypes(issueTypes);
    }
    if (defaultPriority && !defaultPriority.failed) {
      this.setDefaultPriority(defaultPriority);
    }
    this.setEpics(epics);
    this.setFeatureList(listData);
    this.setFeatureData(listData);
  }

  axiosGetColorLookupValue = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/lookup_values/epic_color`);

  axiosGetEpic = () => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epics`);

  @action initEpicList(epiclist, { lookupValues }) {
    this.colorLookupValue = lookupValues;
    this.epicList = epiclist;
  }

  axiosGetIssueTypes = () => {
    const proId = AppState.currentMenuType.id;
    return axios.get(`/issue/v1/projects/${proId}/schemes/query_issue_types_with_sm_id?apply_type=program`);
  };

  axiosGetDefaultPriority = () => {
    const proId = AppState.currentMenuType.id;
    return axios.get(`/issue/v1/projects/${proId}/priority/default`);
  };

  @action clickedOnce(sprintId, currentClick) {
    const index = this.issueMap.get(sprintId).findIndex(issue => issue.issueId === currentClick.issueId);
    this.multiSelected = observable.map();
    this.multiSelected.set(currentClick.issueId, currentClick);
    this.prevClickedIssue = {
      ...currentClick,
      index,
    };
    this.setClickIssueDetail(currentClick);
  }

  @action setClickIssueDetail(data) {
    this.clickIssueDetail = data;
    if (this.clickIssueDetail) {
      this.clickIssueId = data.issueId;
    }
  }

  @computed get getMultiSelected() {
    return this.multiSelected;
  }

  @action onBlurClick() {
    this.multiSelected = observable.map();
    // this.clickIssueDetail = {};
  }

  @computed get getClickIssueDetail() {
    return this.clickIssueDetail;
  }

  @computed get getClickIssueId() {
    return toJS(this.clickIssueId);
  }

  @computed get getPrevClickedIssue() {
    return this.prevClickedIssue;
  }

  axiosEasyCreateIssue = data => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/issues?applyType=program`, data);

  findOutsetIssue = (sourceIndex, destinationIndex, sourceId, destinationId, destinationArr) => {
    if (sourceId === destinationId) {
      if (sourceIndex < destinationIndex) {
        return destinationArr[destinationIndex];
      } else if (destinationIndex === 0) {
        return destinationArr[destinationIndex];
      } else {
        return destinationArr[destinationIndex - 1];
      }
    } else {
      if (destinationIndex === 0 && destinationArr.length) {
        return destinationArr[destinationIndex];
      } else {
        return destinationArr[destinationIndex - 1];
      }
    }
  };

  @action moveSingleIssue(destinationId, destinationIndex, sourceId, sourceIndex, draggableId, issueItem, type) {
    const sourceArr = this.issueMap.get(sourceId);
    // const revertSourceArr = sourceArr.slice();
    const destinationArr = this.issueMap.get(destinationId);
    // const revertDestinationArr = destinationArr.slice();
    const prevIssue = this.findOutsetIssue(sourceIndex, destinationIndex, sourceId, destinationId, destinationArr);
    const modifiedArr = this.getModifiedArr(issueItem, type);

    if (type === 'single') {
      sourceArr.splice(sourceIndex, 1);
      destinationArr.splice(destinationIndex, 0, issueItem);
      this.issueMap.set(sourceId, sourceArr);
      this.issueMap.set(destinationId, destinationArr);
    } else if (type === 'multi') {
      const modifiedSourceArr = sourceArr.filter(issue => !this.multiSelected.has(issue.issueId));
      destinationArr.splice(destinationIndex, 0, ...[...this.multiSelected.values()]);
      if (!this.multiSelected.has(issueItem.issueId)) {
        modifiedSourceArr.splice(sourceIndex, 1);
        destinationArr.unshift(issueItem);
      }
      if (sourceId === destinationId) {
        const dragInSingleSprint = sourceArr.filter(issue => !this.multiSelected.has(issue.issueId));
        dragInSingleSprint.splice(destinationIndex, 0, ...[...this.multiSelected.values()]);
        this.issueMap.set(destinationId, dragInSingleSprint);
      } else {
        this.issueMap.set(sourceId, modifiedSourceArr);
        this.issueMap.set(destinationId, destinationArr);
      }
    }
    this.multiSelected = observable.map();
    axios.post(`agile/v1/projects/${AppState.currentMenuType.id}/pi/to_pi/${destinationId}`, {
      before: destinationIndex === 0,
      issueIds: modifiedArr,
      outsetIssueId: prevIssue ? prevIssue.issueId : 0,
      rankIndex: destinationId * 1 === 0 || (destinationId === sourceId && destinationId !== 0),
    }).then(this.getFeatureListData).then((res) => {
      this.setFeatureData(res);
    });
  }

  getModifiedArr = (dragItem, type) => {
    const result = [];
    if (!this.multiSelected.has(dragItem.issueId) || type === 'single') {
      result.push(dragItem.issueId);
    }
    if (type === 'multi') {
      result.push(...this.multiSelected.keys());
    }
    return result;
  };

  @action setIssueWithEpic(item) {
    this.selectedIssueId = this.getModifiedArr(item, this.multiSelected.size > 1 ? 'multi' : 'single');
  }

  @computed get getIssueWithEpic() {
    return this.selectedIssueId;
  }

  moveIssuesToEpic = (epicId, ids) => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/pi/to_epic/${epicId}`, ids);
}

const featureStore = new FeatureStore();
export default featureStore;
