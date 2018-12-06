import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Button, Pagination, Icon,
} from 'choerodon-ui';
import './Issue.scss';
import IssueStore from '../../../../stores/project/sprint/IssueStore';

import pic from '../../../../assets/image/emptyIssue.svg';
import CreateIssue from '../../../../components/CreateIssueNew';
import QuickSearch from '../../../../components/QuickSearch';
import ExpandCssControler from '../ExpandCssControler';
import IssueTable from '../IssueTable/IssueTable';
import EmptyBlock from '../../../../components/EmptyBlock';
import ExpandWideCard from '../ExpandWideCard';
import QuickCreateIssue from '../QuickCreateIssue/QuickCraeteIssue';
import CreateIssueModal from '../CreateIssueModal';

const FileSaver = require('file-saver');

const { AppState } = stores;

@observer
class Issue extends Component {
  constructor(props) {
    super(props);
    this.state = {
      create: false,
      filterName: [],
      checkCreateIssue: false,
      selectIssueType: 'task',
      createIssueValue: '',
      createLoading: false,
    };
  }

  componentDidMount() {
    this.getInit();
  }

  componentWillUnmount() {
    IssueStore.cleanSearchArgs();
    IssueStore.setSelectedQuickSearch({ quickFilterIds: [], assigneeFilterIds: null });
    IssueStore.resetOtherArgs();
  }

  getInit() {
    const { location } = this.props;
    const Request = this.GetRequest(location.search);
    const {
      paramType, paramId, paramName, paramStatus,
      paramPriority, paramIssueType, paramIssueId, paramUrl, paramOpenIssueId,
      paramResolution,
    } = Request;
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

    IssueStore.setParamInOtherArgs();
    const arr = [];
    if (paramName) {
      arr.push(paramName);
    }
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
          IssueStore.setClickedRow({
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

  handlePaginationChange = (page, pageSize) => {
    IssueStore.loadIssues(page - 1, pageSize);
  };

  handlePaginationShowSizeChange = (current, size) => {
    IssueStore.loadIssues(current - 1, size);
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

  onQuickSearchChange = (onlyMeChecked, onlyStoryChecked, moreChecked) => {
    IssueStore.setAdvArg({ assigneeIds: onlyMeChecked ? [AppState.userInfo.id] : null });
    IssueStore.setSelectedQuickSearch({ onlyStory: onlyStoryChecked });
    IssueStore.setSelectedQuickSearch({ quickFilterIds: moreChecked });
    IssueStore.loadIssues();
  }

  onAssigneeChange = (value) => {
    IssueStore.setSelectedQuickSearch({ assigneeFilterIds: value.length === 0 ? null : value });
    IssueStore.loadIssues();
  };

  render() {
    const {
      createIssueValue,
      selectIssueType, createLoading, create, checkCreateIssue,
    } = this.state;
    // 获取筛选框的显示内容
    const { filterName = [] } = this.state;
    // 筛选器配置（服务端获取筛选数据）
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
            onClick={IssueStore.createQuestion(true)}
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
              const { current, pageSize } = IssueStore.pagination;
              IssueStore.loadIssues(current - 1, pageSize);
            }}
          >
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content className="c7n-Issue">
          <div
            className="c7n-content-issue"
            style={{
              display: 'block',
              overflowY: 'auto',
              overflowX: 'hidden',
            }}
          >
            <QuickSearch
              style={{ paddingLeft: 24 }}
              onQuickSearchChange={this.onQuickSearchChange}
              onAssigneeChange={this.onAssigneeChange}
            />
            <ExpandCssControler />
            <IssueTable data={IssueStore.getIssues} filter={filterName} />
            <QuickCreateIssue />
            {
              IssueStore.getIssues && IssueStore.getIssues.length !== 0 ? (
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

          <ExpandWideCard style={{ height: 'calc(100vh - 106px)' }} />
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
