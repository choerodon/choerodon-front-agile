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
import './BacklogHome.scss';
import SprintItem from '../BacklogComponent/SprintComponent/SprintItem';
import QuickSearch from '../../../../components/QuickSearch';

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
    // magic, don't touch it
    document.addEventListener('click', (e) => {
      if (!BacklogStore.isInner) {
        // 取消选择
        BacklogStore.setSelectIssue([]);
      }
    });
    BacklogStore.clearSprintFilter();
    this.refresh();
    this.loadQuickFilter();
    const url = this.handleRequest(location.search);
    this.loadProperty();
    if (url.paramIssueId) {
      BacklogStore.setClickIssueDetail({ issueId: url.paramIssueId });
    }
  }

  componentWillUnmount() {
    const { BacklogStore } = this.props;
    BacklogStore.dispose();
    BacklogStore.setClickIssueDetail({});
    BacklogStore.setAssigneeFilterIds([]);
    BacklogStore.setSprintData({});
  }

  // 加载问题类型和默认优先级
  loadProperty = () => {
    const { BacklogStore } = this.props;
    BacklogStore.axiosGetIssueTypes();
    BacklogStore.axiosGetDefaultPriority();
  };

  /**
   * 加载选择快速搜索的冲刺数据
   */
  getSprint =(isCreate = false) => {
    const { BacklogStore } = this.props;
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter())
      .then((data) => {
        let arrAssignee = [];
        data.sprintData.forEach((sprintItem) => {
          const sprintDataItemAssignees = _.map(sprintItem.assigneeIssues, issueItem => _.pick(issueItem, ['assigneeId', 'assigneeName']));

          _.forEach(sprintDataItemAssignees, (item) => {
            if (item.assigneeId && item.assigneeName) {
              arrAssignee.push({
                id: item.assigneeId,
                realName: item.assigneeName.replace(/[0-9]/ig, ''),
              });
            }
          });
        });
        _.forEach(data.backlogData.backLogIssue, (item) => {
          if (item.assigneeId && item.assigneeName) {
            arrAssignee.push({
              id: item.assigneeId,
              realName: item.assigneeName.replace(/[0-9]/ig, ''),
            });
          }
        });

        arrAssignee = _.map(_.uniq(_.map(arrAssignee, JSON.stringify)), JSON.parse);
        BacklogStore.setAssigneeProps(arrAssignee);
        BacklogStore.setSprintData(data);
        this.setState({
          spinIf: false,
        }, () => {
          if (isCreate && document.getElementById('sprint_new')) {
            const sprintWapper = document.querySelector('#sprint_new .c7n-noissue-wapper');
            const sprint = document.querySelector('#sprint_new .c7n-backlog-sprintIssue');
            document.getElementsByClassName('c7n-backlog-sprint')[0].scrollTop = document.getElementById('sprint_new').offsetTop;
            if (sprintWapper && sprintWapper.style) {
              sprintWapper.style.backgroundColor = '#E9ECFB';
            }
            if (sprint && sprint.style) {
              sprint.style.backgroundColor = '#E9ECFB';
            }
            setTimeout(() => {
              if (sprintWapper && sprintWapper.style) {
                sprintWapper.style.backgroundColor = 'white';
              }
              if (sprint && sprint.style) {
                sprint.style.backgroundColor = 'white';
              }
            }, 2000);
          }
        });
      }).catch((error2) => {
      });
  };

  handleRequest =(url) => {
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
  loadEpic =() => {
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

  refresh =(isCreate) => {
    this.setState({
      spinIf: true,
    });
    this.getSprint(isCreate);
    const { versionVisible, epicVisible } = this.state;
    if (versionVisible) {
      this.loadVersion();
    }
    if (epicVisible) {
      this.loadEpic();
    }
  };

  /**
   * 加载快速搜索
   */
  loadQuickFilter = () => {
    const { BacklogStore } = this.props;
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
  changeState =(state, value) => {
    this.setState({
      [state]: value,
    });
  };

  /**
   * 创建冲刺
    */
  handleCreateSprint =() => {
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

  resetSprintChose =() => {
    this.resetMuilterChose();
  };

  /**
   * issue详情回退关闭详情侧边栏
   */
  resetMuilterChose=() => {
    this.setState({
      selected: {
        droppableId: '',
        issueIds: [],
      },
    });
  };

  onDragEnd=(result) => {
    // this.props.changeEpicStat();
    const { BacklogStore } = this.props;
    this.versionRef.changeState([]);
    this.epicRef.changeState([]);
    BacklogStore.setIsDragging(false);
    this.sprintItemRef.onChangeState('draggableId', '');
    if (!result.destination) {
      return;
    }
    const sourceId = result.source.droppableId;
    const endId = result.destination.droppableId;
    const endIndex = result.destination.index;
    const originData = JSON.parse(JSON.stringify(BacklogStore.getSprintData));
    const newData = JSON.parse(JSON.stringify(BacklogStore.getSprintData));
    if (String(endId).indexOf('epic') !== -1) {
      // 移动到epic
    } else if (String(endId).indexOf('version') !== -1) {
      // 移到version
    } else {
      // 移动到sprint
      this.dragToSprint(result, sourceId, endId, endIndex, originData, newData);
    }
  };

  /**
   *获取多选拖动结束的数据
   *
   * @param {*} endId
   * @param {*} endIndex
   * @param {*} newData
   * @returns
   * @memberof BacklogHome
   */
  getDestinationData =(endId, endIndex, newData) => {
    let destinationData = {};
    if (endId !== 'backlog') {
      for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
        if (String(newData.sprintData[index].sprintId) === String(endId)) {
          if (newData.sprintData[index].issueSearchDTOList) {
            if (newData.sprintData[index].issueSearchDTOList.length > 0) {
              if (endIndex >= newData.sprintData[index].issueSearchDTOList.length) {
                destinationData = newData.sprintData[index].issueSearchDTOList[
                  newData.sprintData[index].issueSearchDTOList.length - 1];
              } else {
                destinationData = newData.sprintData[index].issueSearchDTOList[endIndex];
              }
            }
          }
        }
      }
    } else if (newData.backlogData.backLogIssue.length > 0) {
      if (endIndex >= newData.backlogData.backLogIssue.length) {
        destinationData = newData.backlogData.backLogIssue[
          newData.backlogData.backLogIssue - 1];
      } else {
        destinationData = newData.backlogData.backLogIssue[endIndex];
      }
    }
    return destinationData;
  };

  /**
   *拖动到冲刺中的事件
   *
   * @param {*} result
   * @param {*} sourceId
   * @param {*} endId
   * @param {*} endIndex
   * @param {*} originData
   * @param {*} newData1
   * @memberof BacklogHome
   */
  dragToSprint=(result, sourceId, endId, endIndex, originData, newData1) => {
    const newData = _.clone(newData1);
    const { BacklogStore } = this.props;
    // 如果是多选
    if (this.sprintItemRef.getCurrentState('selected').issueIds.length > 0) {
      const destinationData = this.getDestinationData(endId, endIndex, newData);
      let spliceDatas = [];
      // 起始如果是sprint
      if (sourceId !== 'backlog') {
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(sourceId)) {
            spliceDatas = _.remove(newData.sprintData[index].issueSearchDTOList,
              n => this.sprintItemRef.getCurrentState('selected').issueIds.indexOf(n.issueId) !== -1);
          }
        }
      } else {
        // 起始如果是backlog
        spliceDatas = _.remove(newData.backlogData.backLogIssue,
          n => this.sprintItemRef.getCurrentState('selected').issueIds.indexOf(n.issueId) !== -1);
      }
      const axiosParam = {};
      // 如果移动到sprint
      if (endId !== 'backlog') {
        let afIndex;
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(endId)) {
            if (_.isNull(newData.sprintData[index].issueSearchDTOList)) {
              newData.sprintData[index].issueSearchDTOList = [];
            }
            if (endIndex !== 0) {
              const len2 = newData.sprintData[index].issueSearchDTOList.length;
              for (let aindex = 0; aindex < len2; aindex += 1) {
                if (destinationData.issueId) {
                  if (newData.sprintData[index].issueSearchDTOList[aindex].issueId
                      === destinationData.issueId) {
                    afIndex = aindex + 1;
                  }
                }
              }
              newData.sprintData[index].issueSearchDTOList.splice(afIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList = _.flattenDeep(newData.sprintData[index]
                .issueSearchDTOList);
            } else {
              newData.sprintData[index].issueSearchDTOList.splice(endIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList = _.flattenDeep(newData.sprintData[index]
                .issueSearchDTOList);
            }
            axiosParam.before = endIndex === 0;
            axiosParam.rankIndex = result.source.index > result.destination.index;
            axiosParam.issueIds = this.sprintItemRef.getCurrentState('selected').issueIds;
            axiosParam.outsetIssueId = destinationData.issueId;
            BacklogStore.setSprintData(newData);
          }
        }
      } else {
        // 如果移动到backlog
        if (_.isNull(newData.backlogData.backLogIssue)) {
          newData.backlogData.backLogIssue = [];
        }
        let afIndex;
        if (endIndex !== 0) {
          const len = newData.backlogData.backLogIssue.length;
          for (let aindex = 0; aindex < len; aindex += 1) {
            if (destinationData.issueId) {
              if (newData.backlogData.backLogIssue[aindex].issueId === destinationData.issueId) {
                afIndex = aindex + 1;
              }
            }
          }
          newData.backlogData.backLogIssue.splice(afIndex, 0, spliceDatas);
          newData.backlogData.backLogIssue = _.flattenDeep(newData.backlogData.backLogIssue);
        } else {
          newData.backlogData.backLogIssue.splice(endIndex, 0, spliceDatas);
          newData.backlogData.backLogIssue = _.flattenDeep(newData.backlogData.backLogIssue);
        }
        axiosParam.before = endIndex === 0;
        axiosParam.rankIndex = result.source.index > result.destination.index;
        axiosParam.issueIds = this.sprintItemRef.getCurrentState('selected').issueIds;
        axiosParam.outsetIssueId = destinationData.issueId;
        BacklogStore.setSprintData(newData);
      }
      this.sprintItemRef.onChangeState('selected', {
        droppableId: '',
        issueIds: [],
      });
      BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog'
        ? 0 : endId, axiosParam).then((res) => {
        this.IssueDetail.refreshIssueDetail();
        this.getSprint();
      }).catch((error) => {
        BacklogStore.setSprintData(originData);
      });
    } else {
      // 如果不是多选
      const axiosParam = {};
      const sourceIndex = result.source.index;
      let spliceData = {};
      if (sourceId !== 'backlog') {
        // newData.sprintData.forEach((item) => {
        //   if (String(item.sprintId) === String(sourceId)) {
        //     spliceData = item.issueSearchDTOList.splice(sourceIndex, 1)[0];
        //   }
        // })
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(sourceId)) {
            // 取第一个
            [spliceData] = newData.sprintData[index].issueSearchDTOList.splice(sourceIndex, 1);
          }
        }
      } else {
        [spliceData] = newData.backlogData.backLogIssue.splice(sourceIndex, 1);
      }
      if (endId !== 'backlog') {
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(endId)) {
            if (_.isNull(newData.sprintData[index].issueSearchDTOList)) {
              newData.sprintData[index].issueSearchDTOList = [];
            }
            newData.sprintData[index].issueSearchDTOList.splice(endIndex, 0, spliceData);
            axiosParam.before = endIndex === 0;
            axiosParam.rankIndex = result.source.index > result.destination.index;
            axiosParam.issueIds = [result.draggableId];
            if (endIndex === 0) {
              if (newData.sprintData[index].issueSearchDTOList.length === 1) {
                axiosParam.outsetIssueId = 0;
              } else {
                axiosParam.outsetIssueId = newData
                  .sprintData[index].issueSearchDTOList[endIndex + 1].issueId;
              }
            } else {
              axiosParam.outsetIssueId = newData
                .sprintData[index].issueSearchDTOList[endIndex - 1].issueId;
            }
            BacklogStore.setSprintData(newData);
            BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog'
              ? 0 : endId, axiosParam).then((res) => {
              // newData.sprintData[index].issueSearchDTOList[endIndex] = res[0];
              this.IssueDetail.refreshIssueDetail();
              BacklogStore.setSprintData(newData);
              this.getSprint();
            }).catch((error) => {
              BacklogStore.setSprintData(originData);
            });
          }
        }
      } else {
        if (_.isNull(newData.backlogData.backLogIssue)) {
          newData.backlogData.backLogIssue = [];
        }
        newData.backlogData.backLogIssue.splice(endIndex, 0, spliceData);
        axiosParam.before = endIndex === 0;
        axiosParam.rankIndex = result.source.index > result.destination.index;
        axiosParam.issueIds = [result.draggableId];
        if (endIndex === 0) {
          if (newData.backlogData.backLogIssue.length === 1) {
            axiosParam.outsetIssueId = 0;
          } else {
            axiosParam.outsetIssueId = newData.backlogData.backLogIssue[endIndex + 1].issueId;
          }
        } else {
          axiosParam.outsetIssueId = newData.backlogData.backLogIssue[endIndex - 1].issueId;
        }
        BacklogStore.setSprintData(newData);
        BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog'
          ? 0 : endId, axiosParam).then((res) => {
          // newData.backlogData.backLogIssue[endIndex] = res[0];
          this.IssueDetail.refreshIssueDetail();
          BacklogStore.setSprintData(newData);
          this.getSprint();
        }).catch((error) => {
          BacklogStore.setSprintData(originData);
        });
      }
    }
  };

  onQuickSearchChange = (onlyMeChecked, onlyStoryChecked, moreChecked) => {
    const { BacklogStore } = this.props;
    this.setState({
      spinIf: true,
    });
    BacklogStore.setOnlyMe(onlyMeChecked);
    BacklogStore.setRecent(onlyStoryChecked);
    BacklogStore.setQuickFilters(moreChecked || []);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter())
      .then((res) => {
        BacklogStore.setSprintData(res);
        this.setState({
          spinIf: false,
        });
      }).catch((error) => {
      });
  }

  onAssigneeChange = (data) => {
    const { BacklogStore } = this.props;
    BacklogStore.setAssigneeFilterIds(data);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter())
      .then((res) => {
        BacklogStore.setSprintData(res);
        this.setState({
          spinIf: false,
        });
      }).catch((error) => {
      });
  }

  render() {
    const { BacklogStore } = this.props;
    const {
      epicVisible, versionVisible, spinIf,
    } = this.state;
    return (
      <Page
        service={[
          // 'agile-service.product-version.createVersion',
          'agile-service.issue.deleteIssue',
          'agile-service.sprint.queryByProjectId',
        ]}
      >
        <Header title="待办事项">
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateSprint}>
            <Icon type="playlist_add" />
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
              {versionVisible ? '' : (
                <p
                  role="none"
                  onClick={() => {
                    this.loadVersion();
                    this.setState({
                      versionVisible: true,
                    });
                  }}
                >
                  {'版本'}
                </p>
              )}
              {epicVisible ? '' : (
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
                >
                  {'史诗'}
                </p>
              )}
            </div>
            <div className="c7n-backlog-content">
              <div style={{ display: 'flex', flexGrow: 1 }}>
                <Version
                  store={BacklogStore}
                  onRef={(ref) => {
                    this.versionRef = ref;
                  }}
                  refresh={this.refresh}
                  visible={versionVisible}
                  changeVisible={this.changeState}
                  issueRefresh={() => {
                    this.IssueDetail.refreshIssueDetail();
                  }}
                />
                <Epic
                  store={BacklogStore}
                  onRef={(ref) => {
                    this.epicRef = ref;
                  }}
                  refresh={this.refresh}
                  visible={epicVisible}
                  changeVisible={this.changeState}
                  issueRefresh={() => {
                    this.IssueDetail.refreshIssueDetail();
                  }}
                />
                <DragDropContext
                  onDragEnd={this.onDragEnd}
                  onDragStart={(result) => {
                    BacklogStore.setIsDragging(true);
                    this.sprintItemRef.onChangeState('draggableId', result.draggableId);
                    if (this.sprintItemRef.getCurrentState('selected').issueIds.indexOf(result.draggableId) === -1) {
                      this.sprintItemRef.onChangeState('selected', {
                        droppableId: '',
                        issueIds: [],
                      });
                    }
                    if (this.sprintItemRef.getCurrentState('selected').issueIds.length > 0) {
                      this.versionRef.changeState(this.sprintItemRef.getCurrentState('selected').issueIds);
                      this.epicRef.changeState(this.sprintItemRef.getCurrentState('selected').issueIds);
                    } else {
                      this.versionRef.changeState([result.draggableId]);
                      this.epicRef.changeState([result.draggableId]);
                    }
                  }}
                >
                  <div
                    role="none"
                    className="c7n-backlog-sprint"
                  >
                    <Spin spinning={spinIf}>
                      <SprintItem
                        store={BacklogStore}
                        loading={spinIf}
                        epicVisible={epicVisible}
                        versionVisible={versionVisible}
                        onRef={(ref) => {
                          this.sprintItemRef = ref;
                        }}
                        refresh={this.refresh}
                      />
                    </Spin>
                  </div>
                </DragDropContext>
              </div>
              <IssueDetail
                visible={JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}'}
                refresh={this.refresh}
                onRef={(ref) => {
                  this.IssueDetail = ref;
                }}
                cancelCallback={this.resetSprintChose}
              />
            </div>
          </div>
        </div>
      </Page>
    );
  }
}

export default BacklogHome;
