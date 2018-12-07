import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { trace } from 'mobx';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Button, Icon,
} from 'choerodon-ui';
import './Issue.scss';
import IssueStore from '../../../../stores/project/sprint/IssueStore';

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

@observer
class Issue extends Component {
  componentWillMount() {
    const { location } = this.props;
    if (location.search.indexOf('param') !== -1) {
      const request = this.GetRequest(location.search);
      IssueStore.initPram(request);
    }
    IssueStore.setLoading(true);
    IssueStore.loadCurrentSetting().then(
      (res) => {
        IssueStore.setCurrentSetting(res);
      },
    ).catch((e) => {
    });
  }

  componentWillUnmount() {
    IssueStore.cleanSearchArgs();
    // IssueStore.setSelectedQuickSearch({ quickFilterIds: [], assigneeFilterIds: null });
  }

  GetRequest = (url) => {
    const reg = /(?<=[?&])param[^=]+=[^&?\n]*/g;
    const ret = {};
    url.match(reg).forEach((paramObj) => {
      const [paramKey, paramValue] = paramObj.split('=');
      Object.assign(ret, {
        [paramKey]: paramValue,
      });
    });
    return ret;
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
    // debugger;
    IssueStore.setAdvArg({ assigneeIds: onlyMeChecked ? [AppState.userInfo.id] : [] });
    IssueStore.setSelectedQuickSearch({ onlyStory: onlyStoryChecked });
    IssueStore.setSelectedQuickSearch({ quickFilterIds: moreChecked });
    IssueStore.loadIssues().then((res) => {
      IssueStore.updateFiltedIssue({
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }, res.content);
    });
  };

  onAssigneeChange = (value) => {
    IssueStore.setSelectedQuickSearch({ assigneeFilterIds: value.length === 0 ? null : value });
    IssueStore.loadIssues().then((res) => {
      IssueStore.updateFiltedIssue({
        current: res.number + 1,
        pageSize: res.size,
        total: res.totalElements,
      }, res.content);
    });
  };

  render() {
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
              IssueStore.loadCurrentSetting().then(
                (res) => {
                  IssueStore.setCurrentSetting(res);
                },
              ).catch((e) => {
              });
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
              overflowX: 'hidden',
              paddingLeft: '18px',
            }}
          >
            <QuickSearch
              style={{ paddingLeft: 24 }}
              onQuickSearchChange={this.onQuickSearchChange}
              onAssigneeChange={this.onAssigneeChange}
            />
            <IssueTable />
          </div>
          <ExpandWideCard />
          <CreateIssueModal />
        </Content>
      </Page>
    );
  }
}

export default Issue;
