import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Page, Header, Content, stores,
} from 'choerodon-front-boot';
import {
  Button, Select, Spin, message, Icon, Modal, Input, Form, Tooltip, Checkbox, Popover,
} from 'choerodon-ui';
import _ from 'lodash';
import { DragDropContext } from 'react-beautiful-dnd';
import ScrumBoardStore from '../../../../stores/project/scrumBoard/ScrumBoardStore';
import StatusColumn from '../ScrumBoardComponent/StatusColumn/StatusColumn';
import StatusBodyColumn from '../ScrumBoardComponent/StatusBodyColumn/StatusBodyColumn';
import './ScrumBoardHome.scss';
import IssueDetail from '../ScrumBoardComponent/IssueDetail/IssueDetail';
import SwimLaneContext from '../ScrumBoardComponent/SwimLaneContext/SwimLaneContext';
import BacklogStore from '../../../../stores/project/backlog/BacklogStore';
import CloseSprint from '../../Backlog/BacklogComponent/SprintComponent/CloseSprint';
import EmptyScrumboard from '../../../../assets/image/emptyScrumboard.svg';
import QuickSearch from '../../../../components/QuickSearch';

const { Option } = Select;
const { Sidebar } = Modal;
const FormItem = Form.Item;
let scroll;
const { AppState } = stores;
const { confirm } = Modal;

@observer
class ScrumBoardHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      spinIf: false,
      onlyMe: false,
      recent: false,
      expand: true,
      addBoard: false,
      closeSprintVisible: false,
      judgeUpdateParent: {},
      updateParentStatus: null,
      quickFilter: [],
      translateId: [],
      expandFilter: false,
    };
  }

  componentDidMount() {
    const { location } = this.props;
    this.getBoard();
    const url = this.GetRequest(location.search);
    ScrumBoardStore.axiosGetIssueTypes();
    if (url.paramIssueId) {
      ScrumBoardStore.setClickIssueDetail({ issueId: url.paramIssueId });
    }
    const timer = setInterval(() => {
      if (document.getElementsByClassName('c7n-scrumboard-content').length > 0) {
        if (document.getElementsByClassName('c7n-scrumboard-header').length > 0) {
          document.getElementsByClassName('c7n-scrumboard-header')[0].style.paddingRight = '32px';
        }
        document.getElementsByClassName('c7n-scrumboard-content')[0].style.height = `calc(100vh - ${parseInt(document.getElementsByClassName('c7n-scrumboard-content')[0].offsetTop, 10) + 48}px)`;
      }
      clearInterval(timer);
    }, 1000);
  }

  componentWillUnmount() {
    ScrumBoardStore.setClickIssueDetail({});
  }

  getIssueCount = (data, key) => {
    let count = 0;
    if (JSON.stringify(data) !== '{}') {
      _.map(data.columnsData.columns, (columns) => {
        _.map(columns.subStatuses, (status) => {
          count = _.reduce(status.issues, (sum, item) => {
            let result = sum;
            if (key === '') {
              result += 1;
              return result;
            } else if (item[key] === 0 || item[key] === null) {
              result += 1;
              return result;
            } else {
              result += 0;
              return result;
            }
          }, count);
        });
      });
      if (key === 'parentIssueId') {
        count -= data.parentIds.length;
      }
    }
    return count;
  }


  getBoard() {
    ScrumBoardStore.axiosGetBoardList().then((data) => {
      let index;
      for (let i = 0, len = data.length; i < len; i += 1) {
        if (data[i].userDefault) {
          index = i;
        }
      }
      if (!index) {
        index = 0;
      }
      // axios
      // .get(`/agile/v1/projects/${AppState.menuType.id}
      // /board/user_setting/${data[index].boardId}`)
      // .then((columnDat) => {
      //
      // });
      ScrumBoardStore.setCurrentConstraint(data[index].columnConstraint);
      ScrumBoardStore.setSwimLaneCode(data[index].userDefaultBoard);
      ScrumBoardStore.setBoardList(data);
      ScrumBoardStore.setSelectedBoard(data[index].boardId);
      this.refresh(data[index].boardId);
    }).catch((error) => {
    });
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

  refresh = (boardId) => {
    const { onlyMe, recent, quickFilter } = this.state;
    this.setState({
      spinIf: true,
    });
    ScrumBoardStore.axiosGetQuickSearchList().then((res) => {
      ScrumBoardStore.setQuickSearchList(res);
      ScrumBoardStore.axiosGetBoardData(boardId,
        onlyMe ? AppState.getUserId : 0,
        recent,
        quickFilter).then((data) => {
        this.setState({ dataSource: data });
        ScrumBoardStore.axiosGetAllEpicData().then((data2) => {
          const parentIds = [];
          const assigneeIds = [];
          const storeParentIds = [];
          const storeAssignee = [];
          const epicData = data.epicInfo ? data.epicInfo : [];
          for (let index = 0, len = data.columnsData.columns.length; index < len; index += 1) {
            for (
              let index2 = 0, len2 = data.columnsData.columns[index].subStatuses.length;
              index2 < len2;
              index2 += 1) {
              for (
                let index3 = 0, len3 = data.columnsData.columns[index]
                  .subStatuses[index2].issues.length;
                index3 < len3;
                index3 += 1) {
                if (data.parentIds
                  .indexOf(parseInt(
                    data.columnsData.columns[index].subStatuses[index2].issues[index3].issueId, 10,
                  )) !== -1) {
                  if (parentIds.indexOf(
                    data.columnsData.columns[index].subStatuses[index2].issues[index3].issueId,
                  ) === -1) {
                    const parentId = data.columnsData
                      .columns[index].subStatuses[index2].issues[index3].issueId;
                    let count = 0;
                    _.map(data.columnsData.columns, (columns) => {
                      _.map(columns.subStatuses, (status) => {
                        count = _.reduce(status.issues, (sum, item) => {
                          let result = sum;
                          if (item.parentIssueId && item.parentIssueId === parentId) {
                            result += 1;
                            return result;
                          } else {
                            result += 0;
                            return result;
                          }
                        }, count);
                      });
                    });
                    parentIds.push(data.columnsData
                      .columns[index].subStatuses[index2].issues[index3].issueId);
                    storeParentIds.push({
                      status: data.columnsData
                        .columns[index].subStatuses[index2].name,
                      categoryCode: data.columnsData
                        .columns[index].subStatuses[index2].categoryCode,
                      ...data.columnsData.columns[index].subStatuses[index2].issues[index3],
                      count,
                    });
                  }
                }
                if (data.assigneeIds
                  .indexOf(parseInt(
                    data.columnsData
                      .columns[index].subStatuses[index2].issues[index3].assigneeId, 10,
                  )) !== -1) {
                  if (assigneeIds.indexOf(data.columnsData
                    .columns[index].subStatuses[index2].issues[index3].assigneeId) === -1) {
                    if (data.columnsData
                      .columns[index].subStatuses[index2].issues[index3].assigneeId) {
                      assigneeIds.push(data.columnsData
                        .columns[index].subStatuses[index2].issues[index3].assigneeId);
                      const { assigneeId } = data.columnsData
                        .columns[index].subStatuses[index2].issues[index3];
                      let count = 0;
                      _.map(data.columnsData.columns, (columns) => {
                        _.map(columns.subStatuses, (status) => {
                          count = _.reduce(status.issues, (sum, item) => {
                            let result = sum;
                            if (item.assigneeId && item.assigneeId === assigneeId) {
                              result += 1;
                              return result;
                            } else {
                              result += 0;
                              return result;
                            }
                          }, count);
                        });
                      });
                      storeAssignee.push({
                        count,
                        assigneeId: data.columnsData
                          .columns[index].subStatuses[index2].issues[index3].assigneeId,
                        assigneeName: data.columnsData
                          .columns[index].subStatuses[index2].issues[index3].assigneeName,
                        imageUrl: data.columnsData
                          .columns[index].subStatuses[index2].issues[index3].imageUrl,
                      });
                    }
                  }
                }
              }
            }
          }
          for (let index = 0, len = epicData.length; index < len; index += 1) {
            for (let index2 = 0, len2 = data2.length; index2 < len2; index2 += 1) {
              if (String(epicData[index].epicId) === String(data2[index2].issueId)) {
                let count = 0;
                _.map(data.columnsData.columns, (columns) => {
                  _.map(columns.subStatuses, (status) => {
                    count = _.reduce(status.issues, (sum, item) => {
                      let result = sum;
                      if (epicData[index].epicId === item.epicId) {
                        result += 1;
                        return result;
                      } else {
                        result += 0;
                        return result;
                      }
                    }, count);
                  });
                });
                epicData[index].count = count;
                epicData[index].color = data2[index2].color;
              }
            }
          }

          ScrumBoardStore.setAssigneer(storeAssignee);
          ScrumBoardStore.setCurrentSprint(data.currentSprint);
          ScrumBoardStore.setParentIds(storeParentIds);
          ScrumBoardStore.setEpicData(epicData);
          const newColumnData = data.columnsData.columns;
          const statusList = [];
          for (let index = 0, len = newColumnData.length; index < len; index += 1) {
            if (newColumnData[index].subStatuses) {
              for (let index2 = 0, len2 = newColumnData[index].subStatuses.length;
                index2 < len2; index2 += 1) {
                statusList.push({
                  id: newColumnData[index].subStatuses[index2].statusId,
                  name: newColumnData[index].subStatuses[index2].name,
                });
                if (newColumnData[index].subStatuses[index2].issues) {
                  for (let index3 = 0, len3 = newColumnData[index]
                    .subStatuses[index2].issues.length;
                    index3 < len3; index3 += 1) {
                    newColumnData[index]
                      .subStatuses[index2].issues[index3].statusName = newColumnData[index]
                        .subStatuses[index2].name;
                    newColumnData[index]
                      .subStatuses[index2].issues[index3].categoryCode = newColumnData[index]
                        .subStatuses[index2].categoryCode;
                  }
                }
              }
            }
          }
          ScrumBoardStore.setStatusList(statusList);
          ScrumBoardStore.setBoardData(newColumnData);
          // this.storeIssueNumberCount(storeParentIds, )
          this.setState({
            spinIf: false,
          });
        });
      }).catch((error) => {
      });
    }).catch((error) => {
    });
  }
  // storeIssueNumberCount(storeParentIds, columns) {

  // }
  /**
   *拖动结束事件
   *
   * @param {*} result
   * @returns
   * @memberof ScrumBoardHome
   */
  handleDragEnd = (result) => {
    ScrumBoardStore.setDragStartItem({});
    if (!result.destination) {
      return;
    }
    const originState = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
    let flag = 0;
    if (ScrumBoardStore.getCurrentConstraint === 'issue') {
      // 问题计数
      if (JSON.parse(result.source.droppableId).columnId
      !== JSON.parse(result.destination.droppableId).columnId) {
        // 如果是拖不同列
        for (let oriIndex = 0, len = originState.length; oriIndex < len; oriIndex += 1) {
          if (String(originState[oriIndex].columnId)
            === String(JSON.parse(result.source.droppableId).columnId)) {
            let totalIssues = 0;
            for (
              let index = 0, len2 = originState[oriIndex].subStatuses.length;
              index < len2;
              index += 1) {
              totalIssues += originState[oriIndex].subStatuses[index].issues.length;
            }
            if (originState[oriIndex].minNum >= totalIssues) {
              flag = 1;
              message.info(`少于列${originState[oriIndex].name}的最小长度，无法更新`);
            }
          }
        }
        for (let oriIndex = 0, len = originState.length; oriIndex < len; oriIndex += 1) {
          if (String(originState[oriIndex].columnId)
          === String(JSON.parse(result.destination.droppableId).columnId)) {
            let totalIssues = 0;
            for (
              let index = 0, len2 = originState[oriIndex].subStatuses.length;
              index < len2;
              index += 1) {
              totalIssues += originState[oriIndex].subStatuses[index].issues.length;
            }
            if (originState[oriIndex].maxNum <= totalIssues) {
              flag = 1;
              message.info(`多于列${originState[oriIndex].name}的最大长度，无法更新`);
            }
          }
        }
      }
    } else if (ScrumBoardStore.getCurrentConstraint === 'issue_without_sub_task') {
      // 问题计数 不包含子任务
      if (JSON.parse(result.source.droppableId).columnId
      !== JSON.parse(result.destination.droppableId).columnId) {
        // 如果是拖不同列
        for (let oriIndex = 0, len = originState.length; oriIndex < len; oriIndex += 1) {
          if (String(originState[oriIndex].columnId)
            === String(JSON.parse(result.source.droppableId).columnId)) {
            let totalIssues = 0;
            for (
              let index = 0, len2 = originState[oriIndex].subStatuses.length;
              index < len2;
              index += 1) {
              for (
                let index2 = 0, len3 = originState[oriIndex].subStatuses[index].issues.length;
                index2 < len3;
                index2 += 1) {
                if (originState[oriIndex].subStatuses[index].issues[index2].issueTypeDTO.typeCode !== 'sub_task') {
                  totalIssues += 1;
                }
              }
            }
            if (originState[oriIndex].minNum >= totalIssues) {
              flag = 1;
              message.info(`少于列${originState[oriIndex].name}的最小长度，无法更新`);
            }
          }
        }
        for (let oriIndex = 0, len = originState.length; oriIndex < len; oriIndex += 1) {
          if (String(originState[oriIndex].columnId)
          === String(JSON.parse(result.destination.droppableId).columnId)) {
            let totalIssues = 0;
            for (
              let index = 0, len2 = originState[oriIndex].subStatuses.length;
              index < len2;
              index += 1) {
              for (
                let index2 = 0, len3 = originState[oriIndex].subStatuses[index].issues.length;
                index2 < len3;
                index2 += 1) {
                if (originState[oriIndex].subStatuses[index].issues[index2].issueTypeDTO.typeCode !== 'sub_task') {
                  totalIssues += 1;
                }
              }
            }
            if (originState[oriIndex].maxNum <= totalIssues) {
              flag = 1;
              message.info(`多于列${originState[oriIndex].name}的最大长度，无法更新`);
            }
          }
        }
      }
    }
    if (flag === 0) {
      // this.setState({
      //   spinIf: true,
      // });
      const newState = _.clone(ScrumBoardStore.getBoardData);
      const {
        issueId, objectVersionNumber, typeId, statusId,
      } = JSON.parse(result.draggableId);
      const { endStatusId } = JSON.parse(result.destination.droppableId);
      let draggableData = {};
      for (let index = 0, len = newState.length; index < len; index += 1) {
        if (String(newState[index].columnId)
          === String(JSON.parse(result.source.droppableId).columnId)) {
          for (
            let index2 = 0, len2 = newState[index].subStatuses.length;
            index2 < len2;
            index2 += 1) {
            if (String(newState[index].subStatuses[index2].statusId)
              === String(JSON.parse(result.source.droppableId).endStatusId)) {
              let spliceIndex = '';
              for (
                let index3 = 0, len3 = newState[index].subStatuses[index2].issues.length;
                index3 < len3;
                index3 += 1) {
                if (String(newState[index].subStatuses[index2].issues[index3].issueId)
                  === String(issueId)) {
                  spliceIndex = index3;
                }
              }
              [draggableData] = newState[index].subStatuses[index2].issues.splice(spliceIndex, 1);
            }
          }
        }
      }
      for (let index = 0, len = newState.length; index < len; index += 1) {
        if (String(newState[index].columnId)
        === String(JSON.parse(result.destination.droppableId).columnId)) {
          for (
            let index2 = 0, len2 = newState[index].subStatuses.length;
            index2 < len2;
            index2 += 1) {
            if (String(newState[index].subStatuses[index2].statusId)
            === String(JSON.parse(result.destination.droppableId).endStatusId)) {
              newState[index].subStatuses[index2].issues.splice(
                result.destination.index, 0, draggableData,
              );
            }
          }
        }
      }
      ScrumBoardStore.setBoardData(newState);
      let destinationStatus;
      ScrumBoardStore.loadTransforms(statusId, issueId, typeId).then((types) => {
        if (types && _.some(types, t => t.endStatusId === endStatusId)) {
          const transformId = types.filter(t => t.endStatusId === endStatusId)[0].id;
          ScrumBoardStore.updateIssue(
            issueId, objectVersionNumber, endStatusId, ScrumBoardStore.getSelectedBoard,
            JSON.parse(result.source.droppableId).columnId,
            JSON.parse(result.destination.droppableId).columnId,
            transformId,
          ).then((data) => {
            if (data.failed) {
              // message.info(data.message);
              ScrumBoardStore.setBoardData(originState);
            } else {
              for (let index = 0, len = ScrumBoardStore.getStatusList.length;
                index < len; index += 1) {
                if (data.statusId === ScrumBoardStore.getStatusList[index].id) {
                  draggableData.statusName = ScrumBoardStore.getStatusList[index].name;
                }
              }
              draggableData.objectVersionNumber = data.objectVersionNumber;
              draggableData.categoryCode = JSON.parse(result.destination.droppableId).categoryCode;
              for (let index = 0, len = newState.length; index < len; index += 1) {
                if (String(newState[index].columnId)
                  === String(JSON.parse(result.destination.droppableId).columnId)) {
                  for (
                    let index2 = 0, len2 = newState[index].subStatuses.length;
                    index2 < len2;
                    index2 += 1) {
                    if (String(newState[index].subStatuses[index2].statusId)
                      === String(JSON.parse(result.destination.droppableId).endStatusId)) {
                      destinationStatus = newState[index].subStatuses[index2].categoryCode;
                      newState[index].subStatuses[index2].issues.splice(
                        result.destination.index, 1, draggableData,
                      );
                    }
                  }
                }
              }
              ScrumBoardStore.setBoardData(newState);
              if (draggableData.parentIssueId) {
                if (destinationStatus === 'done') {
                  let parentIdCode;
                  let parentIdNum;
                  let parentObjectVersionNumber;
                  for (
                    let index = 0, len = ScrumBoardStore.getParentIds.length;
                    index < len;
                    index += 1) {
                    if (ScrumBoardStore.getParentIds[index].issueId
                      === draggableData.parentIssueId) {
                      parentIdCode = ScrumBoardStore.getParentIds[index].categoryCode;
                      parentIdNum = ScrumBoardStore.getParentIds[index].issueNum;
                      parentObjectVersionNumber = ScrumBoardStore
                        .getParentIds[index].objectVersionNumber;
                    }
                  }
                  const judge = ScrumBoardStore.judgeMoveParentToDone(
                    parentIdCode, draggableData.parentIssueId,
                  );
                  if (judge) {
                    this.matchStatus(types);
                    this.setState({
                      judgeUpdateParent: {
                        id: draggableData.parentIssueId,
                        issueNumber: parentIdNum,
                        code: parentIdCode,
                        objectVersionNumber: parentObjectVersionNumber,
                      },
                    });
                  }
                }
              }
            }
          }).catch((error) => {
            ScrumBoardStore.setBoardData(JSON.parse(JSON.stringify(originState)));
          });
        } else {
          ScrumBoardStore.setBoardData(JSON.parse(JSON.stringify(originState)));
        }
      });
    }
  }

  /**
   *创建面板
   *
   * @param {*} e
   * @memberof ScrumBoardHome
   */
  handleCreateBoard = (e) => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        ScrumBoardStore.axiosCreateBoard(values.name).then((res) => {
          form.resetFields();
          message.success('创建成功');
          this.setState({
            addBoard: false,
          });
          this.getBoard();
        }).catch((error) => {
        });
      }
    });
  }


  /**
   *仅故事
   *
   * @memberof ScrumBoardHome
   */
  filterOnlyStory = () => {
    const { recent } = this.state;
    this.setState({
      recent: !recent,
    }, () => {
      this.refresh(ScrumBoardStore.getSelectedBoard);
    });
  }

  /**
   *仅我的
   *
   * @memberof ScrumBoardHome
   */
  filterOnlyMe = () => {
    const { onlyMe } = this.state;
    this.setState({
      onlyMe: !onlyMe,
    }, () => {
      this.refresh(ScrumBoardStore.getSelectedBoard);
    });
  }

  /**
   *完成冲刺
   *
   * @memberof ScrumBoardHome
   */
  handleFinishSprint = () => {
    BacklogStore.axiosGetSprintCompleteMessage(
      ScrumBoardStore.getCurrentSprint.sprintId,
    ).then((res) => {
      BacklogStore.setSprintCompleteMessage(res);
      let flag = 0;
      if (res.parentsDoneUnfinishedSubtasks) {
        if (res.parentsDoneUnfinishedSubtasks.length > 0) {
          flag = 1;
          let issueNums = '';
          for (
            let index = 0, len = res.parentsDoneUnfinishedSubtasks.length;
            index < len;
            index += 1) {
            issueNums += `${res.parentsDoneUnfinishedSubtasks[index].issueNum} `;
          }
          confirm({
            title: 'warnning',
            content: `父卡${issueNums}有未完成的子任务，无法完成冲刺`,
            onCancel() {
            },
          });
        }
      }
      if (flag === 0) {
        this.setState({
          closeSprintVisible: true,
        });
      }
    }).catch((error) => {
    });
  }

  // 渲染状态列表头
  renderStatusColumns = () => {
    const data = ScrumBoardStore.getBoardData;
    const result = [];
    for (let index = 0, len = data.length; index < len; index += 1) {
      if (data[index].subStatuses.length > 0) {
        result.push(
          <StatusColumn
            key={data[index].columnId}
            data={data[index]}
          />,
        );
      }
    }
    return result;
  }

  // 渲染issue列
  renderIssueColumns = (id) => {
    const result = [];
    const data = ScrumBoardStore.getBoardData.filter(obj => obj.columnId !== 'unset');
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      // 故事泳道
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses.length > 0) {
          result.push(
            <StatusBodyColumn
              key={data[index].columnId}
              data={data[index]}
              parentId={id}
              source={_.isUndefined(id) ? 'other' : id}
            />,
          );
        }
      }
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      // 经办人泳道
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses.length > 0) {
          result.push(
            <StatusBodyColumn
              key={data[index].columnId}
              data={data[index]}
              assigneeId={id}
            />,
          );
        }
      }
    } else if (ScrumBoardStore.getSwimLaneCode === 'swimlane_epic') {
      // 史诗 泳道
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses.length > 0) {
          result.push(
            <StatusBodyColumn
              key={data[index].columnId}
              data={data[index]}
              epicId={id}
            />,
          );
        }
      }
    } else {
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses.length > 0) {
          result.push(
            <StatusBodyColumn
              key={data[index].columnId}
              data={data[index]}
            />,
          );
        }
      }
    }
    return result;
  }

  /**
   * 渲染被分配的任务列
   * @returns {Array}
   */
  renderSwimlane = () => {
    let ids = [];
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      ids = ScrumBoardStore.getParentIds;
      ids = _.sortBy(ids, o => o.rank);
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      ids = ScrumBoardStore.getAssigneer;
      ids = _.sortBy(ids, o => o.assigneeId);
    } else if (ScrumBoardStore.getSwimLaneCode === 'swimlane_epic') {
      ids = ScrumBoardStore.getEpicData;
      ids = _.sortBy(ids, o => o.epicId);
    }
    const result = [];
    for (let index = 0, len = ids.length; index < len; index += 1) {
      result.push(
        <SwimLaneContext
          key={`${ids[index].assigneeId}-${index}`}
          data={ids[index]}
          handleDragEnd={this.handleDragEnd.bind(this)}
          renderIssueColumns={this.renderIssueColumns.bind(this)}
          changeState={(name, value) => {
            this.setState({
              [name]: value,
            });
          }}
        />,
      );
    }
    return result;
  };

  renderHeight = () => {
    if (document.getElementsByClassName('c7n-scrumboard-content').length > 0) {
      return `calc(100vh - ${parseInt(document.getElementsByClassName('c7n-scrumboard-content')[0].offsetTop, 10) + 48}px)`;
    }
    return '';
  };

  renderOthersTitle = () => {
    let result = '';
    const { dataSource } = this.state;
    const data = dataSource || {};
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      result = (
        <span>
          {'其他问题'}
          <span className="c7n-scrumboard-otherHeader-issueCount">
            {`${this.getIssueCount(data, 'parentIssueId')} 问题`}
          </span>
        </span>
      );
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      result = (
        <span>
          {'未分配的问题'}
          <span className="c7n-scrumboard-otherHeader-issueCount">
            {`${this.getIssueCount(data, 'assigneeId')} 问题`}
          </span>
        </span>
      );
    } else if (ScrumBoardStore.getSwimLaneCode === 'swimlane_epic') {
      result = (
        <span>
          {' 所有问题 '}
          <span className="c7n-scrumboard-otherHeader-issueCount">
            {`${this.getIssueCount(data, 'epicId')} 问题`}
          </span>
        </span>
      );
    } else {
      result = (
        <span>
          {' 所有问题 '}
          <span className="c7n-scrumboard-otherHeader-issueCount">
            {`${this.getIssueCount(data, '')}问题`}
          </span>
        </span>
      );
    }
    return result;
  }


  renderOtherSwimlane = () => {
    let result = '';
    const { expand } = this.state;
    const data = ScrumBoardStore.getBoardData;
    let flag = 0;
    // 如果没有其他任务则其他任务列就不渲染，
    if (ScrumBoardStore.getSwimLaneCode === 'parent_child') {
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses) {
          for (let index2 = 0, len2 = data[index].subStatuses.length; index2 < len2; index2 += 1) {
            if (data[index].subStatuses[index2].issues) {
              for (
                let index3 = 0, len3 = data[index].subStatuses[index2].issues.length;
                index3 < len3;
                index3 += 1) {
                if (!data[index].subStatuses[index2].issues[index3].parentIssueId) {
                  flag = 1;
                }
              }
            }
          }
        }
      }
    } else if (ScrumBoardStore.getSwimLaneCode === 'assignee') {
      for (let index = 0, len = data.length; index < len; index += 1) {
        if (data[index].subStatuses) {
          for (let index2 = 0, len2 = data[index].subStatuses.length; index2 < len2; index2 += 1) {
            if (data[index].subStatuses[index2].issues) {
              for (
                let index3 = 0, len3 = data[index].subStatuses[index2].issues.length;
                index3 < len3;
                index3 += 1) {
                if (!data[index].subStatuses[index2].issues[index3].assigneeId) {
                  flag = 1;
                }
              }
            }
          }
        }
      }
    } else {
      flag = 1;
    }
    // 有flag才渲染
    if (flag === 1) {
      result = (
        <div className="c7n-scrumboard-others">
          <div className="c7n-scrumboard-otherHeader">
            <Icon
              style={{ fontSize: 17, cursor: 'pointer', marginRight: 8 }}
              type={expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}
              role="none"
              onClick={() => {
                this.setState({
                  expand: !expand,
                });
              }}
            />
            {this.renderOthersTitle()}
          </div>
          <div
            className="c7n-scrumboard-otherContent"
            style={{
              display: expand ? 'flex' : 'none',
            }}
          >
            <DragDropContext
              onDragEnd={this.handleDragEnd.bind(this)}
              onDragStart={(start) => {
                ScrumBoardStore.setDragStartItem(start);
              }}
            >
              {this.renderIssueColumns()}
            </DragDropContext>
          </div>
        </div>
      );
    }
    return result;
  }

  onChangeSelect = (newState) => {
    this.setState({
      quickFilter: newState,
    }, () => {
      this.refresh(ScrumBoardStore.getSelectedBoard);
    });
  };

  matchStatus = (translate) => {
    if (translate instanceof Array) {
      const subStatus = ScrumBoardStore
        .getBoardData[ScrumBoardStore.getBoardData.length - 1].subStatuses;
      // 以 translate 的 endStatusId 组建 Set
      const tempTranslate = new Set(translate.map(v => v.endStatusId));
      // 以选项的 statusId 组建 Set，计算两个 Set 的公有交集
      const intersection = new Set(
        subStatus.map(v => v.statusId).filter(v => tempTranslate.has(v)),
      );
      // 选取出 translate 中有 endStatusId 的项
      const ret = translate.filter(v => intersection.has(v.endStatusId));
      this.setState({
        translateId: ret,
      });
    }
  };

  render() {
    const { form: { getFieldDecorator }, history } = this.props;
    const {
      dataSource,
      spinIf,
      expandFilter,
      onlyMe,
      recent,
      closeSprintVisible,
      judgeUpdateParent,
      addBoard,
      updateParentStatus,
      translateId,
    } = this.state;
    return (
      <Page
        className="c7n-scrumboard-page"
        service={[
          'agile-service.board.deleteScrumBoard',
          'agile-service.issue-status.createStatus',
          'agile-service.board-column.createBoardColumn',
          'agile-service.issue-status.deleteStatus',
          'agile-service.issue-status.updateStatus',
          'agile-service.issue.deleteIssue',
          'agile-service.board.queryByProjectId',
          'agile-service.board.queryByOptions',
        ]}
      >
        <Header title="活跃冲刺">
          <Button
            funcType="flat"
            onClick={() => {
              this.setState({
                addBoard: true,
              });
            }}
          >
            <Icon type="playlist_add icon" />
            <span>创建看板</span>
          </Button>
          <Select
            className="select-without-underline"
            value={ScrumBoardStore.getSelectedBoard}
            style={{
              maxWidth: 100, color: '#3F51B5', margin: '0 30px', fontWeight: 500, lineHeight: '28px',
            }}
            dropdownStyle={{
              color: '#3F51B5',
              width: 200,
            }}
            onChange={(value) => {
              let newCode;
              for (
                let index = 0, len = ScrumBoardStore.getBoardList.length;
                index < len;
                index += 1) {
                if (ScrumBoardStore.getBoardList[index].boardId === value) {
                  ScrumBoardStore.setCurrentConstraint(
                    ScrumBoardStore.getBoardList[index].columnConstraint,
                  );
                  newCode = ScrumBoardStore.getBoardList[index].userDefaultBoard;
                }
              }
              ScrumBoardStore.setSelectedBoard(value);
              ScrumBoardStore.setSwimLaneCode(newCode);
              this.refresh(value);
            }}
          >
            {
              ScrumBoardStore.getBoardList.map(item => (
                <Option key={item.boardId} value={item.boardId}>
                  <Tooltip title={item.name}>
                    {item.name}
                  </Tooltip>
                </Option>
              ))
            }
          </Select>
          {
            // this.state.dataSource && this.state.dataSource.currentSprint
            // && this.state.dataSource.currentSprint.sprintId ? (
            //   <Button className="leftBtn2" funcType="flat"
            // onClick={() => { this.props.history.push(`/agile/iterationBoard/
            // ${this.state.dataSource.currentSprint.sprintId}?type=project&id=
            // ${AppState.currentMenuType.id}&name=
            // ${AppState.currentMenuType.name}&organizationId=
            // ${AppState.currentMenuType.organizationId}`); }}>
            //     <span>切换至工作台</span>
            //   </Button>
            // ) : null

             (
               <Button className="leftBtn2" disabled={!dataSource ? false : !(dataSource && dataSource.currentSprint && dataSource.currentSprint.sprintId)} funcType="flat" onClick={() => { history.push(`/agile/iterationBoard/${dataSource.currentSprint.sprintId}?type=project&id=${AppState.currentMenuType.id}&name=${AppState.currentMenuType.name}&organizationId=${AppState.currentMenuType.organizationId}`); }}>
                 <span>切换至工作台</span>
               </Button>
            )
          }
          <Button className="leftBtn2" funcType="flat" onClick={this.refresh.bind(this, ScrumBoardStore.getSelectedBoard)}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <div style={{ padding: 0, display: 'flex' }}>
          <div style={{ flexGrow: 1, overflow: 'hidden' }}>
            <Spin spinning={spinIf}>
              <div className="c7n-scrumTools">
                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                  <QuickSearch
                    title
                    buttonName="更多"
                    buttonIcon="more_vert"
                    moreSelection={ScrumBoardStore.getQuickSearchList}
                    onChangeCheckBox={this.onChangeSelect}
                    onlyStory={this.filterOnlyStory.bind(this)}
                    onlyMe={this.filterOnlyMe.bind(this)}
                  />
                </div>
                <div className="c7n-scrumTools-right" style={{ display: 'flex', alignItems: 'center', color: 'rgba(0,0,0,0.54)' }}>
                  <Icon type="av_timer" />
                  <span style={{ paddingLeft: 5, marginLeft: 0, marginRight: 15 }}>{`${ScrumBoardStore.getCurrentSprint && ScrumBoardStore.getCurrentSprint.dayRemain >= 0 ? `${ScrumBoardStore.getCurrentSprint.dayRemain} days剩余` : '无剩余时间'}`}</span>
                  <Button
                    funcType="flat"
                    onClick={this.handleFinishSprint.bind(this)}
                    disabled={!ScrumBoardStore.getCurrentSprint}
                  >
                    <Icon type="power_settings_new icon" />
                    <span style={{ marginLeft: 0 }}>完成Sprint</span>
                  </Button>
                  <Button
                    funcType="flat"
                    onClick={() => {
                      const urlParams = AppState.currentMenuType;
                      history.push(`/agile/scrumboard/setting?type=${urlParams.type}&id=${urlParams.id}&name=${encodeURIComponent(urlParams.name)}&organizationId=${urlParams.organizationId}&boardId=${ScrumBoardStore.getSelectedBoard}`);
                    }}
                  >
                    <Icon type="settings icon" />
                    <span style={{ marginLeft: 0 }}>配置</span>
                  </Button>
                </div>
              </div>
              {
                closeSprintVisible ? (
                  <CloseSprint
                    store={BacklogStore}
                    visible={closeSprintVisible}
                    onCancel={() => {
                      this.setState({
                        closeSprintVisible: false,
                      });
                    }}
                    data={{
                      sprintId: ScrumBoardStore.getCurrentSprint.sprintId,
                      sprintName: ScrumBoardStore.getCurrentSprint.sprintName,
                    }}
                    refresh={this.getBoard.bind(this)}
                  />
                ) : ''
              }
              <div className="c7n-scrumboard">
                <div className="c7n-scrumboard-header">
                  {this.renderStatusColumns()}
                </div>
                <div
                  className="c7n-scrumboard-content"
                  style={{
                    // height: `calc(100vh - ${88 + 48}px)`,
                    paddingBottom: 83,
                  }}
                >
                  {
                    ScrumBoardStore.getCurrentSprint ? (
                      <div className="c7n-scrumboard-container">
                        {this.renderSwimlane()}
                        {this.renderOtherSwimlane()}
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '80px',
                        }}
                      >
                        <img style={{ width: 170 }} src={EmptyScrumboard} alt="emptyscrumboard" />
                        <div
                          style={{
                            marginLeft: 40,
                          }}
                        >
                          <p style={{ color: 'rgba(0,0,0,0.65)' }}>没有活动的Sprint</p>
                          <p style={{ fontSize: 20, lineHeight: '34px' }}>
                            {'在'}
                            <span style={{ color: '#3f51b5' }}>待办事项</span>
                            {'中开始Sprint'}
                          </p>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            </Spin>
          </div>
          <IssueDetail
            visible={JSON.stringify(ScrumBoardStore.getClickIssueDetail) !== '{}'}
            refresh={this.refresh.bind(this, ScrumBoardStore.getSelectedBoard)}
          />
          <Modal
            closable={false}
            title="更新父问题"
            visible={JSON.stringify(judgeUpdateParent) !== '{}'}
            onCancel={() => {
              this.setState({
                judgeUpdateParent: {},
                updateParentStatus: null,
              });
            }}
            onOk={() => {
              const data = {
                issueId: judgeUpdateParent.id,
                objectVersionNumber: judgeUpdateParent.objectVersionNumber,
                transformId: updateParentStatus,
              };
              BacklogStore.axiosUpdateIssue(data).then((res) => {
                this.refresh(ScrumBoardStore.getSelectedBoard);
                this.setState({
                  judgeUpdateParent: {},
                  updateParentStatus: null,
                });
              }).catch((error) => {
              });
            }}
          >
            <p>
              {'任务'}
              {judgeUpdateParent.issueNumber}
              {'的全部子任务为done'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <p style={{ marginRight: 20 }}>您是否要更新父问题进行匹配</p>
              <Select
                style={{
                  width: 250,
                }}
                onChange={(value) => {
                  this.setState({
                    updateParentStatus: value,
                  });
                }}
                defaultValue={translateId && translateId.length ? translateId[0].id : undefined}
              >
                {
                  ScrumBoardStore.getBoardData.length > 0
                    ? translateId.map(item => (
                      <Option key={item.id} value={item.id}>{item.statusDTO.name}</Option>
                    )) : ''
                }
              </Select>
            </div>
          </Modal>
          <Sidebar
            title="创建看板"
            visible={addBoard}
            onCancel={() => {
              this.setState({
                addBoard: false,
              });
            }}
            okText="创建"
            cancelText="取消"
            onOk={this.handleCreateBoard.bind(this)}
          >
            <Content
              style={{ padding: 0 }}
              title={`创建项目“${AppState.currentMenuType.name}”的看板`}
              description="请在下面输入看板名称，创建一个新的board。新的board会默认为您创建'待处理'、'处理中'、'已完成'三个列，同时将todo、doing、done三个类别的状态自动关联入三个列中。"
              link="http://v0-10.choerodon.io/zh/docs/user-guide/agile/sprint/create-kanban/"
            >
              <Form>
                <FormItem>
                  {getFieldDecorator('name', {
                    rules: [{
                      required: true, message: '看板名是必须的',
                    }],
                  })(
                    <Input
                      style={{
                        width: 512,
                      }}
                      label="看板名称"
                      maxLength={30}
                    />,
                  )}
                </FormItem>
              </Form>
            </Content>
          </Sidebar>
        </div>
      </Page>
    );
  }
}

export default Form.create()(ScrumBoardHome);
