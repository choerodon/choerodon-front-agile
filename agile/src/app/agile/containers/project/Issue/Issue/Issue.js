import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Table, Button, Tooltip, Input, Dropdown, Menu,
  Pagination, Icon, Divider, Tag,
} from 'choerodon-ui';
import TimeAgo from 'timeago-react';
import util from 'util';
import QuickSearch from '../../../../components/QuickSearch';
import './Issue.scss';
import { loadPriorities, loadStatus } from '../../../../api/NewIssueApi';
import IssueStore from '../../../../stores/project/sprint/IssueStore';

import { TYPE, ICON, TYPE_NAME } from '../../../../common/Constant';
import pic from '../../../../assets/image/emptyIssue.svg';
import { loadIssue, createIssue } from '../../../../api/NewIssueApi';
import EditIssue from '../../../../components/EditIssueWide';
import CreateIssue from '../../../../components/CreateIssueNew';
import UserHead from '../../../../components/UserHead';
import PriorityTag from '../../../../components/PriorityTag';
import StatusTag from '../../../../components/StatusTag';
import TypeTag from '../../../../components/TypeTag';
import EmptyBlock from '../../../../components/EmptyBlock';
import { STATUS } from '../../../../common/Constant';

const FileSaver = require('file-saver');

const storage = window.localStorage;

const { AppState } = stores;

@observer
class Issue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      create: false,
      selectedIssue: {},
      filterName: [],
      checkCreateIssue: false,
      selectIssueType: 'task',
      createIssueValue: '',
      createLoading: false,
      originPriorities: [],
      defaultPriorityId: false,
    };
  }

  componentDidMount() {
    this.getInit();
  }

  componentDidUpdate() {
    const selectedCard = document.getElementsByClassName('c7n-Issue-CardNarrow-clicked');
    if (selectedCard.length) {
      selectedCard[0].scrollIntoView();
    }
  }

  getInit() {
    const { location } = this.props;
    const Request = this.GetRequest(location.search);
    const {
      paramType, paramId, paramName, paramStatus,
      paramPriority, paramIssueType, paramIssueId, paramUrl, paramOpenIssueId,
      paramResolution,
    } = Request;
    // IssueStore.loadQuickSearch();
    IssueStore.loadCurrentSetting();
    IssueStore.setParamId(paramId);
    IssueStore.setParamType(paramType);
    IssueStore.setParamName(paramName);
    this.setState({
      filterName: IssueStore.getParamName ? [IssueStore.getParamName] : [],
    });
    IssueStore.setParamStatus(paramStatus);
    IssueStore.setParamPriority(paramPriority);
    IssueStore.setParamIssueType(paramIssueType);
    IssueStore.setParamIssueId(paramIssueId);
    IssueStore.setParamUrl(paramUrl);
    IssueStore.setParamOpenIssueId(paramOpenIssueId);
    IssueStore.setResolution(paramResolution);

    IssueStore.setSelectedQuickSearch({ quickFilterIds: [] });
    IssueStore.setOtherArgs();
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
    loadPriorities().then((res) => {
      if (res && res.length) {
        const defaultPriority = res.find(p => p.default);
        const defaultPriorityId = defaultPriority ? defaultPriority.id : '';
        this.setState({
          originPriorities: res,
          defaultPriorityId,
        });
        IssueStore.setPriorities(res);
        IssueStore.setDefaultPriorityId(defaultPriorityId);
      } else {
        this.setState({
          originPriorities: [],
          defaultPriorityId: '',
        });
        IssueStore.setPriorities([]);
        IssueStore.setDefaultPriorityId('');
      }
    });
    if (paramStatus) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      const a = paramStatus.split(',');
      obj.advancedSearchArgs.statusCode = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ statusCode: paramStatus.split(',') });
      IssueStore.loadIssues();
    } else if (paramPriority) {
      const obj = {
        advancedSearchArgs: {},
        searchArgs: {},
      };
      const a = [paramPriority];
      obj.advancedSearchArgs.priorityId = a || [];
      IssueStore.setBarFilters(arr);
      IssueStore.setFilter(obj);
      IssueStore.setFilteredInfo({ priorityId: [paramPriority] });
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
  };

  handleCreateIssue = (issueObj) => {
    const { history } = this.props;
    const {
      type, id, name, organizationId,
    } = AppState.currentMenuType;
    this.setState({ create: false });
    IssueStore.init();
    IssueStore.loadIssues();
    if (issueObj) {
      this.setState({
        selectedIssue: issueObj,
        expand: true,
      });
    }
  };

  handleIssueUpdate = (issueId) => {
    const { selectedIssue } = this.state;
    let Id;
    if (!issueId) {
      Id = selectedIssue.issueId;
    } else {
      Id = issueId;
    }
    loadIssue(Id).then((res) => {
      const obj = {
        ...res,
        imageUrl: res.assigneeImageUrl || '',
        versionIssueRelDTOS: res.versionIssueRelDTOList,
      };
      const originIssues = _.slice(IssueStore.issues);
      const index = _.findIndex(originIssues, { issueId: res.issueId });
      originIssues[index] = obj;
      IssueStore.setIssues(originIssues);
    });
  };

  handleBlurCreateIssue = () => {
    const { defaultPriorityId, createIssueValue, selectIssueType } = this.state;
    const currentType = IssueStore.getIssueTypes.find(t => t.typeCode === selectIssueType);
    if (defaultPriorityId && createIssueValue !== '') {
      const { history } = this.props;
      const {
        type, id, name, organizationId,
      } = AppState.currentMenuType;
      axios.get(`/agile/v1/projects/${id}/project_info`)
        .then((res) => {
          const data = {
            priorityCode: `priority-${defaultPriorityId}`,
            priorityId: defaultPriorityId,
            projectId: id,
            sprintId: 0,
            summary: createIssueValue,
            issueTypeId: currentType.id,
            typeCode: currentType.typeCode,
            epicId: 0,
            epicName: selectIssueType === 'issue_epic' ? createIssueValue : undefined,
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
  };

  handleHidden = (column) => {
    const filterData = storage.getItem('filterData') && storage.getItem('filterData').split(',');
    if (filterData && filterData.length) {
      column.map(
        item => (
          Object.assign(item, { hidden: filterData.indexOf(item.key) === -1 })
        ),
      );
    }
  };

  handleChangeType = (type) => {
    this.setState({
      selectIssueType: type.key,
    });
  };

  handlePaginationChange = (page, pageSize) => {
    IssueStore.loadIssues(page - 1, pageSize);
  };

  handlePaginationShowSizeChange = (current, size) => {
    IssueStore.loadIssues(current - 1, size);
  };

  handleFilterChange = (pagination, filters, sorter, barFilters) => {
    Object.keys(filters).forEach((key) => {
      if (key === 'statusId' || key === 'priorityId' || key === 'issueTypeId') {
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
    if (IssueStore.getParamName) {
      if (barFilters.indexOf(IssueStore.getParamName) === -1) {
        IssueStore.resetOtherArgs();
      }
    }
    IssueStore.setBarFilters(barFilters);
    this.setState({
      filterName: barFilters,
    });
    const { current, pageSize } = IssueStore.pagination;
    IssueStore.setOrder(sorter.columnKey, sorter.order === 'ascend' ? 'asc' : 'desc');
    IssueStore.loadIssues(current - 1, pageSize);
  };

  exportExcel = () => {
    const projectId = AppState.currentMenuType.id;
    const orgId = AppState.currentMenuType.organizationId;
    const searchParam = IssueStore.getFilter;
    axios.post(`/zuul/agile/v1/projects/${projectId}/issues/export?organizationId=${orgId}`, searchParam, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = `${AppState.currentMenuType.name}.xlsx`;
        FileSaver.saveAs(blob, fileName);
      });
  };


  MyTable = (props) => {
    const { expand } = this.state;
    if (IssueStore.getIssues.length === 0 && !IssueStore.loading) {
      // fixed 会渲染两张表，所以要判断子元素有没有这个属性
      // 如果有的话禁止渲染，防止 Empty 重复渲染
      if (!props.children[0].props.fixed) {
        return (
          <EmptyBlock
            style={{ marginTop: 60 }}
            border
            pic={pic}
            title="根据当前搜索条件没有查询到问题"
            des="尝试修改您的过滤选项或者在下面创建新的问题"
          />
        );
      } else {
        return null;
      }
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
    const { expand, selectedIssue } = this.state;
    const isClicked = props.children.find(item => (
      selectedIssue.issueId === item.props.record.issueId
    ));
    const renderNarrow = (
      <div onClick={props.onClick} style={{ }} role="none" className={isClicked ? 'c7n-Issue-CardNarrow-clicked c7n-Issue-CardNarrow' : 'c7n-Issue-CardNarrow'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '7px' }}>
          <div style={{ display: 'flex' }}>
            {props.children[1]}
            {props.children[0]}
          </div>
          <div style={{ display: 'flex' }}>
            {props.children[3]}
            {props.children[4]}
            {props.children[6]}
          </div>
        </div>
        <div>{props.children[2]}</div>
      </div>
    );
    return expand ? renderNarrow : (<tr {...props} />);
  };

  BodyCell = (props) => {
    const { expand } = this.state;
    return expand ? (<div {...props} style={{ marginRight: '10px' }} />) : (<td {...props} />);
  };

  renderIssueNum = (text, record, index) => (
    <Tooltip mouseEnterDelay={0.5} title={`任务编号： ${text}`}>
      <a>
        {text}
      </a>
    </Tooltip>
  );

  renderTypeCode = (text, record, index) => {
    const { expand } = this.state;
    return (
      <Tooltip mouseEnterDelay={0.5} title={`问题类型： ${TYPE_NAME[text]}`}>
        <TypeTag
          data={record.issueTypeDTO}
          showName={expand ? null : text}
        />
      </Tooltip>
    );
  };

  renderSummary = (text, record) => (
    <Tooltip mouseEnterDelay={0.5} placement="topLeft" title={`任务概要： ${text}`}>
      <span className="c7n-Issue-summary">
        {text}
      </span>
    </Tooltip>
  );

  renderStatusName = (text, record) => (
    <Tooltip mouseEnterDelay={0.5} title={`任务状态： ${text}`}>
      <StatusTag
        data={record.statusMapDTO}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      />
    </Tooltip>
  );

  renderPriorityName = (text, record) => (
    <Tooltip mouseEnterDelay={0.5} title={`优先级： ${record.priorityDTO ? record.priorityDTO.name : ''}`}>
      <PriorityTag
        priority={record.priorityDTO}
      />
    </Tooltip>
  )

  renderReporterName = (text, record) => (record.reporterId ? (
    <Tooltip mouseEnterDelay={0.5} title={`报告人： ${text}`}>
      <div style={{ marginRight: 12 }}>
        <UserHead
          user={{
            id: record.reporterId,
            loginName: '',
            realName: text,
            avatar: record.reporterImageUrl,
          }}
        />
      </div>
    </Tooltip>
  ) : null);

  renderAssigneeName = (text, record) => (record.assigneeId ? (
    <Tooltip mouseEnterDelay={0.5} title={`经办人： ${text}`}>
      <div style={{ marginRight: 12 }}>
        <UserHead
          user={{
            id: record.assigneeId,
            loginName: '',
            realName: text,
            avatar: record.assigneeImageUrl,
          }}
        />
      </div>
    </Tooltip>
  ) : null);

  renderLastUpdateTime = (text, record) => (
    <TimeAgo
      datetime={text}
      locale="zh_CN"
    />
  );

  // renderVersion = arr => (arr.length ? <Tag color="blue">{arr[0].name}</Tag> : null);
  renderVersion = (arr) => {
    if (arr && arr.length) {
      return (
        <Tooltip mouseEnterDelay={0.5} title={`版本：${arr.map(item => `${item.name} `)}`}>
          {/* {arr.slice(0, 2).map(item => <span>{`${item.name}, `}</span>)} */}
          {arr.slice(0, 2).map((item, i) => {
            if (i !== arr.slice(0, 2).length - 1) {
              return <span>{`${item.name}, `}</span>;
            } else {
              return <span>{`${item.name}`}</span>;
            }
          })}
          {arr.length > 2 ? '...' : ''}
        </Tooltip>
      );
    }
    return '无';
  }

  renderSprint = arr => (
    arr && arr.length ? arr[0].sprintName : '无'
  )

  renderComponent = (arr) => {
    if (arr && arr.length) {
      return (
        <Tooltip mouseEnterDelay={0.5} title={`模块：${arr.map(item => `${item.name} `)}`}>
          {arr.slice(0, 1).map((item, i) => <span>{`${item.name}`}</span>)}
          {arr.length > 1 ? '...' : ''}
        </Tooltip>
      );
    }
    return '无';
  }

  renderEpic = epicName => (epicName || '无')

  onlyMe = (checked) => {
    IssueStore.setAdvArg({ assignee_id: checked ? AppState.userInfo.id : null });
    IssueStore.loadIssues();
  };

  onlyStory = (checked) => {
    IssueStore.setSelectedQuickSearch({ onlyStory: checked });
    IssueStore.loadIssues();
  };

  onChangeSelect = (checkedValues) => {
    IssueStore.setSelectedQuickSearch({ quickFilterIds: checkedValues });
    IssueStore.loadIssues();
  };

  render() {
    const {
      expand, selectedIssue, createIssueValue,
      selectIssueType, createLoading, create, checkCreateIssue,
      originPriorities,
    } = this.state;
    // 获取筛选框的显示内容
    let { filterName } = this.state;
    filterName = filterName || [];
    // 筛选器配置（服务端获取筛选数据）
    const columnFilter = new Map([
      ['issueNum', []],
      [
        'typeId', IssueStore.getIssueTypes.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      ['summary', []],
      [
        'statusId', IssueStore.getIssueStatus.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      [
        'priorityId', IssueStore.getIssuePriority.map(item => ({
          text: item.name,
          value: item.id.toString(),
        })),
      ],
      ['reporterName', []],
      ['assigneeName', []],
      ['sprint', []],
      ['component', []],
      ['epic', []],
      ['issueId', []],
    ]);
    // 表格列配置
    const columns = [
      {
        title: '任务编号',
        dataIndex: 'issueNum',
        key: 'issueId',
        width: '128px',
        disableClick: true,
        sorter: true,
        fixed: expand ? false : 'left',
        filters: columnFilter.get('issueNum'),
        render: this.renderIssueNum,
      },
      {
        title: '问题类型',
        dataIndex: 'issueTypeDTO.name',
        key: 'issueTypeId',
        width: '120px',
        disableClick: true,
        sorter: true,
        fixed: expand ? false : 'left',
        filters: columnFilter.get('typeId'),
        filterMultiple: true,
        render: this.renderTypeCode,
      },
      {
        title: '概要',
        dataIndex: 'summary',
        key: 'summary',
        width: '300px',
        disableClick: true,
        fixed: expand ? false : 'left',
        filters: columnFilter.get('summary'),
        render: this.renderSummary,
      },
      {
        title: '状态',
        dataIndex: 'statusMapDTO.name',
        key: 'statusId',
        disableClick: true,
        sorter: true,
        filters: columnFilter.get('statusId'),
        filterMultiple: true,
        render: this.renderStatusName,
      },
      {
        title: '优先级',
        dataIndex: 'priorityDTO.name',
        key: 'priorityId',
        disableClick: true,
        render: this.renderPriorityName,
        sorter: true,
        filters: columnFilter.get('priorityId'),
        filterMultiple: true,
      },
      {
        title: '经办人',
        dataIndex: 'assigneeName',
        key: 'assigneeId',
        disableClick: true,
        sorter: true,
        filters: columnFilter.get('assigneeName'),
        render: this.renderAssigneeName,
      },
      {
        title: '报告人',
        dataIndex: 'reporterName',
        key: 'reporterId',
        sorter: true,
        filters: columnFilter.get('reporterName'),
        render: this.renderReporterName,
      },
      {
        title: '最后更新时间',
        dataIndex: 'lastUpdateDate',
        key: 'lastUpdateDate',
        sorter: true,
        render: this.renderLastUpdateTime,
      },
      {
        title: '版本',
        dataIndex: 'versionIssueRelDTOS',
        key: 'versionIssueRelDTOS',
        filters: columnFilter.get('versionIssueRelDTOS'),
        width: 200,
        render: this.renderVersion,
      },
      {
        title: '冲刺',
        dataIndex: 'issueSprintDTOS',
        key: 'issueSprintDTOS',
        filters: columnFilter.get('sprint'),
        hidden: true,
        width: 100,
        render: this.renderSprint,
      },
      {
        title: '模块',
        dataIndex: 'issueComponentBriefDTOS',
        key: 'issueComponentBriefDTOS',
        filters: columnFilter.get('component'),
        hidden: true,
        render: this.renderComponent,
      },
      {
        title: '史诗',
        dataIndex: 'epicName',
        key: 'epicName',
        filters: columnFilter.get('epic'),
        hidden: true,
        render: this.renderEpic,
      },
    ];
    if (storage.getItem('filterData') && storage.getItem('filterData').length) {
      this.handleHidden(columns);
    }
    const issueTypes = IssueStore.getIssueTypes;
    const currentType = issueTypes.find(t => t.typeCode === selectIssueType);
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
          issueTypes.filter(t => t.typeCode !== 'sub_task').map(type => (
            <Menu.Item key={type.typeCode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  data={type}
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
          <div
            className="c7n-content-issue"
            style={{
              width: expand ? '36%' : '100%',
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <QuickSearch
              title={false}
              buttonName="更多"
              buttonIcon="more_vert"
              moreSelection={IssueStore.getQuickSearch}
              onChangeCheckBox={this.onChangeSelect}
              onlyStory={this.onlyStory}
              onlyMe={this.onlyMe}
            />
            <section
              className={`c7n-table ${expand ? 'expand-sign' : ''}`}
              style={{
                paddingRight: expand ? '0' : '24px',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              <Table
                rowKey={record => record.issueId}
                columns={columns}
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
                showHeader={!expand}
                filterBarPlaceholder="过滤表"
                filters={filterName}
                noFilter
                scroll={expand ? { x: true } : { x: 2000 }}
                loading={IssueStore.loading}
                pagination={false}
                onChange={this.handleFilterChange}
                onColumnFilterChange={(item) => {
                  storage.setItem('filterData', item.selectedKeys);
                }}
                rowClassName={(record, index) => (
                  record.issueId === selectedIssue && selectedIssue.issueId ? 'c7n-border-visible' : 'c7n-border'
                )}
                onRow={record => ({
                  onClick: () => {
                    this.setState({
                      selectedIssue: record,
                      expand: true,
                    });
                  },
                })
                }
              />
            </section>
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
                {checkCreateIssue ? (
                  <div className="c7n-add" style={{ display: 'block', width: '100%' }}>
                    <div style={{ display: 'flex' }}>
                      <Dropdown overlay={typeList} trigger={['click']}>
                        <div style={{ display: 'flex', alignItem: 'center' }}>
                          <TypeTag
                            data={currentType}
                          />
                          <Icon
                            type="arrow_drop_down"
                            style={{ fontSize: 16 }}
                          />
                        </div>
                      </Dropdown>
                      <div style={{ marginLeft: 8, flexGrow: 1 }}>
                        <Input
                          autoFocus
                          value={createIssueValue}
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
                        justifyContent: !expand ? 'flex-start' : 'flex-end',
                      }}
                    >
                      <Button
                        type="primary"
                        onClick={() => {
                          this.setState({
                            checkCreateIssue: false,
                          });
                        }}
                      >
                        {'取消'}
                      </Button>
                      <Button
                        type="primary"
                        loading={createLoading}
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
                        checkCreateIssue: true,
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
          </div>

          <div
            className="c7n-sidebar"
            style={{
              width: expand ? '64%' : 0,
              display: expand ? 'block' : 'none',
              overflowY: 'hidden',
              overflowX: 'hidden',
            }}
          >
            {
            expand ? (
              <EditIssue
                store={IssueStore}
                issueId={selectedIssue && selectedIssue.issueId}
                onCancel={() => {
                  this.setState({
                    expand: false,
                    selectedIssue: {},
                    checkCreateIssue: false,
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
          create ? (
            <CreateIssue
              visible={create}
              onCancel={() => this.setState({ create: false })}
              onOk={this.handleCreateIssue.bind(this)}
              store={IssueStore}
            />
          ) : null
        }
        </Content>
      </Page>
    );
  }
}

export default Issue;
