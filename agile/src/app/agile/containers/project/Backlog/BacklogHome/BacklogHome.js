import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Button, Spin, message, Icon } from 'choerodon-ui';
import Version from '../BacklogComponent/VersionComponent/Version';
import Epic from '../BacklogComponent/EpicComponent/Epic';
import Sprint from '../BacklogComponent/SprintComponent/Sprint';
import IssueDetail from '../BacklogComponent/IssueDetailComponent/IssueDetail';
import './BacklogHome.scss';
import BacklogStore from '../../../../stores/project/backlog/BacklogStore';

const { AppState } = stores;
// const { whyDidYouUpdate } = require('why-did-you-update');
//
// whyDidYouUpdate(React);

@observer
class BacklogHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinIf: false,
      versionVisible: false,
      epicVisible: false,
      scrollIf: false,
      more: false,
      expand: false,
    };
  }
  componentDidMount() {
    this.refresh();
    this.loadQuickFilter();
    const url = this.GetRequest(this.props.location.search);
    if (url.paramIssueId) {
      BacklogStore.setClickIssueDetail({ issueId: url.paramIssueId });
    }
    const timer = setInterval(() => {
      if (document.getElementsByClassName('c7n-backlogTools-left').length > 0) {
        if (document.getElementsByClassName('c7n-backlogTools-left')[0].scrollHeight > document.getElementsByClassName('c7n-backlogTools-left')[0].clientHeight) {
          this.setState({
            more: true,
          });
        }
        clearInterval(timer);
      }
    }, 1000);
  }
  componentWillUnmount() {
    BacklogStore.clearSprintFilter();
    BacklogStore.setClickIssueDetail({});
    // BacklogStore.setAllToNull();
  }

  //  拖动结束事件
  /**
   * 加载选择快速搜索的冲刺数据
   */
  getSprint() {
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((data) => {
      BacklogStore.setSprintData(data);
      this.setState({
        spinIf: false,
      });
    }).catch((error2) => {
    });
  }
  GetRequest(url) {
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


  /**
   * 加载版本数据
   */
  loadVersion =() => {
    BacklogStore.axiosGetVersion().then((data2) => {
      const newVersion = [...data2];
      for (let index = 0, len = newVersion.length; index < len; index += 1) {
        newVersion[index].expand = false;
      }
      BacklogStore.setVersionData(newVersion);
    }).catch((error) => {
    });
  };
  /**
   * 加载史诗
   */
  loadEpic =() => {
    BacklogStore.axiosGetEpic().then((data3) => {
      const newEpic = [...data3];
      for (let index = 0, len = newEpic.length; index < len; index += 1) {
        newEpic[index].expand = false;
      }
      BacklogStore.setEpicData(newEpic);
    }).catch((error3) => {
    });
  };
  refresh() {
    this.setState({
      spinIf: true,
    });
    this.getSprint();
    const { versionVisible, epicVisible } = this.state;
    if (versionVisible) {
      this.loadVersion();
    }
    if (epicVisible) {
      this.loadEpic();
    }
  }

  /**
   * 加载快速搜索
   */
  loadQuickFilter = () => {
    BacklogStore.axiosGetQuickSearchList().then((res) => {
      BacklogStore.setQuickSearchList(res);
    }).catch((error) => {
    });
  };

  /**
   *
   * @param state
   * @param value
   */
  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

  /**
   * 创建冲刺
    */
  handleCreateSprint() {
    this.setState({
      loading: true,
    });
    const data = {
      projectId: AppState.currentMenuType.id,
    };
    BacklogStore.axiosCreateSprint(data).then((res) => {
      this.setState({
        loading: false,
      });
      this.refresh();
      message.success('创建成功');
      if (document.getElementById('sprint_last')) {
        document.getElementsByClassName('c7n-backlog-sprint')[0].scrollTop = document.getElementById('sprint_last').offsetTop - 100;
      }
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      message.success('创建失败');
    });
  }

  /**
   * 筛选仅自己的故事
   */
  filterOnlyMe() {
    BacklogStore.setOnlyMe(!BacklogStore.getOnlyMe);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }

  /**
   * 筛选仅故事
   */
  filterOnlyStory() {
    BacklogStore.setRecent(!BacklogStore.getRecent);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }

  /**
   * add/remove快速查询的字段
   * @param item
   */
  filterQuick(item) {
    const newState = [...BacklogStore.getQuickFilters];
    if (newState.indexOf(item.filterId) === -1) {
      newState.push(item.filterId);
    } else {
      newState.splice(newState.indexOf(item.filterId), 1);
    }
    BacklogStore.setQuickFilters(newState);
    this.refresh();
  }

  resetSprintChose() {
    this.sprintRef.resetMuilterChose();
  }
  
  render() {
    return (
      <Page
        service={[
          // 'agile-service.product-version.createVersion',
          'agile-service.issue.deleteIssue',
          'agile-service.sprint.queryByProjectId',
        ]}
      >
        <Header title="待办事项">
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateSprint.bind(this)}>
            <Icon type="playlist_add" />创建冲刺
          </Button>
          <Button
            className="leftBtn2"
            functyp="flat"
            onClick={() => {
              this.refresh();
              this.loadQuickFilter();
            }}
          >
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="c7n-backlogTools">
            <div
              className="c7n-backlogTools-left"
              style={{
                height: this.state.expand ? '' : 27,
              }}
            >
              <p style={{ marginRight: 32, whiteSpace: 'nowrap' }}>快速搜索:</p>
              <p
                className="c7n-backlog-filter"
                style={{
                  background: BacklogStore.getOnlyMe ? '#3F51B5' : '',
                  color: BacklogStore.getOnlyMe ? 'white' : '#3F51B5',
                }}
                role="none"
                onClick={this.filterOnlyMe.bind(this)}
              >仅我的问题</p>
              <p
                className="c7n-backlog-filter"
                style={{
                  background: BacklogStore.getRecent ? '#3F51B5' : '',
                  color: BacklogStore.getRecent ? 'white' : '#3F51B5',
                }}
                role="none"
                onClick={this.filterOnlyStory.bind(this)}
              >仅故事</p>
              {
                BacklogStore.getQuickSearchList.length > 0 ?
                  BacklogStore.getQuickSearchList.map(item => (
                    <p
                      key={item.filterId}
                      className="c7n-backlog-filter"
                      style={{
                        background: BacklogStore.getQuickFilters.indexOf(item.filterId) !== -1 ? '#3F51B5' : '',
                        color: BacklogStore.getQuickFilters.indexOf(item.filterId) !== -1 ? 'white' : '#3F51B5',
                      }}
                      role="none"
                      onClick={this.filterQuick.bind(this, item)}
                    >
                      {item.name}
                    </p>
                  )) : ''
              }
            </div>
            <div
              style={{
                display: this.state.more ? 'block' : 'none',
                color: 'rgb(63, 81, 181)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
              role="none"
              onClick={() => {
                this.setState({
                  expand: !this.state.expand,
                });
              }}
            >
              {this.state.expand ? '...收起' : '...展开'}
            </div>
          </div>
          <div className="c7n-backlog">
            <div className="c7n-backlog-side">
              {this.state.versionVisible ? '' : (
                <p
                  role="none"
                  onClick={() => {
                    this.loadVersion();
                    this.setState({
                      versionVisible: true,
                    });
                  }}
                >版本</p>
              )}
              {this.state.epicVisible ? '' : (
                <p
                  style={{
                    marginTop: 12,
                  }}
                  role="none"
                  onClick={() => {
                    this.loadEpic();
                    this.setState({
                      epicVisible: true,
                    });
                  }}
                >史诗</p>
              )}
            </div>
            <div className="c7n-backlog-content">
              <div style={{ display: 'flex', flexGrow: 1 }}>
                <Version
                  onRef={(ref) => {
                    this.versionRef = ref;
                  }}
                  refresh={this.refresh.bind(this)}
                  visible={this.state.versionVisible}
                  changeVisible={this.changeState.bind(this)}
                  issueRefresh={() => {
                    this.IssueDetail.refreshIssueDetail();
                  }}
                />
                <Epic
                  onRef={(ref) => {
                    this.epicRef = ref;
                  }}
                  refresh={this.refresh.bind(this)}
                  visible={this.state.epicVisible}
                  changeVisible={this.changeState.bind(this)}
                  issueRefresh={() => {
                    this.IssueDetail.refreshIssueDetail();
                  }}
                />
                <Sprint
                  IssueDetail={this.IssueDetail}
                  epic={this.epicRef}
                  version={this.versionRef}
                  onRef={(ref) => {
                    this.sprintRef = ref;
                  }}
                  refresh={this.refresh.bind(this)}
                  epicVisible={this.state.epicVisible}
                  versionVisible={this.state.versionVisible}
                  spinIf={this.state.spinIf}
                />
              </div>
              <IssueDetail
                visible={JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}'}
                refresh={this.refresh.bind(this)}
                onRef={(ref) => {
                  this.IssueDetail = ref;
                }}
                cancelCallback={this.resetSprintChose.bind(this)}
              />
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

export default BacklogHome;

