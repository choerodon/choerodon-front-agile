/**
 * IssueFilterControler
 * 用于拼接 Issue 整体页面的请求，根据页面函数需求返回相应的请求结果
 * 由以下内容组成
 * cache：用于缓存用户请求内容的 Map，由
 * */
import { axios, stores } from 'choerodon-front-boot';
import IssueStore from '../../../stores/project/sprint/IssueStore';

const { AppState } = stores;


export default class IssueFilterControler {
  /**
   * cache => Map => 用于缓存用户修改的 filter
   * paramName => String => 用户跳转进问题列表时的 ParamName
   * orderDTO => Object => 用于存取用户排序信息
   */
  constructor() {
    this.cache = IssueStore.getFilterMap;
    this.paramName = '';
    this.orderDTO = {};
  }

  /**
   * 转换用户传入的 Param（? 之后的 URL）
   */
  paramConverter = (url) => {
    // 将 URL 中包含 param 的部分都取出来，并重组成为对象数组
    // 例如：
    // ?type=project&id=28&name=Choerodon敏捷管理
    // &organizationId=4&paramType=version&paramId=209
    // &paramName=0.12下的问题&paramUrl=release/detail/209
    // 只取出 paramType、paramId、paramName、paramUrl
    const reg = /[?&]param[^=]+=[^&?\n]*/g;
    const filter = this.cache.get('filter');
    let paramIssueSelected = false;
    const paramObj = {};
    url.match(reg).forEach((item) => {
      const [tempKey, paramValue] = item.split('=');
      const paramKey = tempKey.substring(1);
      Object.assign(paramObj, {
        [paramKey]: paramValue,
      });
    });
    // 版本跳转 => otherArgs 设置对应 tpye 所需信息
    if (paramObj.paramType && paramObj.paramId) {
      filter.otherArgs[paramObj.paramType] = [paramObj.paramId];
    }
    // 单个任务跳转 => otherArgs 设置 issueId，将任务设定为展开模式
    if (paramObj.paramIssueId) {
      filter.otherArgs.issueIds = [paramObj.paramIssueId.toString()];
      paramIssueSelected = true;
    }
    // 暂时未知的跳转
    filter.otherArgs.resolution = paramObj.resolution;
    // 缓存初始化过的 filter，存入 store
    this.cache.set('paramFilter', filter);
    IssueStore.setFilterMap(this.cache);
    // 将 URL 中的 paramName 转码，传入 initPram 进行处理/存取
    this.paramName = decodeURI(paramObj.paramName);
    IssueStore.initPram(paramIssueSelected, this.paramName, paramObj.paramUrl);
  };

  /**
   * 刷新函数，根据 mode 返回不同的 Promise 请求
   * @param mode => String => 判断需要返回哪种 Promise 请求
   * paramFilter 不为空对象时，返回初始化时缓存在 cache 中的 paramFilter 对象
   * paramFilter 为空对象时，返回新建 Class 时默认创建的 filter 对象
   */
  refresh = (mode) => {
    // 存在 paramFilter 时调用 paramFilter 进行刷新
    if (Object.keys(this.cache.get('paramFilter')).length) {
      return IssueFilterControler.loadCurrentSetting(this.cache.get('paramFilter'), mode);
    } else {
      return IssueFilterControler.loadCurrentSetting(this.cache.get('filter'), mode);
    }
  };

  /**
   *
   * @param filters => Object =>
   * @param mode => String =>
   *   init: 首次加载时请求的 Promise，包含优先级，问题类型，问题状态，问题标签，以及问题数据
   *   refresh: 刷新时请求的 Promise，仅请求问题数据
   * @param page => Number => 页数
   * @param size => Number => 当前每页显示数量，
   * @returns Promise.all / Promise
   */
  static loadCurrentSetting(filters, mode, page = 0, size = 10) {
    if (mode === 'init') {
      const loadType = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_issue_types_with_sm_id?apply_type=agile`);
      const loadStatus = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/schemes/query_status_by_project_id?apply_type=agile`);
      const loadPriorities = axios.get(`/issue/v1/projects/${AppState.currentMenuType.id}/priority/list_by_org`);
      const loadLabel = axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_labels`);
      const loadIssue = axios.post(
        `/agile/v1/projects/${AppState.currentMenuType.id}/issues/include_sub?organizationId=${AppState.currentMenuType.organizationId}&page=${page}&size=${size}`, filters,
      );
      return Promise.all([loadType, loadStatus, loadPriorities, loadLabel, loadIssue]);
    } else {
      return axios.post(
        `/agile/v1/projects/${AppState.currentMenuType.id}/issues/include_sub?organizationId=${AppState.currentMenuType.organizationId}&page=${page}&size=${size}`, filters,
      );
    }
  }

  /**
   * 闭包函数，先生成一个 filter（paramFilter 不为空对象时利用 paramFilter 生成）
   * 之后再次调用时，根据当前的 mode 生成相应的对象
   * @returns {Function}
   */
  initArgsFilter() {
    const filter = Object.keys(this.cache.get('paramFilter')).length ? this.cache.get('paramFilter') : this.cache.get('filter');
    return (modes, data) => {
      switch (modes) {
        case 'advArgs':
          this.updateCache(
            Object.assign(filter.advancedSearchArgs, data),
          );
          break;
        case 'otherArgs':
          this.updateCache(
            Object.assign(filter.otherArgs, data),
          );
          break;
        case 'content':
        case 'onlyStory':
        case 'quickSearch':
        case 'assigneeSearch':
          this.updateCache(
            Object.assign(filter, data),
          );
          break;
        case 'quickFilterIds':
          this.updateCache(
            Object.assign(filter.quickFilterIds, data),
          );
          break;
        case 'assigneeFilterIds':
          this.updateCache(
            Object.assign(filter.assigneeFilterIds, data),
          );
          break;
        case 'searchArgs':
          this.updateCache(
            Object.assign(filter.searchArgs, data),
          );
          break;
        default:
          break;
      }
    };
  }

  /**
   * Table Filter 更新时所生成的请求
   * @param page => Number => 页数
   * @param size => Number => 当前单个分页任务数
   * @param orderDTO => Object => 排序对象
   * @param barFilters => Array => 让 Table Filter 受控的数组
   * @returns {Promise}
   */
  update = (page = 0, size = 10, orderDTO = {}, barFilters = []) => {
    // 如果当前页面是从其他页跳转过来，且受控的 barFilters 中没有跳转时设定的 paramName
    // 说明用户清除了 barFilter 中跳转时的默认操作
    // 清除当前 cache 中 userFilter 里的 otherArgs，并设置进 store 中
    if (IssueStore.getParamFilter && barFilters.indexOf(IssueStore.getParamFilter) === -1) {
      const filter = this.cache.get('userFilter');
      Object.assign(filter.otherArgs, {
        component: [],
        epic: [],
        issueIds: [],
        label: [],
        reporter: [],
        summary: [],
        version: [],
      });
      this.cache.set('userFilter', filter);
      IssueStore.setFilterMap(this.cache);
    }
    return axios.post(
      `/agile/v1/projects/${AppState.currentMenuType.id}/issues/include_sub?organizationId=${AppState.currentMenuType.organizationId}&page=${page}&size=${size}`, this.cache.get('userFilter'), {
        params: this.setOrderDTO(orderDTO),
      },
    );
  };

  /**
   * 将传入的值设置到 cache 中健为 userFilter 的部分
   * @param data
   */
  updateCache = (data) => {
    this.cache.set('userFilter', data);
  };

  /**
   *
   * @param orderDTO => Object => 排序对象
   * @returns Object => ajax 请求时所需要的排序对象
   */
  setOrderDTO(orderDTO) {
    const { column } = orderDTO;
    let { order = '' } = orderDTO;
    if (order) {
      order = order === 'ascend' ? 'asc' : 'desc';
    }
    this.orderDTO = {
      sort: `${column && order ? `${column.sorterId},${order}` : ''}`,
    };
    return this.orderDTO;
  }

  /**
   * 更新快速搜索对象的函数
   * @param onlyMeChecked => Boolean => 是否启用仅我的问题
   * @param onlyStoryChecked => Boolean => 是否启用仅故事
   * @param moreChecked => Array => 快速搜索 ID
   * @param userID => 当前项目中自己的 ID，与 onlyMeChecked 配合使用
   */
  quickSearchFilterUpdate(onlyMeChecked, onlyStoryChecked, moreChecked, userID) {
    const setArg = this.initArgsFilter();
    setArg(
      'advArgs',
      { assigneeIds: onlyMeChecked ? [userID] : [] },
    );
    setArg(
      'onlyStory',
      { onlyStory: onlyStoryChecked },
    );
    setArg(
      'quickSearch',
      { quickFilterIds: moreChecked },
    );
  }

  /**
   * 更新经办人的函数
   * @param value => Number => 当前经办人 ID
   */
  assigneeFilterUpdate(value) {
    const setArg = this.initArgsFilter();
    setArg(
      'assigneeSearch',
      { assigneeFilterIds: value.length === 0 ? null : value },
    );
  }

  /**
   * 重置当前 cache
   */
  resetCacheMap = () => {
    this.cache = new Map([
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
            component: [],
            epic: [],
            issueIds: [],
            label: [],
            reporter: [],
            summary: [],
            version: [],
          },
          searchArgs: {
            assignee: '',
            component: '',
            epic: '',
            issueNum: '',
            sprint: '',
            summary: '',
            version: '',
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
    IssueStore.reset(this.cache);
  }
}
