import React, { Component } from 'react';
import { observer } from 'mobx-react';
// 用于追踪 Mobx 引起的渲染，非性能调优时可注释
// import { trace } from 'mobx';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Button, Icon, Select, DatePicker, Modal, Input, Form,
} from 'choerodon-ui';
import _ from 'lodash';
import './Issue.scss';
import moment from 'moment';
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
const Sidebar = Modal.Sidebar;
@observer
class Issue extends Component {
  /**
   * @param props
   * 新建一个 filterControler 类，用来管理 ajax 请求所发出的对象
   */
  constructor(props) {
    super(props);
    this.state = {
      issueTypes: [],
      statusLists: [],
      prioritys: [],
      users: [],
      myFilters: [{
        id: 1,
        name: 'filter1',
      }, {
        id: 2,
        name: 'filter2',
      }, {
        id: 3,
        name: 'filter3',
      }, {
        id: 4,
        name: 'filter1',
      }, {
        id: 5,
        name: 'filter2',
      }, {
        id: 6,
        name: 'filter3',
      }, {
        id: 7,
        name: 'filter1',
      }, {
        id: 8,
        name: 'filter2',
      }, {
        id: 9,
        name: 'filter3',
      }, {
        id: 10,
        name: 'filter1',
      }, {
        id: 11,
        name: 'filter2',
      }, {
        id: 22,
        name: 'filter3',
      }, {
        id: 13,
        name: 'filter1',
      }, {
        id: 14,
        name: 'filter2',
      }, {
        id: 15,
        name: 'filter3',
      }],
      selectedIssueType: [],
      selectedStatus: [],
      selectedPriority: [],
      selectedAssignee: [],
      earliestCreateDate: moment(),
      latestCreateDate: moment(),
      saveFilterVisible: false,
      filterListVisible: false,
      filterName: '',
      editFilterInfo: [],
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
    const { myFilters } = this.state;
    this.setState({
      editFilterInfo: _.map(_.map(myFilters, item => ({
        id: item.id,
      })), (item, index) => ({
        ...item,
        isEditing: false,
        isEditingIndex: index,
      })),
    });
    this.filterControler.refresh('init').then((data) => {
      if (data.failed) {
        Choerodon.prompt(data.message);
      } else {
        IssueStore.setCurrentSetting(data);
      }
    }).catch((e) => {
      console.log(e);
      Choerodon.prompt(e);
    });

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

  /**
   * 快速搜索函数（内容变动时触发）
   * @param boolean => onlyMeChecked 点击仅我的
   * @param boolean => onlyStoryChecked 点击仅故事
   * @param Array => moreChecked 点击其余选项
   */
  onQuickSearchChange = (onlyMeChecked, onlyStoryChecked, moreChecked) => {
    this.filterControler = new IssueFilterControler();
    this.filterControler.quickSearchFilterUpdate(
      onlyMeChecked,
      onlyStoryChecked,
      moreChecked,
      AppState.userInfo.id,
    );
    IssueStore.setLoading(true);
    this.filterControler.update().then(
      (res) => {
        IssueStore.updateFiltedIssue({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        }, res.content);
      },
    );
  };

  /**
   * 经办人函数（经办人变动时触发）
   * @param Number => value（经办人ID）
   */
  onAssigneeChange = (value) => {
    this.filterControler = new IssueFilterControler();
    this.filterControler.assigneeFilterUpdate(value);
    IssueStore.setLoading(true);
    this.filterControler.update().then(
      (res) => {
        IssueStore.updateFiltedIssue({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        }, res.content);
      },
    );
  };

  handleCreateDateRangeChange = () => {
    this.setState({
      saveFilterVisible: false,
    });
  }

  handleSaveFilterOk = () => {
    this.setState({
      saveFilterVisible: false,
    });
    const { form } = this.props;

    form.validateFields((err, value, modify) => {
      if (!err) {
        this.setState({
          filterName: value.filterName,
        });
        // axios.put(`/agile/v1/projects/${data.projectId}/board/${data.boardId}?boardName=${encodeURIComponent(data.name)}`, data)
        //   .then((res) => {
        //     this.setState({
        //       loading: false,
        //     });
        //     ScrumBoardStore.setBoardList(ScrumBoardStore.getSelectedBoard, res);
        //     Choerodon.prompt('保存成功');
        //     // history.push(`/agile/scrumboard?type=project&id=${data.projectId}&name=${encodeURIComponent(AppState.currentMenuType.name)}&organizationId=${AppState.currentMenuType.organizationId}`);
        //   });
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
      issueTypes, statusLists, prioritys, users, myFilters, saveFilterVisible, filterName, filterListVisible, editFilterInfo,
    } = this.state;
    const { getFieldDecorator } = this.props.form;
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
                  mode="multiple"
                  dropdownClassName="myFilterSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="我的筛选"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  filter
                  optionFilterProp="children"
                  onChange={this.handleAssigneeChange}
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                >
                  {
                    myFilters.length && myFilters.map(item => (
                      <Option key={item.id} value={item.id} title={item.filterName}>{item.filterName}</Option>
                    ))
                  }
                </Select>

                <Select
                  key="issueTypeSelect"
                  className="issueTypeSelect"
                  mode="multiple"
                  dropdownClassName="issueTypeSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="问题类型"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handleAssigneeChange}
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
                  dropdownClassName="statusSelect-dropdown"
                  dropdownMatchSelectWidth={false}
                  placeholder="状态"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handleAssigneeChange}
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
                  placeholder="优先级"
                  labelInValue
                  maxTagCount={0}
                  maxTagPlaceholder={ommittedValues => `${ommittedValues.map(item => item.label).join(', ')}`}
                  onChange={this.handleAssigneeChange}
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
                  onChange={this.handleAssigneeChange}
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
                    ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                    onChange={this.handleCreateDateRangeChange}
                    placeholder={['创建时间', '']}
                  />
                </div>
              </div>
              <div className="c7n-mySearchManage">
                <Button 
                  funcType="raised" 
                  style={{ color: '#fff', background: '#3F51B5', marginRight: 10 }}
                  onClick={() => {
                    this.setState({
                      saveFilterVisible: true,
                    });
                  }}
                >
                  {'保存筛选'}
                </Button>
                <Button 
                  funcType="flat" 
                  style={{ color: '#3F51B5' }}
                  onClick={() => {
                    this.setState({
                      filterListVisible: !filterListVisible,
                    });
                  }}
                >
                  {'筛选管理'}
                </Button>
                <Modal
                  title="保存筛选"
                  visible={saveFilterVisible}
                  onOk={this.handleSaveFilterOk}
                  onCancel={() => {
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
                        }],
                      })(
                        <Input
                          label="筛选名称"
                          // onChange={(e) => {
                          //   this.setState({
                          //     filterName: e.target.value,
                          //   });
                          // }} 
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
                      this.setState({
                        filterListVisible: false,
                      });
                    }}
                  />
                </div>
                {
                  myFilters && myFilters.length > 0 && (
                    <ul className="c7n-filterList-content">
                      {
                        myFilters.map(filter => (
                          <li key={filter.id} className="c7n-filterList-item">
                            {
                              filter && editFilterInfo && editFilterInfo.find(item => item.id === filter.id).isEditing ? (
                                <Form className="c7n-filterNameForm">
                                  <FormItem>
                                    {getFieldDecorator(`filterName_${filter.id}`, {
                                      rules: [{
                                        required: true, message: '请输入筛选名称',
                                      }],
                                      initialValue: filter.name,
                                    })(
                                      <Input
                                        maxLength={10}
                                      />,
                                    )}
                                  </FormItem>
                                </Form>
                              ) : (<span>{filter.name}</span>)
                            }
                            <span className="c7n-filterAction">
                              <Icon
                                type="mode_edit"
                                onClick={() => {
                                  const { isEditingIndex } = editFilterInfo.find(item => item.id === filter.id);
                                  this.setState({
                                    editFilterInfo: [...(_.map(editFilterInfo, (item, index) => {
                                      if (index !== isEditingIndex) {
                                        return {
                                          ...item,
                                          isEditing: false,
                                        };
                                      }
                                    })), {
                                      id: filter.id,
                                      isEditingIndex,
                                      isEditing: true,
                                    }],
                                  }, () => {
                                    console.log(this.state.editFilterInfo);
                                  });
                                }}
                              />
                              <Icon type="delete_forever" />
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
