import React, { Component } from 'react';
import { observer } from 'mobx-react';
// 用于追踪 Mobx 引起的渲染，非性能调优时可注释
// import { trace } from 'mobx';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Button, Icon, Select, DatePicker, Modal, Input, Form, Tooltip,
} from 'choerodon-ui';
import _ from 'lodash';
import './Issue.scss';
import moment from 'moment';
import { _allowStateChangesInsideComputed } from 'mobx';
import { object } from 'prop-types';
import { loadIssueTypes, loadStatusList, loadPriorities } from '../../../../api/NewIssueApi';
import { getUsers } from '../../../../api/CommonApi';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import IssueFilterControler from '../IssueFilterControler';

// 快速搜索
import QuickSearch from '../../../../components/QuickSearch';
// CSS 利用相邻兄弟选择器注入
import ExpandCssControler from '../ExpandCssControler';
// Table
import IssueTable from '../IssueTable/IssueTable';
// 任务详情
import ExpandWideCard from '../ExpandWideCard';
// 创建问题按钮
import CreateIssueModal from '../CreateIssueModal';

const FileSaver = require('file-saver');

const { AppState } = stores;
const { Option } = Select;
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
@observer
class Issue extends Component {
  /**
   * @param props
   * 新建一个 filterControler 类，用来管理 ajax 请求所发出的对象
   */
  constructor(props) {
    super(props);
    this.state = {
      projectInfo: {},
      issueTypes: [],
      statusLists: [],
      prioritys: [],
      users: [],
      myFilters: [],
      selectedFilterId: undefined,
      selectedMyFilterInfo: {},
      selectedIssueType: [],
      selectedStatus: [],
      selectedPriority: [],
      selectedAssignee: [],
      createStartDate: `${moment().format('YYYY-MM-DD')} 00:00:00`,
      createEndDate: `${moment().format('YYYY-MM-DD')} 23:59:59`,
      saveFilterVisible: false,
      editFilterInfo: [],
      updateFilterName: '',
      isExistFilter: true,
    };
    this.filterControler = new IssueFilterControler();
  }

  componentWillMount() {
    const { location } = this.props;
    if (location.search.indexOf('param') !== -1) {
      this.filterControler.paramConverter(location.search);
    }
  }

  /**
   * 处理传入的 Param（如果有的话）
   * 利用 filterControler 类中的 refresh 方法发出初始化请求（包含优先级，状态，类型，标签数据）
   */
  componentDidMount() {
    this.filterControler.refresh('init').then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        IssueStore.setCurrentSetting(data);
      }
    }).catch((e) => {
      Choerodon.prompt(e);
    });
    this.axiosGetProjectInfo();
    this.axiosGetMyFilterList();
    axios.all([loadIssueTypes(), loadStatusList(), loadPriorities(), getUsers()]).then(axios.spread((issueTypes, statusLists, prioritys, users) => {
      this.setState({
        issueTypes: issueTypes.map(item => ({
          id: item.id,
          name: item.name,
          typeCode: item.typeCode,
        })),
        statusLists: statusLists.map(item => ({
          id: item.id,
          name: item.name,
        })),
        prioritys: prioritys.map(item => ({
          id: item.id,
          name: item.name,
        })),
        users: users.content.filter(item => item.enabled).map(item => ({
          id: item.id,
          realName: item.realName,
        })),
      });
    }));
  }

  /**
   * 清除 filterMap 的数据，清除 BarFilter（展示 Table Filter）内容
   */
  componentWillUnmount() {
    document.getElementsByClassName('page-body')[0].style.overflow = '';
    this.filterControler = new IssueFilterControler();
    this.filterControler.resetCacheMap();
    IssueStore.setBarFilter([]);
  }

  /**
   * 刷新函数
   */
  Refresh = () => {
    this.filterControler = new IssueFilterControler();
    IssueStore.setLoading(true);
    this.filterControler.refresh('refresh').then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        IssueStore.refreshTrigger(data);
      }
    });
  }

  axiosGetProjectInfo = () => {
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`).then((res) => {
      this.setState({
        projectInfo: res,
        createStartDate: `${moment(res.creationDate).format('YYYY-MM-DD')} 00:00:00`,
      });
    });
  }

  axiosGetMyFilterList = () => {
    const { userInfo: { id } } = AppState;
    IssueStore.setLoading(true);
    return axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/query_all/${id}`).then((myFilters) => {
      IssueStore.setLoading(false);
      this.setState({
        myFilters,
        editFilterInfo: _.map(_.map(myFilters, item => ({
          filterId: item.filterId,
        })), (item, index) => ({
          ...item,
          isEditing: false,
          isEditingIndex: index,
        })),
      });
      return myFilters;
    }).catch(() => {
      IssueStore.setLoading(false);
      Choerodon.prompt('获取我的筛选列表失败');
    });
  }

  getSearchFilter = (filterId) => {
    this.filterControler = new IssueFilterControler();
    const { projectInfo, myFilters } = this.state;
    if (filterId) {
      const searchFilterInfo = myFilters.find(item => item.filterId === filterId);
      const { advancedSearchArgs, searchArgs } = searchFilterInfo.personalFilterSearchDTO;
      this.setState({
        selectedMyFilterInfo: searchFilterInfo,
        selectedIssueType: advancedSearchArgs.issueTypeId || [],
        selectedStatus: advancedSearchArgs.statusId || [],
        selectedPriority: advancedSearchArgs.priorityId || [],
        selectedAssignee: advancedSearchArgs.assigneeIds || [],
        createStartDate: moment(searchArgs.createStartDate).format('YYYY-MM-DD HH:mm:ss'),
        createEndDate: moment(searchArgs.createEndDate).format('YYYY-MM-DD HH:mm:ss'),
      }, () => {
        this.filterControler.advancedSearchArgsFilterUpdate(this.state.selectedIssueType, this.state.selectedStatus, this.state.selectedPriority);
        this.filterControler.searchArgsFilterUpdate(this.state.createStartDate, this.state.createEndDate);
        this.filterControler.assigneeFilterUpdate(this.state.selectedAssignee);
        this.updateIssues(this.filterControler);
      });
    } else {
      this.resetFilterSelect();
      IssueStore.setBarFilter([]);
      this.filterControler.advancedSearchArgsFilterUpdate([], [], []);
      this.filterControler.searchArgsFilterUpdate(moment(projectInfo.creationDate).format('YYYY-MM-DD hh:mm:ss'), moment().format('YYYY-MM-DD hh:mm:ss'));
      this.updateIssues(this.filterControler);
    }
  }

  resetFilterSelect = () => {
    const { projectInfo } = this.state;
    this.setState({
      selectedMyFilterInfo: {},
      selectedIssueType: [],
      selectedStatus: [],
      selectedPriority: [],
      selectedAssignee: [],
      createStartDate: `${moment(projectInfo.creationDate).format('YYYY-MM-DD')} 00:00:00`,
      createEndDate: `${moment().format('YYYY-MM-DD')} 23:59:59`,
      updateFilterName: '',
      isExistFilter: true,
    });
  }

  /**
   * 输出 excel
   */
  exportExcel = () => {
    const projectId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    const searchParam = IssueStore.getFilterMap.get('userFilter');
    axios.post(`/zuul/agile/v1/projects/${projectId}/issues/export?organizationId=${orgId}`, searchParam, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xlsx`;
        FileSaver.saveAs(blob, fileName);
      });
  };

  judgeConditionWithFilter = (selectedIssueType, selectedStatus, selectedPriority, selectedAssignee, createStartDate, createEndDate) => {
    const { myFilters } = this.state;
    if (myFilters.length === 0) {
      this.setState({
        isExistFilter: false,
      });
    } else {
      for (let i = 0; i < myFilters.length; i++) {
        const { advancedSearchArgs, searchArgs } = myFilters[i].personalFilterSearchDTO;
        const itemIsEqual = (
          _.isEqual(advancedSearchArgs.issueTypeId.sort(), selectedIssueType.sort()) && (
            _.isEqual(advancedSearchArgs.statusId.sort(), selectedStatus.sort())
          ) && (
            _.isEqual(advancedSearchArgs.priorityId.sort(), selectedPriority.sort())
          ) && (
            _.isEqual(advancedSearchArgs.assigneeIds.sort(), selectedAssignee.sort())
          ) && (
            moment(searchArgs.createStartDate).format('YYYY-MM-DD') === moment(createStartDate).format('YYYY-MM-DD') && moment(searchArgs.createEndDate).format('YYYY-MM-DD') === moment(createEndDate).format('YYYY-MM-DD')
          )
        );
  
        if (itemIsEqual) {
          this.setState({
            selectedFilterId: myFilters[i].filterId,
            isExistFilter: true,
          });
          break;
        } else if (i === myFilters.length - 1 && !itemIsEqual) {
          this.setState({
            selectedFilterId: undefined,
            isExistFilter: false,
          });
        }
      }
    }
  }

 
  handleMyFilterSelectChange = (value) => {
    this.setState({
      selectedFilterId: (value && value.key) || undefined,
    });
    this.getSearchFilter((value && value.key) || undefined);
  }

  handleIssueTypeSelectChange = (value) => {
    const {
      selectedStatus, selectedPriority, selectedAssignee, createStartDate, createEndDate, 
    } = this.state;
    this.setState({
      selectedIssueType: _.map(value, 'key'),
    }, () => {
      this.judgeConditionWithFilter(this.state.selectedIssueType, selectedStatus, selectedPriority, selectedAssignee, createStartDate, createEndDate);
    });
    
    this.filterControler = new IssueFilterControler();
    this.filterControler.advancedSearchArgsFilterUpdate(_.map(value, 'key'), selectedStatus, selectedPriority);
    this.updateIssues(this.filterControler);
  }

  handleStatusSelectChange = (value) => {
    const {
      selectedIssueType, selectedPriority, selectedAssignee, createStartDate, createEndDate, 
    } = this.state;
    this.setState({
      selectedStatus: _.map(value, 'key'),
    }, () => {
      this.judgeConditionWithFilter(selectedIssueType, this.state.selectedStatus, selectedPriority, selectedAssignee, createStartDate, createEndDate);
    });
    this.filterControler = new IssueFilterControler();
    this.filterControler.advancedSearchArgsFilterUpdate(selectedIssueType, _.map(value, 'key'), selectedPriority);
    this.updateIssues(this.filterControler);
  }

  handlePrioritySelectChange = (value) => {
    const {
      selectedIssueType, selectedStatus, selectedAssignee, createStartDate, createEndDate, 
    } = this.state;
    this.setState({
      selectedPriority: _.map(value, 'key'),
    }, () => {
      this.judgeConditionWithFilter(selectedIssueType, selectedStatus, this.state.selectedPriority, selectedAssignee, createStartDate, createEndDate);
    });
    this.filterControler = new IssueFilterControler();
    this.filterControler.advancedSearchArgsFilterUpdate(selectedIssueType, selectedStatus, _.map(value, 'key'));
    this.updateIssues(this.filterControler);
  }

  handleAssigneeSelectChange = (value) => {
    const {
      selectedIssueType, selectedStatus, selectedPriority, createStartDate, createEndDate, 
    } = this.state;
    this.setState({
      selectedAssignee: _.map(value, 'key'),
    }, () => {
      this.judgeConditionWithFilter(selectedIssueType, selectedStatus, selectedPriority, this.state.selectedAssignee, createStartDate, createEndDate);
    });
    this.filterControler = new IssueFilterControler();
    this.filterControler.assigneeFilterUpdate(_.map(value, 'key'));
    this.updateIssues(this.filterControler);
  }
  
  handleCreateDateRangeChange = (dates, datesStrings) => {
    const {
      selectedIssueType, selectedStatus, selectedPriority, selectedAssignee, 
    } = this.state;
    const createStartDate = `${moment(dates[0]).format('YYYY-MM-DD')} 00:00:00`;
    const createEndDate = `${moment(dates[1]).format('YYYY-MM-DD')} 23:59:59`;
    this.setState({
      saveFilterVisible: false,
      createStartDate,
      createEndDate,
    }, () => {
      this.judgeConditionWithFilter(selectedIssueType, selectedStatus, selectedPriority, selectedAssignee, createStartDate, createEndDate);
    });
    this.filterControler = new IssueFilterControler();
    this.filterControler.searchArgsFilterUpdate(createStartDate, createEndDate);
    this.updateIssues(this.filterControler);
  }

  updateIssues = (filterControler) => {
    IssueStore.setLoading(true);
    filterControler.update().then(
      (res) => {
        IssueStore.updateFiltedIssue({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        }, res.content);
      },
    );
  }

  checkMyFilterNameRepeat = filterName => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/check_name?userId=${AppState.userInfo.id}&name=${filterName}`)

  checkMyFilterNameRepeatCreating = (rule, value, callback) => {
    this.checkMyFilterNameRepeat(value).then((res) => {
      if (res) {
        // Choerodon.prompt('筛选名称重复');
        callback('筛选名称重复');
      } else {
        callback();
      }
    });
  }

  checkMyFilterNameRepeatUpdating = (rule, value, callback) => {
    const { updateFilterName } = this.state;
    if (updateFilterName === value) {
      callback();
    } else {
      this.checkMyFilterNameRepeat(value).then((res) => {
        if (res) {
          // Choerodon.prompt('筛选名称重复');
          callback('筛选名称重复');
        } else {
          callback();
        }
      });
    }
  }

  handleSaveFilterOk = () => {
    const {
      selectedIssueType,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      createStartDate,
      createEndDate,
    } = this.state;
    const { form } = this.props;

    form.validateFields(['filterName'], (err, value, modify) => {
      if (!err) {
        const createFilterData = IssueStore.getCreateFilterData;
        // IssueStore.setCreateFilterData(createFilterData, {
        //   name: value.filterName,
        //   personalFilterSearchDTO: {
        //     advancedSearchArgs: {
        //       issueTypeId: selectedIssueType,
        //       statusId: selectedStatus,
        //       assigneeIds: selectedAssignee,
        //       priorityId: selectedPriority,
        //     },
        //     searchArgs: {
        //       createEndDate,
        //       createStartDate,
        //     },
        //   },
        // });
        console.log(IssueStore.getFilterMap.get('userFilter'));
        const personalFilterSearchDTO = IssueStore.setCFDArgs({
          issueTypeId: selectedIssueType,
          statusId: selectedStatus,
          assigneeIds: selectedAssignee,
          priorityId: selectedPriority,
        }, Object.assign(IssueStore.getFilterMap.get('userFilter').searchArgs, {
          createEndDate,
          createStartDate,
        }), IssueStore.getFilterMap.get('userFilter').otherArgs, IssueStore.getFilterMap.get('userFilter').contents);
        IssueStore.setCreateFilterData(createFilterData, { name: value.filterName, personalFilterSearchDTO });
        console.log(IssueStore.getCreateFilterData);

        IssueStore.setLoading(true);
        axios.post(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter`, IssueStore.getCreateFilterData)
          .then((res) => {
            this.axiosGetMyFilterList().then((filterList) => {
              this.setState({
                selectedFilterId: filterList[filterList.length - 1].filterId,
              });
            });
            this.setState({
              saveFilterVisible: false,
              isExistFilter: true,
            });
            form.setFieldsValue({ filterName: '' });
            Choerodon.prompt('保存成功');
          }).catch(() => {
            IssueStore.setLoading(false);
            Choerodon.prompt('保存失败');
          });
      }
    });
  }

  handleFNIBlurOrPressEnter = (filter, filterField) => {
    const { editFilterInfo } = this.state;
    const { form } = this.props;
    form.validateFields([filterField], (err, value, modify) => {
      if (!err && modify) {
        const { myFilters } = this.state;
        IssueStore.setLoading(true);
        const updateData = {
          filterId: filter.filterId,
          objectVersionNumber: _.find(myFilters, item => item.filterId === filter.filterId).objectVersionNumber,
          // name: form.getFieldValue(filterField),
          name: value[filterField],
          projectId: AppState.currentMenuType.id,
          userId: AppState.userInfo.id,
        };
        axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/${filter.filterId}`, updateData).then((res) => {
          this.axiosGetMyFilterList();
          Choerodon.prompt('修改成功');
        }).catch(() => {
          IssueStore.setLoading(false);
          Choerodon.prompt('修改失败');
        });
      } else if (!modify) {
        this.setState({
          editFilterInfo: _.map(editFilterInfo, item => Object.assign(item, { isEditing: false })),
        });
      }
    });
  }

  deBounce = (delay) => {
    let timeout;
    return (fn, that) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(fn, delay, that);// (自定义函数，延迟时间，自定义函数参数1，参数2)
    };
  };

  // ExpandCssControler => 用于向 IssueTable 注入 CSS 样式
  render() {
    const {
      issueTypes, statusLists, prioritys, users, myFilters, saveFilterVisible, editFilterInfo, selectedFilterId, selectedMyFilterInfo, createStartDate, createEndDate, selectedIssueType,
      selectedStatus,
      selectedPriority,
      selectedAssignee,
      isExistFilter,
    } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const filterListVisible = IssueStore.getFilterListVisible;
    // 清除整页滚动条
    if (document && document.getElementsByClassName('page-body').length) {
      // document.getElementsByClassName('page-body')[0].style.overflow = 'hidden';
    }
    const debounceCallback = this.deBounce(500);

    return (
      <Page
        className="c7n-Issue"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithSub']}
      >
        <Header
          title="问题管理"
          backPath={IssueStore.getBackUrl}
        >
          <Button
            className="leftBtn"
            funcType="flat"
            onClick={() => {
              IssueStore.createQuestion(true);
            }}
          >
            <Icon type="playlist_add icon" />
            <span>创建问题</span>
          </Button>
          <Button className="leftBtn" funcType="flat" onClick={() => this.exportExcel()}>
            <Icon type="file_upload icon" />
            <span>导出</span>
          </Button>
          <Button
            funcType="flat"
            onClick={() => {
              this.Refresh();
            }}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content className="c7n-Issue">
          <ExpandCssControler />
          <div
            className="c7n-content-issue"
            style={{
              display: 'block',
              overflowY: 'auto',
              // overflowX: 'hidden',
              padding: '0px 18px',
            }}
          >
            <div className="c7n-mySearch">
              <div style={{ display: 'flex' }}>
                <Select
                  key="myFilterSelect"
                  className="myFilterSelect"
                  allowClear
                  dropdownClassName="myFilterSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="我的筛选"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  filter
                  optionFilterProp="children"
                  onChange={this.handleMyFilterSelectChange}
                  value={selectedFilterId ? { key: selectedFilterId, label: selectedMyFilterInfo.name } : undefined}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    myFilters.length && myFilters.map(item => (
                      <Option key={item.filterId} value={item.filterId} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>

                <Select
                  key="issueTypeSelect"
                  className="issueTypeSelect"
                  mode="multiple"
                  allowClear
                  dropdownClassName="issueTypeSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="问题类型"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handleIssueTypeSelectChange}
                  value={_.map(selectedIssueType, key => (
                    {
                      key,
                      name: _.map(issueTypes, item => item.id === key).name,
                    }
                  ))}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    issueTypes.length && issueTypes.map(item => (
                      <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>

                <Select
                  key="statusSelect"
                  className="statusSelect"
                  mode="multiple"
                  allowClear
                  dropdownClassName="statusSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="状态"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handleStatusSelectChange}
                  value={_.map(selectedStatus, key => (
                    {
                      key,
                      name: _.map(statusLists, item => item.id === key).name,
                    }
                  ))}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    statusLists.length && statusLists.map(item => (
                      <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>

                <Select
                  key="prioritySelect"
                  className="prioritySelect"
                  mode="multiple"
                  dropdownClassName="prioritySelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  allowClear
                  placeholder="优先级"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handlePrioritySelectChange}
                  value={_.map(selectedPriority, key => (
                    {
                      key,
                      name: _.map(prioritys, item => item.id === key).name,
                    }
                  ))}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    prioritys.length && prioritys.map(item => (
                      <Option key={item.id} value={item.id} title={item.name}>{item.name}</Option>
                    ))
                  }
                </Select>

                <Select
                  key="assigneeSelect"
                  className="assigneeSelect"
                  mode="multiple"
                  allowClear
                  dropdownClassName="assigneeSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="经办人"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  filter
                  optionFilterProp="children"
                  onFilterChange={(value) => {
                    if (value) {
                      debounceCallback(() => {
                        axios.get(`/iam/v1/projects/${AppState.currentMenuType.id}/users?size=40&param=${value}`).then((res) => {
                          // Set 用于查询是否有 id 重复的，没有重复才往里加
                          const temp = new Set(users.map(item => item.id));
                          res.content.filter(item => item.enabled).forEach((item) => {
                            if (!temp.has(item.id)) {
                              users.push({
                                id: item.id,
                                realName: item.realName,
                              });
                            }
                          });
                          this.setState({
                            users,
                          });
                        });
                      }, this);
                    }
                  }}
                  onChange={this.handleAssigneeSelectChange}
                  value={_.map(selectedAssignee, key => (
                    {
                      key,
                      name: _.map(users, item => item.id === key).realName,
                    }
                  ))}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    users.length && users.map(item => (
                      <Option key={item.id} value={item.id} title={item.realName}>{item.realName}</Option>
                    ))
                  }
                </Select>
                
                <div className="c7n-createRange">
                  <RangePicker
                    value={[moment(createStartDate), moment(createEndDate)]}
                    format="YYYY-MM-DD hh:mm:ss"
                    allowClear={false}
                    // ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                    onChange={this.handleCreateDateRangeChange}
                    placeholder={['创建时间', '']}
                  />
                </div>
              </div>
              <div className="c7n-mySearchManage">
                {
                  !false && (
                  <Button 
                    funcType="raised" 
                    style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                    onClick={() => {
                      this.setState({
                        saveFilterVisible: true,
                      });
                      IssueStore.setFilterListVisible(false);
                    }}
                  >
                    {'保存筛选'}
                  </Button>
                  )
                }
                {myFilters && myFilters.length > 0 && (
                <Button 
                  funcType="flat" 
                  style={{ color: '#3F51B5' }}
                  onClick={() => {
                    this.setState({
                      saveFilterVisible: false,
                    });
                    IssueStore.setFilterListVisible(!filterListVisible);
                  }}
                >
                  {'筛选管理'}
                </Button>
                )}
                <Modal
                  title="保存筛选"
                  visible={saveFilterVisible}
                  onOk={this.handleSaveFilterOk}
                  onCancel={() => {
                    form.setFieldsValue({ filterName: '' });
                    this.setState({
                      saveFilterVisible: false,
                    });
                  }}
                >
                  <Form className="c7n-filterNameForm">
                    <FormItem>
                      {getFieldDecorator('filterName', {
                        rules: [{
                          required: true, message: '请输入筛选名称',
                        }, { validator: this.checkMyFilterNameRepeatCreating }],
                        validateTrigger: 'onChange',
                      })(
                        <Input
                          label="筛选名称"
                          maxLength={10}
                        />,
                      )}
                    </FormItem>
                  </Form>
                </Modal>
              </div>
            </div>
            <IssueTable style={{ marginTop: 48 }} filterControler={this.filterControler} />
            { filterListVisible ? (
              <div 
                className="c7n-filterList"
                style={{ display: filterListVisible ? 'block' : 'none', width: 350 }}
              >
                <div className="c7n-filterList-header">
                  <span>筛选管理</span>
                  <Icon 
                    type="close"
                    onClick={() => {
                      IssueStore.setFilterListVisible(false);
                    }}
                  />
                </div>
                {
                  myFilters && myFilters.length > 0 && (
                    <ul className="c7n-filterList-content">
                      {
                        myFilters.map(filter => (
                          <li key={filter.filterId} className="c7n-filterList-item">
                            {
                              filter && editFilterInfo && editFilterInfo.find(item => item.filterId === filter.filterId) && editFilterInfo.find(item => item.filterId === filter.filterId).isEditing ? (
                                <Form className="c7n-filterNameForm">
                                  <FormItem>
                                    {getFieldDecorator(`filterName_${filter.filterId}`, {
                                      rules: [{
                                        required: true, message: '请输入筛选名称',
                                      }, {
                                        validator: this.checkMyFilterNameRepeatUpdating,
                                      }],
                                      initialValue: filter.name,
                                    })(
                                      <Input
                                        className="c7n-filterNameInput"
                                        maxLength={10}
                                        onBlur={this.handleFNIBlurOrPressEnter.bind(this, filter, `filterName_${filter.filterId}`)}
                                        onPressEnter={this.handleFNIBlurOrPressEnter.bind(this, filter, `filterName_${filter.filterId}`)}
                                      />,
                                    )}
                                  </FormItem>
                                </Form>
                              ) : (<span>{filter.name}</span>)
                            }
                            <span className="c7n-filterAction">
                              <Tooltip title="修改筛选名称">
                                <Icon
                                  type="mode_edit"
                                  onClick={() => {
                                    const { isEditingIndex } = editFilterInfo.find(item => item.filterId === filter.filterId);
                                    this.setState({
                                      editFilterInfo: [...(_.map(_.filter(editFilterInfo, item => item.isEditingIndex !== isEditingIndex), item => ({
                                        ...item,
                                        isEditing: false,
                                      }))), {
                                        filterId: filter.filterId,
                                        isEditing: true,
                                        isEditingIndex,
                                      }],
                                      updateFilterName: filter.name,
                                    });
                                  }}
                                />
                              </Tooltip>
                              <Tooltip title="删除筛选">
                                <Icon 
                                  type="delete_forever" 
                                  onClick={() => {
                                    IssueStore.setLoading(true);
                                    axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/${filter.filterId}`)
                                      .then((res) => {
                                        this.axiosGetMyFilterList();
                                        Choerodon.prompt('删除成功');
                                      }).catch(() => {
                                        IssueStore.setLoading(false);
                                        Choerodon.prompt('删除失败');
                                      });
                                  }}
                                />
                              </Tooltip>
                            </span>
                          </li>
                        ))
                      }
                    </ul>
                  )
                }
              </div>
            ) : null }
          </div>
          <ExpandWideCard
            issueRefresh={this.Refresh}
          />
          <CreateIssueModal />
        </Content>
      </Page>
    );
  }
}

export default Form.create()(Issue);
