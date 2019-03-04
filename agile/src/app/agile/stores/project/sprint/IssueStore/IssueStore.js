import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores } from 'choerodon-front-boot';
import moment from 'moment';
import _ from 'lodash';

const { AppState } = stores;
// 当前跳转是否需要单选信息（跳转单个任务时使用）
let paramIssueSelected = false;

@store('SprintCommonStore')
class SprintCommonStore {
  // 任务信息
  @observable issues = [];

  // 分页信息存取（默认信息）
  @observable pagination = {
    current: 0,
    pageSize: 10,
    total: 0,
  };

  // filter（请求对象）缓存
  @observable filterMap = new Map([
    [
      'filter', {
        advancedSearchArgs: {
          statusId: [],
          priorityId: [],
          issueTypeId: [],
        },
        content: '',
        quickFilterIds: [],
        assigneeFilterIds: null,
        otherArgs: {
          issueIds: [],
          reporter: [],
          component: [],
          epic: [],
          label: [],
          summary: [],
          version: [],
          sprint: [],
        },
        searchArgs: {
          assignee: '',
          component: '',
          epic: '',
          issueNum: '',
          sprint: '',
          summary: '',
          version: '',
          createStartDate: '',
          createEndDate: '',
        },
      },
    ],
    [
      'paramFilter', {},
    ],
    [
      'userFilter', {},
    ],
  ]);

  // paramName 传入值，为项目跳转初始化 Table 的 Filter 名称
  @observable paramFilter = '';

  // 控制 Table Filter 内容（必须是字符串，否则 Filter 内部的 Select 会出现问题）
  @observable barFilter = [];

  // Table Filter 使用的筛选内容
  @observable columnFilter = new Map();

  // 当前加载状态
  @observable loading = true;

  // 创建问题窗口是否展开
  @observable createFlag = false;

  // 问题详情是否展开
  @observable expand = false;

  // 当前选中 Issue 详细信息
  @observable selectedIssue = {};

  // 当前项目默认优先级（QuickCreate，CreateIssue 使用）
  @observable defaultPriorityId = false;

  // 项目优先级
  @observable issuePriority = [];

  // 项目状态
  @observable issueStatus = [];

  // 项目类型
  @observable issueTypes = [];

  // 筛选列表是否显示
  @observable filterListVisible = false;

  @computed get getFilterListVisible() {
    return this.filterListVisible;
  }

  @action setFilterListVisible(data) {
    this.filterListVisible = data;
  }

  /**
   * 创建筛选时传递的数据(筛选的条件数据)
   */
  @observable createFilterData = {
    filterId: 0,
    objectVersionNumber: 0,
    name: '',
    personalFilterSearchDTO: {
      advancedSearchArgs: {
        issueTypeId: [],
        statusId: [],
        assigneeIds: [],
        priorityId: [],
      },
      searchArgs: {
        createStartDate: moment().format('YYYY-MM-DD hh:mm:ss'),
        createEndDate: moment().format('YYYY-MM-DD hh:mm:ss'),
        summary: '',
        issueNum: '',
        reporter: '',
        component: '',
        sprint: '',
        epic: '',
        label: '',
        version: '',
      },
      otherArgs: {
        component: [],
        sprint: [],
        epic: [],
        label: [],
        version: [],
      },
    },
    projectId: AppState.currentMenuType.id,
    userId: AppState.userInfo.id,
  }

  @computed get getCreateFilterData() {
    return toJS(this.createFilterData);
  }

  @action setCreateFilterData(target, origin) {
    this.createFilterData = Object.assign(target, origin);
  }

  @action setCFDArgs(advArgsData, searchArgsData, otherArgsData, contentsData) {
    const { personalFilterSearchDTO } = this.createFilterData;
    if (advArgsData) { personalFilterSearchDTO.advancedSearchArgs = advArgsData; }
    if (searchArgsData) { Object.assign(personalFilterSearchDTO.searchArgs, searchArgsData); }
    if (otherArgsData) { Object.assign(personalFilterSearchDTO.otherArgs, otherArgsData); }
    if (contentsData) { personalFilterSearchDTO.contents = contentsData; }
    return personalFilterSearchDTO;
  }

  // 控制保存按钮是否显示
  @observable isExistFilter = true;

  @computed get getIsExistFilter() {
    return this.isExistFilter;
  }

  @action setIsExistFilter(data) {
    this.isExistFilter = data;
  }

  // 我的筛选列表
  @observable myFilters = [];

  @computed get getMyFilters() {
    return this.myFilters;
  }

  @action setMyFilters(data) {
    this.myFilters = data;
  }

  // 被选中的筛选Id
  @observable selectedFilterId = undefined;

  @computed get getSelectedFilterId() {
    return this.selectedFilterId;
  }

  @action setSelectedFilterId(data) {
    this.selectedFilterId = data;
  }

  /**
   * 跳转至问题管理页时设定传入参数
   * @param paramSelected => Boolean => 单个任务跳转
   * @param paramName => String => 跳转时 paramName 信息
   * @param paramUrl => String => 跳转时 Header 部分 Back 按钮需要的信息
   */
  @action initPram(paramSelected, paramName = null, paramUrl) {
    paramIssueSelected = paramSelected;
    this.paramUrl = paramUrl;
    if (paramName) {
      this.paramFilter = paramName;
      this.barFilter = [paramName];
    }
  }

  /**
   * 设置初始化信息
   * @param res（loadCurrentSetting 返回数据）
   */
  @action setCurrentSetting([issueTypes, issueStatus, issuePriority, tagData, issueComponents, issueVersions, issueEpics, issueSprints, issues]) {
    /* eslint-disable */
    this.issueTypes = issueTypes;
    this.issueStatus = issueStatus;
    this.issuePriority = issuePriority;
    this.tagData = tagData;
    this.issueComponents = issueComponents;
    this.issueVersions = issueVersions;
    this.issueEpics = issueEpics;
    this.issueSprints = issueSprints;
    // 生成 Filter 单选项所需数据
    this.columnFilter = new Map([
      [
        'typeId', this.issueTypes.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      [
        'statusId', this.issueStatus.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      [
        'priorityId', this.issuePriority.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      [
        'label', this.tagData.map(item => ({
          text: item.labelName,
          // value: item.labelId.toString(),
          value: JSON.stringify({id: item.labelId.toString()}),
        }))
      ],
      [
        'component', this.issueComponents.content.map(item => ({
          text: item.name,
          // value: item.componentId.toString(),
          value: JSON.stringify({id: item.componentId.toString()}),
        }))
      ],
      [
        'version', this.issueVersions.map(item => ({
          text: item.name,
          // value: item.versionId.toString(),
          value: JSON.stringify({id: item.versionId.toString()}),
        }))
      ],
      [
        'epic', this.issueEpics.map(item => ({
          text: item.epicName,
          // value: item.issueId.toString(),
          value: JSON.stringify({id: item.issueId.toString()}),
        }))
      ],
      [
        'sprint', this.issueSprints.map(item => ({
          text: item.sprintName,
          // value: item.sprintId.toString(),
          value: JSON.stringify({id: item.sprintId.toString()}),
        }))
      ],
    ]);
    // 设置 issue 信息
    this.issues = issues.content;
    // 设置分页总数
    this.pagination.total = issues.totalElements;
    // 当跳转为单任务时
    if (paramIssueSelected === true) {
      // 设置当前展开任务为请求返回第一项
      this.selectedIssue = this.issues[0];
      this.expand = true;
      paramIssueSelected = false;
    }
    // 退出 loading 状态
    this.loading = false;
    /* eslint-enable */
  }

  /**
   * 重置 filterMap，与受控的 barFilter
   * @param data => Map => 重置所需数据
   */
  @action reset(data) {
    this.issues = [];
    this.filterMap = data;
    this.barFilter = [];
    this.loading = true;
  }

  /**
   * 用于 Table 更新 ajax 请求对象时时重设数据
   * @param pagination => Object => 分页对象
   * @param data => issue 数据
   * @param barFilters => 受控 Table Filter
   */
  @action updateFiltedIssue(pagination, data, barFilters) {
    this.pagination = pagination;
    this.issues = data;
    this.barFilter = barFilters;
    this.loading = false;
  }

  @computed get getParamFilter() {
    return toJS(this.paramFilter);
  }

  @computed get getColumnFilter() {
    return toJS(this.columnFilter);
  }

  @action setFilterMap(data) {
    this.filterMap = data;
  }

  @computed get getFilterMap() {
    return toJS(this.filterMap);
  }

  @action setBarFilter(data) {
    console.log('barFilter:');
    console.log(data);
    this.barFilter = data;
  }

  @computed get getBarFilter() {
    return toJS(this.barFilter);
  }

  @action setIssues(data) {
    this.loading = false;
    this.issues = data;
  }

  @computed get getIssues() {
    return toJS(this.issues);
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  @computed get getIssueTypes() {
    return toJS(this.issueTypes);
  }

  @action setIssueStatus(data) {
    this.issueStatus = data;
  }

  @computed get getIssueStatus() {
    return toJS(this.issueStatus);
  }

  @action setIssuePriority(data) {
    this.issuePriority = data;
  }

  @computed get getIssuePriority() {
    return toJS(this.issuePriority);
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @computed get getLoading() {
    return toJS(this.loading);
  }

  @action createQuestion(data) {
    this.createFlag = data;
  }

  @computed get getCreateQuestion() {
    return this.createFlag;
  }

  @action setClickedRow(data) {
    this.selectedIssue = data.selectedIssue;
    this.expand = data.expand;
  }

  @computed get getSelectedIssue() {
    return toJS(this.selectedIssue);
  }

  @computed get getExpand() {
    return toJS(this.expand);
  }

  @computed get getPagination() {
    return toJS(this.pagination);
  }

  /**
   * 更新时所调用的用于设置数据的函数
   * @param res
   */
  @action refreshTrigger(res) {
    this.issues = res.content;
    this.pagination.total = res.totalElements;
    this.pagination.pageSize = res.size;
    this.pagination.current = res.number + 1;
    this.loading = false;
  }

  /**
   * 用于根据 paramUrl 拼接返回原地址的 URL
   * @returns URL => String => 跳转回源地址的 URL
   */
  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramUrl) {
      return undefined;
    } else if (this.paramUrl === 'backlog') {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&paramIssueId=${this.paramIssueId}&paramOpenIssueId=${this.paramOpenIssueId}`;
    } else {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}`;
    }
  }

  @computed get getDefaultPriorityId() {
    return this.defaultPriorityId;
  }

  @action setDefaultPriorityId(data) {
    this.defaultPriorityId = data;
  }

  judgeConditionWithFilter = () => {
    const myFilters = this.getMyFilters;
    if (myFilters.length === 0) {
      this.setIsExistFilter(false);
    } else {
      for (let i = 0; i < myFilters.length; i++) {
        const {
          advancedSearchArgs, searchArgs, otherArgs, contents, 
        } = myFilters[i].personalFilterSearchDTO;
        const userFilter = this.getFilterMap.get('userFilter');
        const userFilterAdvancedSearchArgs = userFilter.advancedSearchArgs;
        const userFilterSearchArgs = userFilter.searchArgs;
        const userFilterOtherArgs = userFilter.otherArgs;
        const userFilterContents = userFilter.contents || [];
        const advancedSearchArgsIsEqual = _.pull(Object.keys(advancedSearchArgs), 'reporterIds', 'assigneeIds').every(key => _.isEqual(advancedSearchArgs[key].sort(), userFilterAdvancedSearchArgs[key].sort()));
        const assigneeIdsIsEqual = _.isEqual(advancedSearchArgs.assigneeIds.sort(), (userFilter.assigneeFilterIds || []).sort());
        const createStartDateIsEqual = !userFilterSearchArgs.createStartDate || moment(searchArgs.createStartDate).format('YYYY-MM-DD') === moment(userFilterSearchArgs.createStartDate).format('YYYY-MM-DD');
        const createEndDateIsEqual = !userFilterSearchArgs.createEndDate || moment(searchArgs.createEndDate).format('YYYY-MM-DD') === moment(userFilterSearchArgs.createEndDate).format('YYYY-MM-DD');
        const searchArgsIsEqual = createStartDateIsEqual && createEndDateIsEqual && _.pull(Object.keys(searchArgs), 'createStartDate', 'createEndDate', 'assignee').every(key => (searchArgs[key] || '') === (userFilterSearchArgs[key] || ''));
        const otherArgsIsEqual = (otherArgs === null && Object.keys(userFilterOtherArgs).every(key => userFilterOtherArgs[key].length === 0)) || Object.keys(otherArgs).every(key => _.isEqual(otherArgs[key].sort(), userFilterOtherArgs[key].sort()));
        const contentsIsEqual = (contents === null && userFilterContents.length === 0) || _.isEqual(contents.sort(), userFilterContents.sort());
        
        const itemIsEqual = advancedSearchArgsIsEqual && assigneeIdsIsEqual && searchArgsIsEqual && otherArgsIsEqual && contentsIsEqual;
  
        if (itemIsEqual) {
          this.setSelectedFilterId(myFilters[i].filterId);
          this.setIsExistFilter(true);
          break;
        } else if (i === myFilters.length - 1 && !itemIsEqual) {
          this.setSelectedFilterId(undefined);
          this.setIsExistFilter(false);
        }
      }
    }
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
