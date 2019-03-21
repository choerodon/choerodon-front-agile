/* eslint-disable react/no-unused-state */
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, stores } from 'choerodon-front-boot';
import { DragDropContext } from 'react-beautiful-dnd';
import {
  Button, Spin, message, Icon,
} from 'choerodon-ui';
import _ from 'lodash';
import Version from '../BacklogComponent/VersionComponent/Version';
import Epic from '../BacklogComponent/EpicComponent/Epic';
import IssueDetail from '../BacklogComponent/IssueDetailComponent/IssueDetail';
import CreateIssue from '../../../../components/CreateIssueNew';
import './BacklogHome.scss';
import SprintItem from '../BacklogComponent/SprintComponent/SprintItem';
import QuickSearch from '../../../../components/QuickSearch';
import Injecter from '../../../../components/Injecter';
import Backlog from '../../userMap/component/Backlog/Backlog';

const { AppState } = stores;

@observer
class BacklogHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinIf: false,
      versionVisible: false,
      epicVisible: false,
    };
  }

  componentDidMount() {
    const { BacklogStore, location } = this.props;
    this.refresh();
  }

  componentWillUnmount() {
    const { BacklogStore } = this.props;
    BacklogStore.resetData();
  }

  // 加载问题类型和默认优先级
  loadProperty = () => {

  };

  /**
   * 加载选择快速搜索的冲刺数据
   * isCreate: 是否创建冲刺，如果是则自动滚动到新建的冲刺
   * issue: 新建的issue，如果新建issue则自动滚动到新建的issue
   */
  getSprint = (isCreate = false, issue) => {
    const { BacklogStore } = this.props;
    BacklogStore.axiosGetIssueTypes();
    BacklogStore.axiosGetDefaultPriority();
    Promise.all([BacklogStore.axiosGetQuickSearchList(), BacklogStore.axiosGetIssueTypes(), BacklogStore.axiosGetDefaultPriority(), BacklogStore.axiosGetSprint()]).then(([quickSearch, issueTypes, priorityArr, backlogData]) => {

      BacklogStore.initBacklogData(quickSearch.content, issueTypes, priorityArr, backlogData);
    });
  };

  /**
   * 加载版本数据
   */
  loadVersion = () => {
    const { BacklogStore } = this.props;
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
  loadEpic = () => {
    const { BacklogStore } = this.props;
    BacklogStore.axiosGetEpic().then((data3) => {
      const newEpic = [...data3];
      for (let index = 0, len = newEpic.length; index < len; index += 1) {
        newEpic[index].expand = false;
      }
      BacklogStore.setEpicData(newEpic);
    }).catch((error3) => {
    });
  };

  paramConverter = (url) => {
    const reg = /[^?&]([^=&#]+)=([^&#]*)/g;
    const retObj = {};
    url.match(reg).forEach((item) => {
      const [tempKey, paramValue] = item.split('=');
      const paramKey = tempKey[0] !== '&' ? tempKey : tempKey.substring(1);
      Object.assign(retObj, {
        [paramKey]: paramValue,
      });
    });
    return retObj;
  };

  refresh = (isCreate, issue) => {
    const { location } = this.props;
    const url = this.paramConverter(location.search);
    const { BacklogStore } = this.props;
    BacklogStore.setSpinIf(true);
    // if (url.paramIssueId) {
    //   BacklogStore.setClickIssueDetail({ issueId: url.paramIssueId });
    // }
    this.getSprint(isCreate, issue);
    const { versionVisible, epicVisible } = this.state;
    if (BacklogStore.getCurrentVisible === 'version') {
      this.loadVersion();
    } else {
      this.loadEpic();
    }
  };

  /**
   * 加载快速搜索
   */
  loadQuickFilter = () => {

  };

  /**
   * 创建冲刺
   */
  handleCreateSprint = () => {
    const { BacklogStore } = this.props;
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
      this.refresh(true);
      Choerodon.prompt('创建成功');
      // const anchorElement = document.getElementById('sprint_new');
      // if (anchorElement) {
      //   anchorElement.scrollIntoView({
      //     behavior: 'smooth',
      //     block: 'start',
      //   });
      // }
      // if (document.getElementById('sprint_new')) {
      //   document.getElementsByClassName('c7n-backlog-sprint')[0].scrollTop
      // = document.getElementById('sprint_new').offsetTop - 224;
      // }
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      Choerodon.prompt('创建失败');
    });
  };

  resetSprintChose = () => {
    this.resetMuilterChose();
  };

  /**
   * issue详情回退关闭详情侧边栏
   */
  resetMuilterChose = () => {
    this.setState({
      selected: {
        droppableId: '',
        issueIds: [],
      },
    });
  };

  onQuickSearchChange = (onlyMeChecked, onlyStoryChecked, moreChecked) => {
    const { BacklogStore } = this.props;
    BacklogStore.setQuickFilters(onlyMeChecked, onlyStoryChecked, moreChecked);
    BacklogStore.axiosGetSprint()
      .then((res) => {
        BacklogStore.setSprintData(res);
      }).catch((error) => {
      });
  }

  onAssigneeChange = (data) => {
    const { BacklogStore } = this.props;
    BacklogStore.setAssigneeFilterIds(data);
    BacklogStore.axiosGetSprint()
      .then((res) => {
        BacklogStore.setSprintData(res);
        this.setState({
          spinIf: false,
        });
      }).catch((error) => {
      });
  };

  handleClickCBtn = () => {
    const { BacklogStore } = this.props;
    BacklogStore.setNewIssueVisible(true);
  }

  handleCreateIssue = (res) => {
    const { BacklogStore } = this.props;
    BacklogStore.setNewIssueVisible(false);
    // 创建issue后刷新
    if (res) {
      this.refresh(false, res);
    }
  };

  toggleCurrentVisible = (type) => {
    const { BacklogStore } = this.props;
    if (BacklogStore.getCurrentVisible === type) {
      BacklogStore.toggleVisible(null);
    } else {
      BacklogStore.toggleVisible(type);
    }
  };

  render() {
    const { BacklogStore } = this.props;
    return (
      <Page
        service={[
          // 'agile-service.product-version.createVersion',
          'agile-service.issue.deleteIssue',
          'agile-service.sprint.queryByProjectId',
        ]}
      >
        <Header title="待办事项">
          <Button
            className="leftBtn"
            funcType="flat"
            onClick={this.handleClickCBtn}
          >
            <Icon type="playlist_add icon" />
            <span>创建问题</span>
          </Button>
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateSprint}>
            <Icon type="queue" />
            {'创建冲刺'}
          </Button>
          <Button
            className="leftBtn2"
            functyp="flat"
            onClick={() => {
              this.refresh();
              this.loadQuickFilter();
            }}
          >
            <Icon type="refresh" />
            {'刷新'}
          </Button>
        </Header>
        <div style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="backlogTools" style={{ paddingLeft: 24 }}>
            <QuickSearch
              onQuickSearchChange={this.onQuickSearchChange}
              resetFilter={BacklogStore.getQuickSearchClean}
              onAssigneeChange={this.onAssigneeChange}
            />
          </div>
          <div className="c7n-backlog">
            <div className="c7n-backlog-side">
              <p
                role="none"
                onClick={() => {
                  this.toggleCurrentVisible('version');
                }}
              >
                {'版本'}
              </p>
              <p
                style={{
                  marginTop: 12,
                }}
                role="none"
                onClick={() => {
                  this.toggleCurrentVisible('epic');
                }}
              >
                {'史诗'}
              </p>
            </div>
            <Version
              store={BacklogStore}
              onRef={(ref) => {
                this.versionRef = ref;
              }}
              refresh={this.refresh}
              visible={BacklogStore.getCurrentVisible}
              issueRefresh={() => {
                this.IssueDetail.refreshIssueDetail();
              }}
            />
            <Epic
              onRef={(ref) => {
                this.epicRef = ref;
              }}
              refresh={this.refresh}
              visible={BacklogStore.getCurrentVisible}
              issueRefresh={() => {
                this.IssueDetail.refreshIssueDetail();
              }}
            />
            <div className="c7n-backlog-content">
              <DragDropContext
                onDragEnd={(result) => {
                  BacklogStore.setIsDragging(false);
                  const { destination, source, draggableId } = result;

                  if (destination) {
                    debugger;
                    const { droppableId: destinationId, index: destinationIndex } = destination;
                    const { droppableId: sourceId, index: sourceIndex } = source;
                    if (destinationId === sourceId && destinationIndex === sourceIndex) {
                      return;
                    }
                    if (result.reason !== 'CANCEL') {
                      const item = BacklogStore.getIssueMap.get(sourceId)[sourceIndex];
                      if (BacklogStore.getMultiSelected.size > 1 && !BacklogStore.getMultiSelected.has(BacklogStore.getIssueMap.get(destinationId)[destinationIndex].issueId)) {
                        BacklogStore.moveSingleIssue(destinationId, destinationIndex, sourceId, sourceIndex, draggableId, item, 'multi');
                      } else {
                        BacklogStore.moveSingleIssue(destinationId, destinationIndex, sourceId, sourceIndex, draggableId, item, 'single');
                      }
                    }
                  }
                }}
                onDragStart={(result) => {
                  BacklogStore.setIsDragging(true);
                  const { source, draggableId } = result;
                  const { droppableId: sourceId, index: sourceIndex } = source;
                  const item = BacklogStore.getIssueMap.get(sourceId)[sourceIndex];
                  BacklogStore.setIssueWithEpicOrVersion(item);
                }}
              >
                <Spin spinning={BacklogStore.getSpinIf}>
                  <SprintItem
                    epicVisible={BacklogStore.getEpicVisible}
                    versionVisible={BacklogStore.getVersionVisible}
                    onRef={(ref) => {
                      this.sprintItemRef = ref;
                    }}
                    refresh={this.refresh}
                  />
                </Spin>
              </DragDropContext>
              <Injecter store={BacklogStore} item="newIssueVisible">
                {visible => (
                  <CreateIssue
                    visible={visible}
                    onCancel={() => {
                      BacklogStore.setNewIssueVisible(false);
                    }}
                    onOk={this.handleCreateIssue}
                  />
                )}
              </Injecter>
            </div>
            <IssueDetail
              refresh={this.refresh}
              onRef={(ref) => {
                this.IssueDetail = ref;
              }}
              cancelCallback={this.resetSprintChose}
            />
          </div>
        </div>
      </Page>
    );
  }
}

export default BacklogHome;
