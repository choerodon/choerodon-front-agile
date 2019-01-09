import React, { Component } from 'react';
import { observer } from 'mobx-react';
// 用于追踪 Mobx 引起的渲染，非性能调优时可注释
import { trace } from 'mobx';
import {
  Page, Header, Content, stores, axios,
} from 'choerodon-front-boot';
import {
  Button, Icon,
} from 'choerodon-ui';
import './Issue.scss';
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

@observer
class Issue extends Component {
  /**
   * @param props
   * 新建一个 filterControler 类，用来管理 ajax 请求所发出的对象
   */
  constructor(props) {
    super(props);
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

  // ExpandCssControler => 用于向 IssueTable 注入 CSS 样式
  render() {
    // 清除整页滚动条
    trace(true);
    if (document && document.getElementsByClassName('page-body').length) {
      // document.getElementsByClassName('page-body')[0].style.overflow = 'hidden';
    }
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
            <QuickSearch
              style={{ paddingLeft: 24 }}
              onQuickSearchChange={this.onQuickSearchChange}
              onAssigneeChange={this.onAssigneeChange}
            />
            <IssueTable filterControler={this.filterControler} />
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

export default Issue;
