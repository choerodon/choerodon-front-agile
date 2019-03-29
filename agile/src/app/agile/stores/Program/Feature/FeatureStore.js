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

  @observable prevClickedIssue = null;

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

  @action updateEpic(epic) {
    const updateIndex = this.epicList.findIndex(item => epic.issueId === item.issueId);
    this.epicList[updateIndex].epicName = epic.epicName;
    this.epicList[updateIndex].objectVersionNumber = epic.objectVersionNumber;
    this.epicList[updateIndex].color = epic.color;
  }

  @action moveEpic(sourceIndex, destinationIndex) {
    const movedItem = this.epicList[sourceIndex];
    const { issueId, objectVersionNumber } = movedItem;
    this.epicList.splice(sourceIndex, 1);
    this.epicList.splice(destinationIndex, 0, movedItem);
    const req = {
      beforeSequence: destinationIndex !== 0 ? this.epicList[destinationIndex - 1].epicSequence : null,
      afterSequence: destinationIndex !== (this.epicList.length - 1) ? this.epicList[destinationIndex + 1].epicSequence : null,
      epicId: issueId,
      objectVersionNumber,
    };
    this.handleEpicDrap(req).then(
      action('fetchSuccess', (res) => {
        if (!res.message) {
          this.epicList[destinationIndex] = {
            ...movedItem,
            epicSequence: res.epicSequence,
            objectVersionNumber: res.objectVersionNumber,
          };
        } else {
          this.epicList.splice(destinationIndex, 1);
          this.epicList.splice(sourceIndex, 0, movedItem);
        }
      }),
    );
  }

  handleEpicDrap = data => axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issues/epic_drag`, data);

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

  @computed get getPrevClickedIssue() {
    return this.prevClickedIssue;
  }

  @action setChosenEpic(data) {
    if (data === 'all') {
      this.filterSelected = false;
    }
    this.spinIf = true;
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

  getFeatureListData = () => {
    const args = {};
    if (this.chosenEpic !== 'all') {
      if (this.chosenEpic === 'unset') {
        args.advancedSearchArgs.noEpic = 'true';
      } else {
        args.advancedSearchArgs.epicId = this.chosenEpic;
      }
    }
    return axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/pi/backlog_pi_list?organizationId=${AppState.currentMenuType.organizationId}`, args);
  };

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

  checkStartAndEnd = (prevIndex, currentIndex) => (prevIndex > currentIndex ? [currentIndex, prevIndex] : [prevIndex, currentIndex]);

  @action dealWithMultiSelect(sprintId, currentClick, type) {
    const data = this.issueMap.get(sprintId);
    const currentIndex = data.findIndex(issue => currentClick.issueId === issue.issueId);
    if (this.prevClickedIssue && this.prevClickedIssue.sprintId === currentClick.sprintId) {
      // 如果以后想利用 ctrl 从多个冲刺中选取 issue，可以把判断条件2直接挪到 shift 上
      // 但是请考虑清楚操作多个数组可能带来的性能开销问题
      if (type === 'shift') {
        this.dealWithShift(data, currentIndex);
      } else if (type === 'ctrl') {
        this.dealWithCtrl(data, currentIndex, currentClick);
      }
    } else {
      this.clickedOnce(currentClick, currentIndex);
    }
  }

  @action dealWithShift(data, currentIndex) {
    const [startIndex, endIndex] = this.checkStartAndEnd(this.prevClickedIssue.index, currentIndex);
    for (let i = startIndex; i <= endIndex; i += 1) {
      this.multiSelected.set(data[i].issueId, data[i]);
    }
  }

  @action dealWithCtrl(data, currentIndex, item) {
    if (this.multiSelected.has(item.issueId)) {
      const prevClickedStatus = this.multiSelected.get(item.issueId);
      if (prevClickedStatus) {
        this.multiSelected.delete(item.issueId);
      } else {
        this.multiSelected.set(item.issueId, item);
      }
    } else {
      this.multiSelected.set(data[currentIndex].issueId, data[currentIndex]);
    }
    this.prevClickedIssue = {
      ...item,
      index: currentIndex,
    };
  }

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

  openPI = piData => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/pi/start`, piData);

  closePI = piData => axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/pi/close`, piData);

  axiosUpdateIssue(data) {
    return axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/issues`, data);
  }
}

const featureStore = new FeatureStore();
export default featureStore;
