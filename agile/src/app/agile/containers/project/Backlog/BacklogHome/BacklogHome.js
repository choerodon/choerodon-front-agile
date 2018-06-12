import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Button, Spin, message, Icon } from 'choerodon-ui';
import _ from 'lodash';
import { DragDropContext } from 'react-beautiful-dnd';
import Version from '../BacklogComponent/VersionComponent/Version';
import Epic from '../BacklogComponent/EpicComponent/Epic';
import Sprint from '../BacklogComponent/SprintComponent/Sprint';
import IssueDetail from '../BacklogComponent/IssueDetailComponent/IssueDetail';
import './BacklogHome.scss';
import '../../../main.scss';
import BacklogStore from '../../../../stores/project/backlog/BacklogStore';

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
  componentWillMount() {
    this.refresh();
    window.addEventListener('click', (e) => {
      if (!e.target.getAttribute('label')) {
        if (this.sprintRef.getCurrentState('selected').issueIds.length > 0) {
          if (!BacklogStore.getIsDragging) {
            this.sprintRef.onChangeState('selected', {
              droppableId: '',
              issueIds: [],
            });
          }
        }
      }
    });
  }
  //  拖动结束事件
  onDragEnd(result) {
    this.versionRef.changeState([]);
    this.epicRef.changeState([]);
    BacklogStore.setIsDragging(false);
    this.sprintRef.onChangeState('draggableId', '');
    if (!result.destination) {
      return;
    }
    const sourceId = result.source.droppableId;
    const endId = result.destination.droppableId;
    const endIndex = result.destination.index;
    const originData = JSON.parse(JSON.stringify(BacklogStore.getSprintData));
    const newData = JSON.parse(JSON.stringify(BacklogStore.getSprintData));
    if (String(endId).indexOf('epic') !== -1) {
      window.console.log('epic');
      // 移动到epic
    } else if (String(endId).indexOf('version') !== -1) {
      window.console.log('version');
      // 移到version
    } else {
      // 移动到sprint
      this.dragToSprint(result, sourceId, endId, endIndex, originData, newData);
    }
  }
  getDestinationData(endId, endIndex, newData) {
    let destinationData = {};
    if (endId !== 'backlog') {
      _.forEach(newData.sprintData, (item, index) => {
        if (String(item.sprintId) === String(endId)) {
          if (newData.sprintData[index].issueSearchDTOList) {
            if (newData.sprintData[index].issueSearchDTOList.length > 0) {
              if (endIndex >= newData.sprintData[index].issueSearchDTOList.length) {
                destinationData = 
                  newData.sprintData[index].issueSearchDTOList[
                    newData.sprintData[index].issueSearchDTOList.length - 1];
              } else {
                destinationData = newData.sprintData[index].issueSearchDTOList[endIndex];
              }
            }
          }
        }
      });
    } else if (newData.backlogData.backLogIssue.length > 0) {
      if (endIndex >= newData.backlogData.backLogIssue.length) {
        destinationData = 
          newData.backlogData.backLogIssue[
            newData.backlogData.backLogIssue - 1];
      } else {
        destinationData = newData.backlogData.backLogIssue[endIndex];
      }
    }
    return destinationData;
  }
  dragToSprint(result, sourceId, endId, endIndex, originData, newData1) {
    const newData = _.clone(newData1);
    // 如果是多选
    if (this.sprintRef.getCurrentState('selected').issueIds.length > 0) {
      const destinationData = this.getDestinationData(endId, endIndex, newData);
      let spliceDatas = [];
      // 起始如果是sprint
      if (sourceId !== 'backlog') {
        _.forEach(newData.sprintData, (item, index) => {
          if (String(item.sprintId) === String(sourceId)) {
            spliceDatas = _.remove(newData.sprintData[index].issueSearchDTOList, 
              n => this.sprintRef.getCurrentState('selected').issueIds.indexOf(n.issueId) !== -1);
          }
        });
      } else {
        // 起始如果是backlog
        spliceDatas = _.remove(newData.backlogData.backLogIssue, 
          n => this.sprintRef.getCurrentState('selected').issueIds.indexOf(n.issueId) !== -1);
      }
      const axiosParam = {};
      // 如果移动到sprint
      if (endId !== 'backlog') {
        let afIndex;
        _.forEach(newData.sprintData, (item, index) => {
          if (String(item.sprintId) === String(endId)) {
            if (_.isNull(newData.sprintData[index].issueSearchDTOList)) {
              newData.sprintData[index].issueSearchDTOList = [];
            }
            if (endIndex !== 0) {
              _.forEach(newData.sprintData[index].issueSearchDTOList, (af, aindex) => {
                if (destinationData.issueId) {
                  if (af.issueId === destinationData.issueId) {
                    afIndex = aindex + 1;
                  }
                }
              });
              newData.sprintData[index].issueSearchDTOList.splice(afIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList = 
                _.flattenDeep(newData.sprintData[index].issueSearchDTOList);
            } else {
              newData.sprintData[index].issueSearchDTOList.splice(endIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList = 
                _.flattenDeep(newData.sprintData[index].issueSearchDTOList);
            }
            axiosParam.before = endIndex === 0;
            axiosParam.issueIds = this.sprintRef.getCurrentState('selected').issueIds;
            // if (endIndex === 0) {
            //   if (newData.sprintData[index].issueSearchDTOList.length === 
            // this.sprintRef.getCurrentState('selected').issueIds.length) {
            //     axiosParam.outsetIssueId = 0;
            //   } else {
            //     axiosParam.outsetIssueId = 
            //     newData.sprintData[index].issueSearchDTOList[endIndex + this.sprintRef
            //       .getCurrentState('selected').issueIds.length].issueId; 
            //   }
            // } else {
            axiosParam.outsetIssueId = 
              destinationData.issueId; 
            // }
            BacklogStore.setSprintData(newData);
          }
        });
      } else {
        // 如果移动到backlog
        if (_.isNull(newData.backlogData.backLogIssue)) {
          newData.backlogData.backLogIssue = [];
        }
        let afIndex;
        if (endIndex !== 0) {
          _.forEach(newData.backlogData.backLogIssue, (af, aindex) => {
            if (destinationData.issueId) {
              if (af.issueId === destinationData.issueId) {
                afIndex = aindex + 1;
              }
            }
          });
          newData.backlogData.backLogIssue.splice(afIndex, 0, spliceDatas);
          newData.backlogData.backLogIssue = _.flattenDeep(newData.backlogData.backLogIssue);
        } else {
          newData.backlogData.backLogIssue.splice(endIndex, 0, spliceDatas);
          newData.backlogData.backLogIssue = _.flattenDeep(newData.backlogData.backLogIssue);
        }
        axiosParam.before = endIndex === 0;
        axiosParam.issueIds = this.sprintRef.getCurrentState('selected').issueIds;
        axiosParam.outsetIssueId = 
              destinationData.issueId; 
        BacklogStore.setSprintData(newData);
      }
      this.sprintRef.onChangeState('selected', {
        droppableId: '',
        issueIds: [],
      });
      BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog' 
        ? 0 : endId, axiosParam).then((res) => {
        this.IssueDetail.refreshIssueDetail();
        this.refresh();
      }).catch((error) => {
        BacklogStore.setSprintData(originData);
        window.console.log(error);
      });
    } else {
      // 如果不是多选
      const axiosParam = {};
      const sourceIndex = result.source.index;
      let spliceData = {};
      if (sourceId !== 'backlog') {
        _.forEach(newData.sprintData, (item, index) => {
          if (String(item.sprintId) === String(sourceId)) {
            spliceData = newData.sprintData[index].issueSearchDTOList.splice(sourceIndex, 1)[0];
          }
        });
      } else {
        spliceData = newData.backlogData.backLogIssue.splice(sourceIndex, 1)[0];
      }
      if (endId !== 'backlog') {
        _.forEach(newData.sprintData, (item, index) => {
          if (String(item.sprintId) === String(endId)) {
            if (_.isNull(newData.sprintData[index].issueSearchDTOList)) {
              newData.sprintData[index].issueSearchDTOList = [];
            }
            newData.sprintData[index].issueSearchDTOList.splice(endIndex, 0, spliceData);
            axiosParam.before = endIndex === 0;
            axiosParam.issueIds = [result.draggableId];
            if (endIndex === 0) {
              if (newData.sprintData[index].issueSearchDTOList.length === 1) {
                axiosParam.outsetIssueId = 0;
              } else {
                axiosParam.outsetIssueId = 
                newData.sprintData[index].issueSearchDTOList[endIndex + 1].issueId; 
              }
            } else {
              axiosParam.outsetIssueId = 
              newData.sprintData[index].issueSearchDTOList[endIndex - 1].issueId; 
            }
            BacklogStore.setSprintData(newData);
            BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog' 
              ? 0 : endId, axiosParam).then((res) => {
              newData.sprintData[index].issueSearchDTOList[endIndex] = res[0];
              this.IssueDetail.refreshIssueDetail();
              BacklogStore.setSprintData(newData);
            }).catch((error) => {
              BacklogStore.setSprintData(originData);
              window.console.log(error);
            });
          }
        });
      } else {
        if (_.isNull(newData.backlogData.backLogIssue)) {
          newData.backlogData.backLogIssue = [];
        }
        newData.backlogData.backLogIssue.splice(endIndex, 0, spliceData);
        axiosParam.before = endIndex === 0;
        axiosParam.issueIds = [result.draggableId];
        if (endIndex === 0) {
          if (newData.backlogData.backLogIssue.length === 1) {
            axiosParam.outsetIssueId = 0;
          } else {
            axiosParam.outsetIssueId = 
            newData.backlogData.backLogIssue[endIndex + 1].issueId; 
          }
        } else {
          axiosParam.outsetIssueId = 
          newData.backlogData.backLogIssue[endIndex - 1].issueId; 
        }
        BacklogStore.setSprintData(newData);
        BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog' 
          ? 0 : endId, axiosParam).then((res) => {
          newData.backlogData.backLogIssue[endIndex] = res[0];
          this.IssueDetail.refreshIssueDetail();
          BacklogStore.setSprintData(newData);
        }).catch((error) => {
          BacklogStore.setSprintData(originData);
          window.console.log(error);
        });
      }
    }
  }
  refresh() {
    const data4 = {
      advancedSearchArgs: {},
    };
    if (BacklogStore.getChosenEpic !== 'all') {
      if (BacklogStore.getChosenEpic === 'unset') {
        data4.advancedSearchArgs.noEpic = 'true';
      } else {
        data4.advancedSearchArgs.epicId = BacklogStore.getChosenEpic;
      }
    }
    if (BacklogStore.getChosenVersion !== 'all') {
      if (BacklogStore.getChosenVersion === 'unset') {
        data4.advancedSearchArgs.noVersion = 'true';
      } else {
        data4.advancedSearchArgs.versionId = BacklogStore.getChosenVersion;
      }
    }
    if (BacklogStore.getOnlyMe) {
      data4.advancedSearchArgs.ownIssue = 'true';
    }
    if (BacklogStore.getRecent) {
      data4.advancedSearchArgs.onlyStory = 'true';
    }
    this.setState({
      spinIf: true,
    });
    BacklogStore.axiosGetSprint(data4).then((data) => {
      BacklogStore.setSprintData(data);
      BacklogStore.axiosGetVersion().then((data2) => {
        const newVersion = [...data2];
        _.forEach(newVersion, (item, index) => {
          newVersion[index].expand = false;
        });
        BacklogStore.setVersionData(newVersion);
        this.setState({
          spinIf: false,
        });
      }).catch((error) => {
        window.console.log(error);
      });
      BacklogStore.axiosGetEpic().then((data3) => {
        const newEpic = [...data3];
        _.forEach(newEpic, (item, index) => {
          newEpic[index].expand = false;
        });
        BacklogStore.setEpicData(newEpic);
      }).catch((error3) => {
        window.console.log(error3);
      });
    }).catch((error2) => {
      window.console.log(error2);
    });
  }
  changeState(state, value) {
    this.setState({
      [state]: value,
    });
  }

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
    }).catch((error) => {
      this.setState({
        loading: false,
      });
      message.success('创建失败');
      window.console.log(error);
    });
  }
  
  render() {
    return (
      <Page>
        <Header title="待办事项">
          <Button loading={this.state.loading} className="leftBtn" funcTyp="flat" onClick={this.handleCreateSprint.bind(this)}>
            <Icon type="playlist_add" />创建冲刺
          </Button>
          <Button className="leftBtn2" funcTyp="flat" onClick={this.refresh.bind(this)}>
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="c7n-backlogTools">
            <div className="c7n-backlogTools-left">
              <p style={{ marginRight: 32 }}>快速搜索:</p>
              <p
                className="c7n-backlog-filter"
                style={{
                  background: BacklogStore.getOnlyMe ? 'rgba(140, 158, 255, 0.2)' : '',
                  color: BacklogStore.getOnlyMe ? '#3f51b5' : '',
                }}
                role="none"
                onClick={() => {
                  BacklogStore.setOnlyMe(!BacklogStore.getOnlyMe);
                  const data = {
                    advancedSearchArgs: {},
                  };
                  if (BacklogStore.getChosenEpic !== 'all') {
                    if (BacklogStore.getChosenEpic === 'unset') {
                      data.advancedSearchArgs.noEpic = 'true';
                    } else {
                      data.advancedSearchArgs.epicId = BacklogStore.getChosenEpic;
                    }
                  }
                  if (BacklogStore.getChosenVersion !== 'all') {
                    if (BacklogStore.getChosenVersion === 'unset') {
                      data.advancedSearchArgs.noVersion = 'true';
                    } else {
                      data.advancedSearchArgs.versionId = BacklogStore.getChosenVersion;
                    }
                  }
                  if (BacklogStore.getOnlyMe) {
                    data.advancedSearchArgs.ownIssue = 'true';
                  }
                  if (BacklogStore.getRecent) {
                    data.advancedSearchArgs.onlyStory = 'true';
                  }
                  BacklogStore.axiosGetSprint(data).then((res) => {
                    BacklogStore.setSprintData(res);
                  }).catch((error) => {
                    window.console.log(error);
                  });
                }}
              >仅我的问题</p>
              <p
                className="c7n-backlog-filter"
                style={{
                  background: BacklogStore.getRecent ? 'rgba(140, 158, 255, 0.2)' : '',
                  color: BacklogStore.getRecent ? '#3f51b5' : '',
                }}
                role="none"
                onClick={() => {
                  BacklogStore.setRecent(!BacklogStore.getRecent);
                  const data = {
                    advancedSearchArgs: {},
                  };
                  if (BacklogStore.getChosenEpic !== 'all') {
                    if (BacklogStore.getChosenEpic === 'unset') {
                      data.advancedSearchArgs.noEpic = 'true';
                    } else {
                      data.advancedSearchArgs.epicId = BacklogStore.getChosenEpic;
                    }
                  }
                  if (BacklogStore.getChosenVersion !== 'all') {
                    if (BacklogStore.getChosenVersion === 'unset') {
                      data.advancedSearchArgs.noVersion = 'true';
                    } else {
                      data.advancedSearchArgs.versionId = BacklogStore.getChosenVersion;
                    }
                  }
                  if (BacklogStore.getOnlyMe) {
                    data.advancedSearchArgs.ownIssue = 'true';
                  }
                  if (BacklogStore.getRecent) {
                    data.advancedSearchArgs.onlyStory = 'true';
                  }
                  BacklogStore.axiosGetSprint(data).then((res) => {
                    BacklogStore.setSprintData(res);
                  }).catch((error) => {
                    window.console.log(error);
                  });
                }}
              >仅故事</p>
            </div>
          </div>
          <div className="c7n-backlog">
            <div className="c7n-backlog-side">
              {this.state.versionVisible ? '' : (
                <p
                  role="none"
                  onClick={() => {
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
                    this.setState({
                      epicVisible: true,
                    });
                  }}
                >史诗</p>
              )}
            </div>
            <div className="c7n-backlog-content" style={{ paddingBottom: 20 }}>
              <DragDropContext
                onDragEnd={this.onDragEnd.bind(this)}
                onDragStart={(result) => {
                  BacklogStore.setIsDragging(true);
                  this.sprintRef.onChangeState('draggableId', result.draggableId);
                  if (this.sprintRef.getCurrentState('selected').issueIds.indexOf(result.draggableId) === -1) {
                    this.sprintRef.onChangeState('selected', {
                      droppableId: '',
                      issueIds: [],
                    });
                  }
                  if (this.sprintRef.getCurrentState('selected').issueIds.length > 0) {
                    this.versionRef.changeState(this.sprintRef.getCurrentState('selected').issueIds);
                    this.epicRef.changeState(this.sprintRef.getCurrentState('selected').issueIds);
                  } else {
                    this.versionRef.changeState([result.draggableId]);
                    this.epicRef.changeState([result.draggableId]);
                  }
                }}
              >
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
                    onRef={(ref) => {
                      this.sprintRef = ref;
                    }}
                    refresh={this.refresh.bind(this)}
                    epicVisible={this.state.epicVisible}
                    versionVisible={this.state.versionVisible}
                  />
                </div>
                <IssueDetail
                  visible={JSON.stringify(BacklogStore.getClickIssueDetail) !== '{}'}
                  refresh={this.refresh.bind(this)}
                  onRef={(ref) => {
                    this.IssueDetail = ref;
                  }}
                />
              </DragDropContext>
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}

export default BacklogHome;

