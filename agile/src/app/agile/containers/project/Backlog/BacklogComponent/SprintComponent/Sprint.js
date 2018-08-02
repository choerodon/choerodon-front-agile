import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Spin, Tooltip } from 'choerodon-ui';
import _ from 'lodash';
import { stores } from 'choerodon-front-boot';
import { DragDropContext, Draggable } from 'react-beautiful-dnd';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import './Sprint.scss';
import Typetag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
import SprintItem from './SprintItem';
import EmptyBacklog from '../../../../../assets/image/emptyBacklog.png';
import SprintIssue from './SprintIssue';

const { AppState } = stores;

@observer
class Sprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      refresh: true,
      keydown: '',
      draggableId: '',
      createBacklogIssue: false,
      selectIssueType: 'story',
      createIssueValue: '',
      selected: {
        droppableId: '',
        issueIds: [],
      },
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   *这个方法好像没用了 以防万一 没有删除掉
   *
   * @memberof Sprint
   */
  handleBlurCreateIssue=()=> {
    this.setState({
      loading: true,
    });
    if (this.state.createIssueValue !== '') {
      const data = {
        priorityCode: 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: 0,
        summary: this.state.createIssueValue,
        typeCode: this.state.selectIssueType,
        parentIssueId: 0,
        ...!isNaN(BacklogStore.getChosenEpic) ? {
          epicId: BacklogStore.getChosenEpic,
        } : {},
        ...!isNaN(BacklogStore.getChosenVersion) ? {
          versionIssueRelDTOList: [
            {
              versionId: BacklogStore.getChosenVersion,
            },
          ],
        } : {},
      };
      BacklogStore.axiosEasyCreateIssue(data).then((res) => {
        this.setState({
          loading: false,
          createIssueValue: '',
        });
        this.props.refresh();
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
    }
  }

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
  }

  onDragEnd=(result) => {
    // this.props.changeEpicStat();
    this.props.version.changeState([]);
    this.props.epic.changeState([]);
    BacklogStore.setIsDragging(false);
    this.onChangeState('draggableId', '');
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
  }
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
                destinationData =
                  newData.sprintData[index].issueSearchDTOList[
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
        destinationData =
          newData.backlogData.backLogIssue[
          newData.backlogData.backLogIssue - 1];
      } else {
        destinationData = newData.backlogData.backLogIssue[endIndex];
      }
    }
    return destinationData;
  }

  /**
   * 加载数据
   */
  getSprint=() => {
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((data) => {
      BacklogStore.setSprintData(data);
      this.setState({
        spinIf: false,
      });
    }).catch((error2) => {
    });
  }

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
              for (let aindex = 0, len2 = newData.sprintData[index].issueSearchDTOList.length; aindex < len2; aindex += 1) {
                if (destinationData.issueId) {
                  if (newData.sprintData[index].issueSearchDTOList[aindex].issueId === destinationData.issueId) {
                    afIndex = aindex + 1;
                  }
                }
              }
              newData.sprintData[index].issueSearchDTOList.splice(afIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList =
                _.flattenDeep(newData.sprintData[index].issueSearchDTOList);
            } else {
              newData.sprintData[index].issueSearchDTOList.splice(endIndex, 0, spliceDatas);
              newData.sprintData[index].issueSearchDTOList =
                _.flattenDeep(newData.sprintData[index].issueSearchDTOList);
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
          for (let aindex = 0, len = newData.backlogData.backLogIssue.length; aindex < len; aindex += 1) {
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
        axiosParam.outsetIssueId =
          destinationData.issueId;
        BacklogStore.setSprintData(newData);
      }
      this.onChangeState('selected', {
        droppableId: '',
        issueIds: [],
      });
      BacklogStore.axiosUpdateIssuesToSprint(endId === 'backlog'
        ? 0 : endId, axiosParam).then((res) => {
        this.props.IssueDetail.refreshIssueDetail();
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
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(sourceId)) {
            spliceData = newData.sprintData[index].issueSearchDTOList.splice(sourceIndex, 1)[0];
          }
        }
      } else {
        spliceData = newData.backlogData.backLogIssue.splice(sourceIndex, 1)[0];
      }
      if (endId !== 'backlog') {
        for (let index = 0, len = newData.sprintData.length; index < len; index += 1) {
          if (String(newData.sprintData[index].sprintId) === String(endId)) {
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
              // newData.sprintData[index].issueSearchDTOList[endIndex] = res[0];
              this.props.IssueDetail.refreshIssueDetail();
              // BacklogStore.setSprintData(newData);
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
          // newData.backlogData.backLogIssue[endIndex] = res[0];
          this.props.IssueDetail.refreshIssueDetail();
          // BacklogStore.setSprintData(newData);
          this.getSprint();
        }).catch((error) => {
          BacklogStore.setSprintData(originData);
        });
      }
    }
  }
  render() {
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
        onDragStart={(result) => {
          BacklogStore.setIsDragging(true);
          this.onChangeState('draggableId', result.draggableId);
          if (this.sprintItemRef.getCurrentState('selected').issueIds.indexOf(result.draggableId) === -1) {
            this.onChangeState('selected', {
              droppableId: '',
              issueIds: [],
            });
          }
          if (this.sprintItemRef.getCurrentState('selected').issueIds.length > 0) {
            this.props.version.changeState(this.sprintItemRef.getCurrentState('selected').issueIds);
            this.props.epic.changeState(this.sprintItemRef.getCurrentState('selected').issueIds);
          } else {
            this.props.version.changeState([result.draggableId]);
            this.props.epic.changeState([result.draggableId]);
          }
        }}
      >
        <div
          role="none"
          className="c7n-backlog-sprint"
        >
          <Spin spinning={this.props.spinIf}>
            <SprintItem
              epicVisible={this.props.epicVisible}
              versionVisible={this.props.versionVisible}
              onRef={(ref) => {
                this.sprintItemRef = ref;
              }}
              refresh={this.props.refresh}
            />
          </Spin>
        </div>
      </DragDropContext>
    );
  }
}

export default Sprint;

