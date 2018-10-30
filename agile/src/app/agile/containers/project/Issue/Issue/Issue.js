import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Table, Button, Tooltip, Input, Dropdown, Menu, Pagination, Icon, Divider, Checkbox, Popover, Modal,
} from 'choerodon-ui';
import './Issue.scss';

import IssueStore from '../../../../stores/project/sprint/IssueStore';

import { TYPE, ICON, TYPE_NAME } from '../../../../common/Constant';
import pic from '../../../../assets/image/问题管理－空.png';
import { loadIssue, createIssue } from '../../../../api/NewIssueApi';
import EditIssue from '../../../../components/EditIssueWide';
import CreateIssue from '../../../../components/CreateIssueNew';
import UserHead from '../../../../components/UserHead';
import PriorityTag from '../../../../components/PriorityTag';
import StatusTag from '../../../../components/StatusTag';
import TypeTag from '../../../../components/TypeTag';
import EmptyBlock from '../../../../components/EmptyBlock';

const FileSaver = require('file-saver');

const { AppState } = stores;
const { Column } = Table;
const CheckboxGroup = Checkbox.Group;
const { Sidebar } = Modal;

@observer
class Issue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      create: false,
      selectedIssue: {},
      createIssue: false,
      selectIssueType: 'task',
      createIssueValue: '',
      createLoading: false,
    };
  }

  componentDidMount() {
    this.getInit();
  }

  getInit() {
    const Request = this.GetRequest(this.props.location.search);
    const {
      paramType, paramId, paramName, paramStatus,
      paramPriority, paramIssueType, paramIssueId, paramUrl, paramOpenIssueId,
    } = Request;
    IssueStore.setParamId(paramId);
    IssueStore.setParamType(paramType);
    IssueStore.setParamName(paramName);
    IssueStore.setParamStatus(paramStatus);
    IssueStore.setParamPriority(paramPriority);
    IssueStore.setParamIssueType(paramIssueType);
    IssueStore.setParamIssueId(paramIssueId);
    IssueStore.setParamUrl(paramUrl);
    IssueStore.setParamOpenIssueId(paramOpenIssueId);
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
    if (paramStatus) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      // const a = [paramStatus];
      const a = paramStatus.split(',');
      obj.advancedSearchArgs.statusCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      // IssueStore.setFilteredInfo({ statusCode: [paramStatus] });
      IssueStore.setFilteredInfo({ statusCode: paramStatus.split(',') });
      IssueStore.loadIssues();
    } else if (paramPriority) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      const a = [paramPriority];
      obj.advancedSearchArgs.priorityCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ priorityCode: [paramPriority] });
      IssueStore.loadIssues();
    } else if (paramIssueType) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      const a = [paramIssueType];
      obj.advancedSearchArgs.typeCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ typeCode: [paramIssueType] });
      IssueStore.loadIssues();
    } else if (paramIssueId) {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues()
        .then((res) => {
          this.setState({
            selectedIssue: res.content.length ? res.content[0] : {},
            expand: true,
          });
        });
    } else {
      IssueStore.setBarFilters(arr);
      IssueStore.init();
      IssueStore.loadIssues();
    }

    // if (paramOpenIssueId) {

    //   IssueStore.setBarFilters(arr);
    //   IssueStore.init();
    //   IssueStore.loadIssues()
    //     .then((res) => {
    //       this.setState({
    //         selectedIssue: res.content.length && res.content.filter(item => item.issueId === paramOpenIssueId)[0],
    //         expand: true,
    //       });
    //     });
    // }
  }

  GetRequest = (url) => {
    const theRequest = {};
    if (url.indexOf('?') !== -1) {
      const str = url.split('?')[1];
      const strs = str.split('&');
      for (let i = 0; i < strs.length; i += 1) {
        theRequest[strs[i].split('=')[0]] = decodeURI(strs[i].split('=')[1]);
      }
    }
    return theRequest;
  }

  handleCreateIssue = (issueObj) => {
    const { history } = this.props;
    const {
      type, id, name, organizationId,
    } = AppState.currentMenuType;
    this.setState({ create: false });
    IssueStore.init();
    IssueStore.loadIssues();
    if (issueObj) {
      history.push(`/agile/issue?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}&paramName=${issueObj.issueNum}&paramIssueId=${issueObj.issueId}&paramOpenIssueId=${issueObj.issueId}`);
    }
  }

  handleIssueUpdate = (issueId = this.state.selectedIssue.issueId) => {
    loadIssue(issueId).then((res) => {
      const obj = {
        assigneeId: res.assigneeId,
        assigneeName: res.assigneeName,
        imageUrl: res.assigneeImageUrl || '',
        issueId: res.issueId,
        issueNum: res.issueNum,
        priorityCode: res.priorityCode,
        priorityName: res.priorityName,
        projectId: res.projectId,
        statusCode: res.statusCode,
        statusColor: res.statusColor,
        statusName: res.statusName,
        summary: res.summary,
        typeCode: res.typeCode,
      };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = obj;
      IssueStore.setIssues(originIssues);
    });
  }

  handleBlurCreateIssue = () => {
    if (this.state.createIssueValue !== '') {
      const { history } = this.props;
      const {
        type, id, name, organizationId,
      } = AppState.currentMenuType;


      axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/project_info`)
        .then((res) => {
          const data = {
            priorityCode: res.defaultPriorityCode || 'medium',
            projectId: AppState.currentMenuType.id,
            sprintId: 0,
            summary: this.state.createIssueValue,
            typeCode: this.state.selectIssueType,
            epicId: 0,
            epicName: this.state.selectIssueType === 'issue_epic' ? this.state.createIssueValue : undefined,
            parentIssueId: 0,
          };
          this.setState({
            createLoading: true,
          });
          createIssue(data)
            .then((response) => {
              IssueStore.init();
              IssueStore.loadIssues();
              this.setState({
                createIssueValue: '',
                createLoading: false,
              });
              history.push(`/agile/issue?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}&paramName=${response.issueNum}&paramIssueId=${response.issueId}&paramOpenIssueId=${response.issueId}`);
            })
            .catch((error) => {
            });
        });
    }
  }

  handleChangeType = ({ key }) => {
    this.setState({
      selectIssueType: key,
    });
  }

  handlePageChange = (pagination, filters, sort, params) => {
    this.loadRole(pagination, sort, filters, params);
  };

  handlePaginationChange = (page, pageSize) => {
    IssueStore.loadIssues(page - 1, pageSize);
  };

  handlePaginationShowSizeChange = (current, size) => {
    IssueStore.loadIssues(current - 1, size);
  };

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    Object.keys(filters).forEach((key) => {
      if (key === 'statusCode' || key === 'priorityCode' || key === 'typeCode') {
        IssueStore.setAdvArg(filters);
      } else if (key === 'issueId') {
        // 根据接口进行对象调整
        IssueStore.setArg({ issueNum: filters[key][0] });
      } else if (key === 'assigneeId') {
        // 同上
        IssueStore.setArg({ assignee: filters[key][0] });
      } else {
        const temp = {
          [key]: filters[key][0],
        };
        IssueStore.setArg(temp);
      }
    });
    IssueStore.setBarFilters(barFilters);
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.setOrder(sorter.columnKey, sorter.order === 'ascend' ? 'asc' : 'desc');
    IssueStore.loadIssues(current - 1, pageSize);
  };

  exportExcel = () => {
    const projectId = AppState.currentMenuType.id;
    const searchParam = IssueStore.getFilter;
    axios.post(`/zuul/agile/v1/projects/${projectId}/issues/export`, searchParam, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xlsx`;
        FileSaver.saveAs(blob, fileName);
      });
  };

  buttonRender = () => {
    const content = (
      <CheckboxGroup className="c7n-agile-quickSearch-popover" style={{ display: 'flex', flexDirection: 'column' }} />
    );
    return (
      (
        <Popover content={content} trigger="click">
          <Button funcType="flat" icon="more_vert">
            自定义筛选
          </Button>
        </Popover>
      )
    );
  };

  MyTable = (props) => {
    const { expand } = this.state;
    if (IssueStore.issues.length === 0 && !IssueStore.loading) {
      return (
        <EmptyBlock
          style={{ marginTop: 40 }}
          border
          pic={pic}
          title="根据当前搜索条件没有查询到问题"
          des="尝试修改您的过滤选项或者在下面创建新的问题"
        />
      );
    }
    const renderNarrow = (
      <div style={props.style} className={props.className}>
        {props.children[1]}
        {props.children[2]}
      </div>
    );
    return expand ? renderNarrow : (<table {...props} />);
  };

  BodyWrapper = (props) => {
    const { expand } = this.state;
    const renderNarrow = (
      <div {...props} />
    );
    return expand ? renderNarrow : (<tbody {...props} />);
  };

  BodyRow = (props) => {
    const { expand } = this.state;
    // const renderWide = (<tr onClick={props.onClick}>{props.children}</tr>);
    const renderNarrow = (
      <div onClick={props.onClick} style={{ display: 'flex', flexDirection: 'column', margin: '10px' }} role="none">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <div style={{ display: 'flex' }}>
            {props.children[1]}
            {props.children[0]}
          </div>
          <div style={{ display: 'flex' }}>
            {props.children[3]}
            {props.children[4]}
            {props.children[5]}
          </div>
        </div>
        <div>{props.children[2]}</div>
        <Divider />
      </div>
    );
    return expand ? renderNarrow : (<tr {...props} />);
  };

  BodyCell = (props) => {
    const { expand } = this.state;
    return expand ? (<div {...props} style={{ marginRight: '10px' }} />) : (<td {...props} />);
  };

  render() {
    const { expand } = this.state;
    const columns = [
      {
        title: '类型',
        dataIndex: 'typeCode',
        key: 'typeCode',
        filters: [
          {
            text: '故事',
            value: 'story',
          },
          {
            text: '任务',
            value: 'task',
          },
          {
            text: '故障',
            value: 'bug',
          },
          {
            text: '史诗',
            value: 'issue_epic',
          },
        ],
        filterMultiple: true,
      },
      {
        title: '经办人',
        dataIndex: 'assigneeName',
        key: 'assigneeName',
        filters: [],
      },
      {
        title: '编号',
        dataIndex: 'issueNum',
        key: 'issueNum',
        filters: [],
      },
      {
        title: '概要',
        dataIndex: 'summary',
        key: 'summary',
        filters: [],
      },
      {
        title: '优先级',
        dataIndex: 'priorityName',
        key: 'priorityName',
        filters: [
          {
            text: '高',
            value: 'high',
          },
          {
            text: '中',
            value: 'medium',
          },
          {
            text: '低',
            value: 'low',
          },
        ],
        filterMultiple: true,
      },
      {
        title: '状态',
        dataIndex: 'statusName',
        key: 'statusName',
        filters: [
          {
            text: '待处理',
            value: 'todo',
          },
          {
            text: '进行中',
            value: 'doing',
          },
          {
            text: '已完成',
            value: 'done',
          },
        ],
        filterMultiple: true,
        filteredValue: IssueStore.filteredInfo.statusCode || null,
      }
    ];
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          ['story', 'task', 'bug', 'issue_epic'].map(type => (
            <Menu.Item key={type}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  typeCode={type}
                  showName
                />
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    return (
      <Page
        className="c7n-Issue"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header
          title="问题管理"
          backPath={IssueStore.getBackUrl}
        >
          <Button className="leftBtn" funcType="flat" onClick={() => this.setState({ create: true })}>
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
              const { current, pageSize } = IssueStore.pagination;
              IssueStore.loadIssues(current - 1, pageSize);
            }}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content style={{ display: 'flex', padding: '0', width: '100%' }}>
          {/* <Spin spinning={IssueStore.loading}> */}
          <div
            className="c7n-content-issue"
            style={{
              width: this.state.expand ? '28%' : '100%',
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            {/*// <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>*/}
            {/*//   <div*/}
            {/*//     style={{*/}
            {/*//       display: 'flex',*/}
            {/*//       width: '100%',*/}
            {/*//       height: 44,*/}
            {/*//       padding: '12px, 24px',*/}
            {/*//     }}*/}
            {/*//     className="c7n-scrumTools-left"*/}
            {/*//   >*/}
            {/*//     <p*/}
            {/*//       className="c7n-scrumTools-filter"*/}
            {/*//       role="none"*/}
            {/*//     >*/}
            {/*//       {'全部问题'}*/}
            {/*//     </p>*/}
            {/*//     <p*/}
            {/*//       className="c7n-scrumTools-filter"*/}
            {/*//       role="none"*/}
                {/*>*/}
                  {/*{'我的问题'}*/}
                {/*</p>*/}
                {/*{*/}
                  {/*this.buttonRender()*/}
                {/*}*/}
              {/*</div>*/}
            {/*</div>*/}
            <section
              className={`c7n-table ${this.state.expand ? 'expand-sign' : ''}`}
              style={{
                paddingRight: this.state.expand ? '0' : '24px',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {
                (
                  <Table
                    rowKey={record => record.issueId}
                    // columns={columns}
                    components={
                      {
                        table: this.MyTable,
                        body: {
                          wrapper: this.BodyWrapper,
                          row: this.BodyRow,
                          cell: this.BodyCell,
                        },
                      }
                    }
                    size="large"
                    dataSource={IssueStore.getIssues}
                    filterBar
                    showHeader={!expand}
                    filterBarPlaceholder="过滤表"
                    scroll={{ x: true }}
                    loading={IssueStore.loading}
                    pagination={false}
                    onChange={this.handleFilterChange}
                    onRow={record => ({
                      onClick: () => {
                        this.setState({
                          selectedIssue: record,
                          expand: true,
                          createIssue: true,
                        });
                      },
                    })
                    }
                    rowClassName={(record, index) => (
                      record.issueId === this.state.selectedIssue && this.state.selectedIssue.issueId ? 'c7n-border-visible' : 'c7n-border')}
                  >
                    <Column
                      title="任务编号"
                      dataIndex="issueNum"
                      key="issueId"
                      render={(text, record, index) => (
                        <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${text}`}>
                          <span>
                            {text}
                          </span>
                        </Tooltip>
                      )}
                      sorter
                      filters={[]}
                    />
                    <Column
                      title="类型"
                      dataIndex="typeCode"
                      key="typeCode"
                      align="center"
                      render={(text, record, index) => (
                        <Tooltip mouseEnterDelay={0.5} title={`任务类型： ${TYPE_NAME[text]}`}>
                          <TypeTag
                            typeCode={text}
                            showName={expand ? null : text}
                          />
                        </Tooltip>
                      )}
                      sorter
                      filters={
                        [
                          {
                            text: '故事',
                            value: 'story',
                          },
                          {
                            text: '任务',
                            value: 'task',
                          },
                          {
                            text: '故障',
                            value: 'bug',
                          },
                          {
                            text: '史诗',
                            value: 'issue_epic',
                          },
                        ]
                      }
                      filterMultiple
                    />
                    <Column
                      title="概要"
                      dataIndex="summary"
                      key="summary"
                      render={text => (
                        <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${text}`}>
                          <span>
                            {text}
                          </span>
                        </Tooltip>
                      )}
                      filters={[]}
                    />
                    <Column
                      title="状态"
                      dataIndex="statusName"
                      key="statusCode"
                      align="center"
                      render={(text, record) => (
                        <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${text}`}>
                          <StatusTag
                            name={text}
                            color={record.statusColor}
                            style={{ display: 'inline-block', verticalAlign: 'middle' }}
                          />
                        </Tooltip>
                      )}
                      sorter
                      filters={
                        [
                          {
                            text: '待处理',
                            value: 'todo',
                          },
                          {
                            text: '进行中',
                            value: 'doing',
                          },
                          {
                            text: '已完成',
                            value: 'done',
                          },
                        ]
                      }
                      filterMultiple
                    />
                    <Column
                      title="优先级"
                      dataIndex="priorityName"
                      key="priorityCode"
                      align="center"
                      render={(text, record) => (
                        <Tooltip mouseEnterDelay={0.5} title={`优先级： ${text}`}>
                          <PriorityTag
                            priority={record.priorityCode}
                          />
                        </Tooltip>
                      )}
                      sorter
                      filters={
                        [
                          {
                            text: '高',
                            value: 'high',
                          },
                          {
                            text: '中',
                            value: 'medium',
                          },
                          {
                            text: '低',
                            value: 'low',
                          },
                        ]
                      }
                      filterMultiple
                    />
                    <Column
                      title="冲刺"
                      dataIndex="sprint"
                      key="sprint"
                      filters={[]}
                      hidden
                      notDisplay
                    />
                    <Column
                      title="模块"
                      dataIndex="component"
                      key="component"
                      filters={[]}
                      hidden
                      notDisplay
                    />
                    <Column
                      title="版本"
                      dataIndex="version"
                      key="version"
                      filters={[]}
                      hidden
                      notDisplay
                    />
                    <Column
                      title="史诗"
                      dataIndex="epic"
                      key="epic"
                      filters={[]}
                      hidden
                      notDisplay
                    />
                  </Table>
                )
              }

              <div className="c7n-backlog-sprintIssue">
                <div
                  style={{
                    userSelect: 'none',
                    background: 'white',
                    padding: '12px 0 12px 19px',
                    fontSize: 13,
                    display: 'flex',
                    alignItems: 'center',
                    borderBottom: '1px solid #e8e8e8',
                  }}
                >
                  {this.state.createIssue ? (
                    <div className="c7n-add" style={{ display: 'block', width: '100%' }}>
                      <div style={{ display: 'flex' }}>
                        <Dropdown overlay={typeList} trigger={['click']}>
                          <div style={{ display: 'flex', alignItem: 'center' }}>
                            <div
                              className="c7n-sign"
                              style={{
                                backgroundColor: TYPE[this.state.selectIssueType],
                                marginRight: 2,
                              }}
                            >
                              <Icon
                                style={{ fontSize: '14px' }}
                                type={ICON[this.state.selectIssueType]}
                              />
                            </div>
                            <Icon
                              type="arrow_drop_down"
                              style={{ fontSize: 16 }}
                            />
                          </div>
                        </Dropdown>
                        <div style={{ marginLeft: 8, flexGrow: 1 }}>
                          <Input
                            autoFocus
                            value={this.state.createIssueValue}
                            placeholder="需要做什么？"
                            onChange={(e) => {
                              this.setState({
                                createIssueValue: e.target.value,
                              });
                            }}
                            maxLength={44}
                            onPressEnter={this.handleBlurCreateIssue.bind(this)}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          display: 'flex',
                          marginLeft: 32,
                          justifyContent: !this.state.expand ? 'flex-start' : 'flex-end',
                        }}
                      >
                        <Button
                          type="primary"
                          onClick={() => {
                            this.setState({
                              createIssue: false,
                            });
                          }}
                        >
                          {'取消'}
                        </Button>
                        <Button
                          type="primary"
                          loading={this.state.createLoading}
                          onClick={this.handleBlurCreateIssue.bind(this)}
                        >
                          {'确定'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      className="leftBtn"
                      style={{ color: '#3f51b5' }}
                      funcType="flat"
                      onClick={() => {
                        this.setState({
                          createIssue: true,
                          createIssueValue: '',
                        });
                      }}
                    >
                      <Icon type="playlist_add icon" />
                      <span>创建问题</span>
                    </Button>
                  )}
                </div>
              </div>
              {
                IssueStore.getIssues.length !== 0 ? (
                  <div style={{
                    display: 'flex', justifyContent: 'flex-end', marginTop: 16, marginBottom: 16,
                  }}
                  >
                    <Pagination
                      current={IssueStore.pagination.current}
                      defaultCurrent={1}
                      defaultPageSize={10}
                      pageSize={IssueStore.pagination.pageSize}
                      showSizeChanger
                      total={IssueStore.pagination.total}
                      onChange={this.handlePaginationChange.bind(this)}
                      onShowSizeChange={this.handlePaginationShowSizeChange.bind(this)}
                    />
                  </div>
                ) : null
              }
            </section>
          </div>

          <div
            className="c7n-sidebar"
            style={{
              width: this.state.expand ? '72%' : 0,
              display: this.state.expand ? 'block' : 'none',
              overflowY: 'hidden',
              overflowX: 'hidden',
            }}
          >
            {
              this.state.expand ? (
                <EditIssue
                  issueId={this.state.selectedIssue && this.state.selectedIssue.issueId}
                  onCancel={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                      createIssue: false,
                    });
                  }}
                  onDeleteIssue={() => {
                    this.setState({
                      expand: false,
                      selectedIssue: {},
                    });
                    IssueStore.init();
                    IssueStore.loadIssues();
                  }}
                  onUpdate={this.handleIssueUpdate.bind(this)}
                  onCopyAndTransformToSubIssue={() => {
                    const { current, pageSize } = IssueStore.pagination;
                    IssueStore.loadIssues(current - 1, pageSize);
                  }}
                />
              ) : null
            }
          </div>
          {
            this.state.create ? (
              <CreateIssue
                visible={this.state.create}
                onCancel={() => this.setState({ create: false })}
                onOk={this.handleCreateIssue.bind(this)}

              />
            ) : null
          }
        </Content>
      </Page>
    );
  }
}
export default Issue;
