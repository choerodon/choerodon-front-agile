import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { DatePicker, Input, Button, Select, Icon, Tooltip, Popover, Modal, Table, Avatar, Dropdown, Menu } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import _ from 'lodash';
import { fromJS, is } from 'immutable';
import moment from 'moment';
import CloseSprint from './CloseSprint';
// import this.props.store from '../../../../../stores/project/backlog/this.props.store';
import StartSprint from './StartSprint';
import emptyPng from '../../../../../assets/image/emptySprint.png';
import EasyEdit from '../../../../../components/EasyEdit/EasyEdit';
import AssigneeModal from './AssigneeModal';
import Typetag from '../../../../../components/TypeTag';
import UserHead from '../../../../../components/UserHead';
import EmptyBacklog from '../../../../../assets/image/emptyBacklog.png';

const { Sidebar } = Modal;
const Option = Select.Option;
const confirm = Modal.confirm;
const { AppState } = stores;

@observer
class SprintItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editStartDate: false,
      editendDate: false,
      expand: true,
      createIssue: false,
      selectIssueType: 'story',
      createIssueValue: '',
      editName: false,
      editGoal: false,
      closeSprintVisible: false,
      startSprintVisible: false,
      visibleAssign: false,
      loading: false,
      total: {
        totalIssue: '无',
        totalStoryPoints: '无',
        totalTime: '无',
      },
      selected: {
        droppableId: '',
        issueIds: [],
      },
    };
  }
  componentDidMount() {
    this.props.onRef(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }

  /**
   *父组件修改该组件state的方法
   *
   * @param {*} params
   * @param {*} data
   * @memberof Sprint
   */
  onChangeState=(params, data) => {
    this.setState({
      [params]: data,
    });
  }

  /**
   *键盘按起事件
   *
   * @param {*} event
   * @memberof Sprint
   */
  onKeyUp=(event) => {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.className !== 'ql-editor') {
      this.setState({
        keydown: '',
      });
    }
  }

  /**
   *键盘按下事件
   *
   * @param {*} event
   * @memberof Sprint
   */
  onKeyDown=(event) => {
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.className !== 'ql-editor') {
      if (event.keyCode !== this.state.keydown) {
        this.setState({
          keydown: event.keyCode,
        });
      }
    }
  }

  // shouldComponentUpdate = (nextProps, nextState) => {
  //   const thisProps = fromJS(this.props || {});
  //   const thisState = fromJS(this.state || {});
  //   const nextStates = fromJS(nextState || {});
  //   if (thisProps.size !== nextProps.size ||
  //     thisState.size !== nextState.size) {
  //     return true;
  //   }
  //   if (is(thisState, nextStates)) {
  //     return false;
  //   }
  //
  //   return true;
  // };
  /**
   *获取首字母
   *
   * @param {*} str
   * @returns
   * @memberof SprintItem
   */
  getFirst =(str) => {
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return str[0];
  }
  /**
   *开始结束时间更新事件
   *
   * @param {*} type
   * @param {*} date2
   * @memberof SprintItem
   */
  updateDate =(type, date2, item) => {
    let date = date2;
    const data = {
      objectVersionNumber: item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: item.sprintId,
      [type]: date += ' 00:00:00',
    };
    this.props.store.axiosUpdateSprint(data).then((res) => {
      this.props.refresh();
    }).catch((error) => {
    });
  }
  /**
   *简易创建issue事件
   *
   * @memberof SprintItem
   */
  handleBlurCreateIssue = (type, item, index) => {
    if (this[`${index}-addInput`].input.value !== '') {
      this.setState({
        loading: true,
      });
      const data = {
        priorityCode: this.props.store.getProjectInfo.defaultPriorityCode ? this.props.store.getProjectInfo.defaultPriorityCode : 'medium',
        projectId: AppState.currentMenuType.id,
        sprintId: type !== 'backlog' ? item.sprintId : 0,
        summary: this[`${index}-addInput`].input.value,
        typeCode: this.state.selectIssueType,
        ...!isNaN(this.props.store.getChosenEpic) ? {
          epicId: this.props.store.getChosenEpic,
        } : {},
        ...!isNaN(this.props.store.getChosenVersion) ? {
          versionIssueRelDTOList: [
            {
              versionId: this.props.store.getChosenVersion,
            },
          ],
        } : {},
        parentIssueId: 0,
      };
      this.props.store.axiosEasyCreateIssue(data).then((res) => {
        this.setState({
          [`${index}-create`]: {
            createIssue: false,
          },
          // createIssueValue: '',
          loading: false,
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
   *修改冲刺名
   *
   * @param {*} value
   * @memberof SprintItem
   */
  handleBlurName =(value) => {
    const data = {
      objectVersionNumber: this.props.item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: this.props.item.sprintId,
      sprintName: value,
    };
    this.props.store.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editName: false,
      });
      this.props.refresh();
    }).catch((error) => {
    });
  }

  /**
   *修改冲刺目标
   *
   * @param {*} value
   * @memberof SprintItem
   */
  handleBlurGoal =(value, item) => {
    const data = {
      objectVersionNumber: item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: item.sprintId,
      sprintGoal: value,
    };
    this.props.store.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editGoal: false,
      });
      this.props.refresh();
    }).catch((error) => {
    });
  }
  /**
   *完成冲刺事件
   *
   * @memberof SprintItem
   */
  handleFinishSprint =(item) => {
    this.props.store.axiosGetSprintCompleteMessage(
      item.sprintId).then((res) => {
      this.props.store.setSprintCompleteMessage(res);
      let flag = 0;
      if (res.parentsDoneUnfinishedSubtasks) {
        if (res.parentsDoneUnfinishedSubtasks.length > 0) {
          flag = 1;
          let issueNums = '';
          for (let index = 0, len = res.parentsDoneUnfinishedSubtasks.length; index < len; index += 1) {
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
  /**
   *开启冲刺事件
   *
   * @memberof SprintItem
   */
  handleStartSprint =(item) => {
    if (!this.props.store.getSprintData.sprintData.filter(items => items.statusCode === 'started').length > 0) {
      if (item.issueSearchDTOList.length > 0) {
        this.props.store.axiosGetOpenSprintDetail(
          item.sprintId).then((res) => {
          this.props.store.setOpenSprintDetail(res);
          this.setState({
            startSprintVisible: true,
          });
        }).catch((error) => {
        });
      }
    }
  }
  /**
   *删除冲刺事件
   *
   * @param {*} e
   * @memberof SprintItem
   */
  handleDeleteSprint =(item, e) => {
    if (e.key === '0') {
      this.props.store.axiosDeleteSprint(item.sprintId).then((res) => {
        this.props.refresh();
      }).catch((error) => {
      });
    }
  }
  /**
   *清除过滤器
   *
   * @memberof SprintItem
   */
  clearFilter =() => {
    this.props.store.setChosenEpic('all');
    this.props.store.setChosenVersion('all');
    this.props.store.setOnlyMe(false);
    this.props.store.setRecent(false);
    this.props.store.setQuickFilters([]);
    this.props.store.axiosGetSprint(this.props.store.getSprintFilter()).then((res) => {
      this.props.store.setSprintData(res);
    }).catch((error) => {
    });
  }
  /**
   *单个冲刺渲染issue或者无issue提示
   *
   * @param {*} issues
   * @param {*} sprintId
   * @returns
   * @memberof SprintItem
   */
  renderIssueOrIntro =(type, index, issues, sprintId) => {
    if (issues) {
      if (issues.length > 0) {
        return this.renderSprintIssue(issues, sprintId);
      }
    }
    if (type !== 'backlog') {
      if (index === 0) {
        return (
          <div style={{ display: 'flex', height: 100 }} className="c7n-noissue-notzero">
            <img style={{ width: 80, height: 70 }} alt="空sprint" src={emptyPng} />
            <div style={{ marginLeft: 20 }}>
              <p>计划您的SPRINT</p>
              <p>这是一个Sprint。将问题拖拽至此来计划一个Sprint。</p>
            </div>
          </div>
        );
      } else if (this.props.store.getChosenEpic !== 'all' || this.props.store.getChosenVersion !== 'all') {
        return (
          <div className="c7n-noissue-notzero">在sprint中所有问题已筛选</div>
        );
      } else {
        return (
          <div className="c7n-noissue-notzero">要计划一次sprint, 可以拖动本次sprint页脚到某个问题的下方，或者把问题拖放到这里</div>
        );
      }
    }
    return '';
  }
  /**
   *开启冲刺字段样式
   *
   * @param {*} type
   * @returns
   * @memberof SprintItem
   */
  renderOpenColor =(item, type) => {
    if (this.props.store.getSprintData.sprintData.filter(items => items.statusCode === 'started').length === 0) {
      if (item.issueSearchDTOList) {
        if (item.issueSearchDTOList.length > 0) {
          if (type === 'color') {
            return '#3f51b5';
          } else {
            return 'pointer';
          }
        }
      }
    }
    if (type === 'color') {
      return 'rgba(0,0,0,0.26)';
    } else {
      return 'not-allowed';
    }
  }
  /**
   *渲染初始化开始与结束时间
   *
   * @param {*} item
   * @param {*} type
   * @returns
   * @memberof SprintItem
   */
  renderData =(item, type) => {
    //   startDate endDate
    let result = '';
    if (!_.isNull(item[type])) {
      result = `${item[type].split('-')[0]}年${item[type].split('-')[1]}月${item[type].split('-')[2].substring(0, 2)}日 ${item[type].split(' ')[1]}`;
    } else {
      result = '无';
    }
    return result;
  }


  renderStatusCodeDom =(item) => {
    const menu = (
      <Menu
        onClick={this.handleDeleteSprint.bind(this, item)}
      >
        <Menu.Item key="0">
          删除sprint
        </Menu.Item>
      </Menu>
    );
    if (item.statusCode) {
      return (
        <div className="c7n-backlog-sprintTitleSide">
          {item.statusCode === 'started' ? (
            <p className="c7n-backlog-sprintStatus">活跃</p>
          ) : (
            <p className="c7n-backlog-sprintStatus2">未开始</p>
          )}
          {item.statusCode === 'started' ? (
            <div style={{ display: 'flex' }}>
              <p
                className="c7n-backlog-closeSprint"
                role="none"
                onClick={this.handleFinishSprint.bind(this, item)}
              >完成冲刺</p>
              {/* <Dropdown overlay={menu} trigger={['click']}>
                <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
              </Dropdown> */}
            </div>
          ) : (
            <div style={{ display: 'flex' }}>
              <p
                className="c7n-backlog-openSprint"
                style={{
                  color: this.renderOpenColor(item, 'color'),
                  cursor: this.renderOpenColor(item, 'cursor'),
                }}
                role="none"
                onClick={this.handleStartSprint.bind(this, item)}
              >开启冲刺</p>
              <Dropdown overlay={menu} trigger={['click']}>
                <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
              </Dropdown>
            </div>
          )}
          <StartSprint
            store={this.props.store}
            visible={this.state.startSprintVisible}
            onCancel={() => {
              this.setState({
                startSprintVisible: false,
              });
            }}
            data={item}
            refresh={this.props.refresh}
          />
          <CloseSprint
            store={this.props.store}
            visible={this.state.closeSprintVisible}
            onCancel={() => {
              this.setState({
                closeSprintVisible: false,
              });
            }}
            data={item}
            refresh={this.props.refresh}
          />
        </div>
      );
    }
    return '';
  };


  /**
   *单个issue点击事件
   *
   * @param {*} sprintId
   * @param {*} item
   * @memberof Sprint
   */
  handleClickIssue=(sprintId, item) => {
    // command ctrl shift
    if (this.state.keydown === 91 || this.state.keydown === 17 || this.state.keydown === 16) {
      // 如果没点击
      if (this.state.selected.droppableId === '') {
        this.setState({
          selected: {
            droppableId: sprintId,
            issueIds: [item.issueId],
          },
        });
        this.props.store.setSelectIssue([item.issueId]);
      } else if (String(
          this.state.selected.droppableId) === String(sprintId)) {
        // 如果点击的是当前列的卡片
        const originIssueIds = _.clone(this.state.selected.issueIds);
        // 如果不存在
        if (originIssueIds.indexOf(item.issueId) === -1) {
          // 如果不是shift 则加一条issueid
          if (this.state.keydown !== 16) {
            this.setState({
              selected: {
                droppableId: sprintId,
                issueIds: [...originIssueIds, item.issueId],
              },
            });
            this.props.store.setSelectIssue([...originIssueIds, item.issueId]);
          } else {
            let clickSprintDatas = [];
            const firstClick = originIssueIds[0];
            if (item.sprintId) {
              // 如果是shift 并且点击的是冲刺里的issue
              clickSprintDatas = this.props.store.getSprintData.sprintData
                .filter(s => s.sprintId === item.sprintId)[0].issueSearchDTOList;
            } else {
              // 如果是shift 并且点击的是backlog里的issue
              clickSprintDatas = this.props.store.getSprintData.backlogData.backLogIssue;
            }
            const indexs = [];
            for (let index = 0, len = clickSprintDatas.length; index < len; index += 1) {
              if (clickSprintDatas[index].issueId === firstClick || clickSprintDatas[index].issueId === item.issueId) {
                indexs.push(index);
              }
            }
            const issueIds = [];
            for (let index = 0, len = clickSprintDatas.length; index < len; index += 1) {
              if (index >= indexs[0] && index <= indexs[1]) {
                issueIds.push(clickSprintDatas[index].issueId);
              }
            }
            this.setState({
              selected: {
                droppableId: sprintId,
                issueIds,
              },
            });
            this.props.store.setSelectIssue(issueIds);
          }
        } else if (originIssueIds.length > 1) {
          // 如果存在 并且不是最后一个
          originIssueIds.splice(originIssueIds.indexOf(item.issueId), 1);
          this.setState({
            selected: {
              droppableId: sprintId,
              issueIds: originIssueIds,
            },
          });
          this.props.store.setSelectIssue(originIssueIds);
        } else {
          this.setState({
            selected: {
              droppableId: '',
              issueIds: [],
            },
          });
          this.props.store.setSelectIssue([]);
        }
      }
    } else {
      this.setState({
        selected: {
          droppableId: sprintId,
          issueIds: [item.issueId],
        },
      });
      this.props.store.setSelectIssue([item.issueId]);
      this.props.store.setClickIssueDetail(item);
    }
  }

  /**
   *拿到首字母
   *
   * @param {*} str
   * @returns
   * @memberof SprintIssue
   */
  getFirst =(str) => {
    if (!str) {
      return '';
    }
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return str[0];
  }
  /**
   *渲染优先级样式
   *
   * @param {*} type
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderPriorityStyle =(type, item) => {
    if (type === 'color') {
      if (item.priorityCode === 'medium') {
        return 'rgb(53, 117, 223)';
      } else if (item.priorityCode === 'high') {
        return 'rgb(255, 177, 0)';
      } else {
        return 'rgba(0, 0, 0, 0.36)';
      }
    } else if (item.priorityCode === 'medium') {
      return 'rgba(77, 144, 254, 0.2)';
    } else if (item.priorityCode === 'high') {
      return 'rgba(255, 177, 0, 0.12)';
    } else {
      return 'rgba(0, 0, 0, 0.08)';
    }
  }
  /**
   *渲染issue背景色
   *
   * @param {*} item
   * @returns
   * @memberof SprintIssue
   */
  renderIssueBackground =(item) => {
    if (this.props.store.getClickIssueDetail.issueId === item.issueId) {
      return 'rgba(140,158,255,0.08)';
    } else if (this.props.store.getIsDragging) {
      return 'white';
    } else {
      return 'unset';
    }
  }
  /**
   *根据打开的组件个数 判断issue样式
   *
   * @returns
   * @memberof SprintIssue
   */
  renderIssueDisplay=() => {
    let flag = 0;
    if (this.props.epicVisible) {
      flag += 1;
    }
    if (this.props.versionVisible) {
      flag += 1;
    }
    if (JSON.stringify(this.props.store.getClickIssueDetail) !== '{}') {
      flag += 1;
    }
    return flag >= 2;
  }
  /**
   *渲染issue组件
   *
   * @param {*} data
   * @param {*} sprintId
   * @returns
   * @memberof Sprint
   */
  renderSprintIssue=(data, sprintId) => {
    const result = [];
    for (let index = 0, len = data.length; index < len; index += 1) {
      const item = data[index];
      result.push(
        <Draggable key={item.issueId} draggableId={item.issueId} index={index}>
          {(provided1, snapshot1) =>
            (
              <div
                className={this.props.store.getIsDragging ? 'c7n-backlog-sprintIssue' : 'c7n-backlog-sprintIssue c7n-backlog-sprintIssueHover'}
                style={{
                  position: 'relative',
                }}
                label="sprintIssue"
              >
                <div
                  className="c7n-backlog-sprintIssueItem"
                  ref={provided1.innerRef}
                  {...provided1.draggableProps}
                  {...provided1.dragHandleProps}
                  style={{
                    userSelect: 'none',
                    background: this.state.selected.issueIds.includes(item.issueId) ? 'rgb(235, 242, 249)' : this.renderIssueBackground(item),
                    padding: '10px 36px 10px 20px',
                    borderBottom: '1px solid rgba(0,0,0,0.12)',
                    paddingLeft: 43,
                    ...provided1.draggableProps.style,
                    fontSize: 13,
                    display: this.renderIssueDisplay() ? 'block' : 'flex',
                    alignItems: 'center',
                    cursor: 'move',
                    flexWrap: 'nowrap',
                    justifyContent: 'space-between',
                    // position: 'relative',
                  }}
                  label="sprintIssue"
                  role="none"
                  onClick={
                    this.handleClickIssue.bind(this, sprintId, item)
                  }
                >
                  <div
                    className="c7n-backlog-issueSideBorder"
                    style={{
                      display: this.props.store.getClickIssueDetail.issueId === item.issueId ? 'block' : 'none',
                    }}
                  />
                  <div
                    className="c7n-backlog-sprintCount"
                    style={{
                      display: String(this.state.draggableId) === String(item.issueId) && this.state.selected.issueIds.length > 0 ? 'flex' : 'none',
                    }}
                    label="sprintIssue"
                  >{this.state.selected.issueIds.length}</div>
                  <div
                    label="sprintIssue"
                    className="c7n-backlog-sprintIssueSide"
                    style={{
                      // width: 0,
                      flexGrow: 1,
                      width: this.renderIssueDisplay() ? 'unset' : 0,
                    }}
                  >
                    <Typetag
                      type={{
                        typeCode: item.typeCode,
                      }}
                    />
                    <div
                      label="sprintIssue"
                      style={{
                        marginLeft: 8,
                        whiteSpace: this.renderIssueDisplay() ? 'normal' : 'nowrap',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        height: this.renderIssueDisplay ? 'auto' : 20,
                        wordBreak: 'break-all',
                      }}
                    >{`${item.issueNum} `}
                      <Tooltip title={item.summary} placement="topLeft">
                        {item.summary}
                      </Tooltip>
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: this.props.epicVisible || this.props.versionVisible || JSON.stringify(this.props.store.getClickIssueDetail) !== '{}' ? 5 : 0,
                      justifyContent: this.renderIssueDisplay() ? 'space-between' : 'flex-end',
                      // width: this.renderIssueDisplay() ? 'unset' : 0,
                      // flex: 2,
                    }}
                    label="sprintIssue"
                    className="c7n-backlog-sprintIssueSide"
                  >
                    <div className="c7n-backlog-sprintSideRightItems">
                      <div
                        style={{
                          maxWidth: 34,
                          marginLeft: !_.isNull(item.priorityName) && !this.renderIssueDisplay() ? '12px' : 0,
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.priorityName) ? (
                          <Tooltip title={`优先级: ${item.priorityName}`}>
                            <span
                              label="sprintIssue"
                              className="c7n-backlog-sprintIssuePriority"
                              style={{
                                color: this.renderPriorityStyle('color', item),
                                background: this.renderPriorityStyle('background', item),
                              }}
                            >{item.priorityName}</span>
                          </Tooltip>
                        ) : ''}
                      </div>
                      <div
                        style={{
                          maxWidth: 50,
                          marginLeft: item.versionNames.length ? '12px' : 0,
                          border: '1px solid rgba(0, 0, 0, 0.36)',
                          borderRadius: '2px',
                          display: item.versionNames.length > 0 ? 'block' : 'none',
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {item.versionNames.length > 0 ? (
                          <Tooltip title={`版本: ${item.versionNames.join(', ')}`}>
                            <span label="sprintIssue" className="c7n-backlog-sprintIssueVersion">
                              <span>{item.versionNames.join(', ')}</span>
                            </span>
                          </Tooltip>
                        ) : ''}
                      </div>
                      <div
                        style={{
                          maxWidth: 86,
                          marginLeft: !_.isNull(item.epicName) ? '12px' : 0,
                          border: `1px solid ${item.color}`,
                          display: !_.isNull(item.epicName) ? 'block' : 'none',
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.epicName) ? (
                          <Tooltip title={`史诗: ${item.epicName}`}>
                            <span
                              label="sprintIssue"
                              className="c7n-backlog-sprintIssueEpic"
                              style={{
                                // border: `1px solid ${item.color}`,
                                color: item.color,
                              }}
                            >{item.epicName}</span>
                          </Tooltip>
                        ) : ''}
                      </div>
                    </div>
                    <div className="c7n-backlog-sprintSideRightItems">
                      <div
                        style={{
                          maxWidth: 105,
                          marginLeft: !_.isNull(item.assigneeName) ? '12px' : 0,
                          flexGrow: 0,
                          flexShrink: 0,
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        <UserHead
                          user={{
                            id: item.assigneeId,
                            loginName: '',
                            realName: item.assigneeName,
                            avatar: item.imageUrl,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          width: 60,
                          marginLeft: !_.isNull(item.statusName) ? '12px' : 0,
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        {!_.isNull(item.statusName) ? (
                          <Tooltip title={`状态: ${item.statusName}`}>
                            <span
                              label="sprintIssue"
                              className="c7n-backlog-sprintIssueStatus"
                              style={{
                                background: item.statusColor ? item.statusColor : '#4d90fe',
                              }}
                            >{item.statusName}</span>
                          </Tooltip>
                        ) : ''}
                      </div>
                      <div
                        style={{
                          maxWidth: 20,
                          marginLeft: '12px',
                        }}
                        label="sprintIssue"
                        className="c7n-backlog-sprintIssueRight"
                      >
                        <Tooltip title={`故事点: ${item.storyPoints}`}>
                          <div
                            label="sprintIssue"
                            className="c7n-backlog-sprintIssueStoryPoint"
                            style={{
                              visibility: item.storyPoints && item.typeCode === 'story' ? 'visible' : 'hidden',
                            }}
                          >{item.storyPoints}</div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                </div>
                {provided1.placeholder}
              </div>
            )
          }
        </Draggable>,
      );
    }
    return result;
  }

  /**
   *父组件获取该组件state方法
   *
   * @param {*} data
   * @returns
   * @memberof Sprint
   */
  getCurrentState=(data) => {
    return this.state[data];
  }

  /**
   *渲染非待办事项冲刺
   *
   * @returns
   * @memberof Sprint
   */
  renderSprint=() => {
    let result = [];
    if (JSON.stringify(this.props.store.getSprintData) !== '{}') {
      const data = this.props.store.getSprintData.sprintData;
      if (data) {
        if (data.length > 0) {
          for (let indexs = 0, len = data.length; indexs < len; indexs += 1) {
            const item = data[indexs];
            result.push(
              <div key={item.sprintId} id={indexs === data.length - 1 ? 'sprint_last' : undefined}>
                <div className="c7n-backlog-sprintTop">
                  <div className="c7n-backlog-springTitle">
                    <div className="c7n-backlog-sprintTitleSide">
                      <div className="c7n-backlog-sprintName">
                        <Icon
                          style={{ fontSize: 20, cursor: 'pointer' }}
                          type={this.state[`${indexs}-sprint`] && !this.state[`${indexs}-sprint`].expand ? 'baseline-arrow_right' : 'baseline-arrow_drop_down'}
                          role="none"
                          onClick={() => {
                            this.setState({
                              [`${indexs}-sprint`]: { expand: this.state[`${indexs}-sprint`] ? !this.state[`${indexs}-sprint`].expand : false },
                            });
                          }}
                        />
                        <EasyEdit
                          type="input"
                          defaultValue={item.sprintName}
                          enterOrBlur={this.handleBlurName}
                        >
                          <span
                            style={{ marginLeft: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            role="none"
                          >{item.sprintName}</span>
                        </EasyEdit>
                      </div>
                      <p className="c7n-backlog-sprintQuestion">
                        {item.issueSearchDTOList && item.issueSearchDTOList.length > 0 ? `${item.issueSearchDTOList.length}个问题可见` : '0个问题可见'}
                        {/* {!_.isNull(item.issueCount) ? ` 共${item.issueCount}个问题` : ' 共0个问题'} */}
                      </p>
                      <p
                        className="c7n-backlog-clearFilter"
                        style={{
                          display:
                            this.props.store.getChosenVersion !== 'all'
                            || this.props.store.getChosenEpic !== 'all'
                            || this.props.store.getOnlyMe
                            || this.props.store.getRecent // 仅故事
                            || this.props.store.getQuickFilters.length > 0 ? 'block' : 'none',
                        }}
                        role="none"
                        onClick={this.clearFilter}
                      >清空所有筛选器</p>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      {this.renderStatusCodeDom(item)}
                    </div>
                  </div>
                  <div
                    className="c7n-backlog-sprintDes"
                    style={{
                      display: item.assigneeIssues && item.assigneeIssues.length > 0 ? 'flex' : 'none',
                    }}
                  >
                    {
                      item.assigneeIssues ? (
                        item.assigneeIssues
                          .filter(ass => ass.assigneeId)
                          .map((ass2, index) => (
                            <Tooltip
                              key={`tooltip-${index}`}
                              placement="bottom"
                              title={(
                                <div>
                                  <p>{ass2.assigneeName}</p>
                                  <p>{ass2.totalStoryPoints} 故事点</p>
                                  <p>{ass2.totalRemainingTime ? ass2.totalRemainingTime : '无'} 剩余预估时间</p>
                                  <p>{ass2.issueCount} 问题</p>
                                </div>
                              )}
                            >
                              {/* <div className="c7n-backlog-sprintIcon">{ass2.assigneeName ?
                      ass2.assigneeName.substring(0, 1).toUpperCase() : ''}</div> */}
                              <Avatar
                                style={{ marginRight: 8 }}
                                src={ass2.imageUrl ? ass2.imageUrl : undefined}
                                size="small"
                              >
                                {
                                  !ass2.imageUrl && ass2.assigneeName ? this.getFirst(ass2.assigneeName) : ''
                                }
                              </Avatar>
                            </Tooltip>
                          ))) : ''
                    }
                    <Icon
                      style={{
                        cursor: 'pointer',
                        fontSize: 20,
                        marginLeft: 8,
                        display: item.assigneeIssues && item.assigneeIssues.length > 0 ? 'block' : 'none',
                      }}
                      type="more_vert"
                      role="none"
                      onClick={() => {
                        this.setState({
                          [indexs]: {
                            visibleAssign: true,
                          },
                        });
                      }}
                    />
                    <AssigneeModal
                      visible={this.state[indexs] && this.state[indexs].visibleAssign || false}
                      onCancel={() => {
                        this.setState({
                          [indexs]: {
                            visibleAssign: false,
                          },
                        });
                      }}
                      data={item}
                      // total={total}
                    />
                    {item.statusCode === 'started' ? (
                      <div
                        className="c7n-backlog-sprintData"
                        style={{
                          display: 'flex',
                        }}
                      >
                        <EasyEdit
                          type="date"
                          time
                          defaultValue={item.startDate ? moment(item.startDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                          disabledDate={item.endDate ? current => current > moment(item.endDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                          onChange={(date, dateString) => {
                            this.updateDate('startDate', dateString, item);
                          }}
                        >
                          <div
                            className="c7n-backlog-sprintDataItem"
                            role="none"
                          >{this.renderData(item, 'startDate')}</div>
                        </EasyEdit>
                        <p>~</p>
                        <EasyEdit
                          type="date"
                          time
                          defaultValue={item.endDate ? moment(item.endDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                          disabledDate={item.startDate ? current => current < moment(item.startDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                          onChange={(date, dateString) => {
                            this.updateDate('endDate', dateString, item);
                          }}
                        >
                          <div
                            className="c7n-backlog-sprintDataItem"
                            role="none"
                          >{this.renderData(item, 'endDate')}</div>
                        </EasyEdit>
                      </div>
                    ) : ''}
                  </div>
                  <div
                    className="c7n-backlog-sprintGoal"
                    style={{
                      display: item.statusCode === 'started' ? 'flex' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <p>本周冲刺目标：</p>
                      <EasyEdit
                        type="input"
                        defaultValue={item.sprintGoal}
                        enterOrBlur={this.handleBlurGoal.bind(this, item)}
                      >
                        <div
                          role="none"
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            this.setState({
                              editGoal: true,
                            });
                          }}
                        >{item.sprintGoal ? item.sprintGoal : '无'}</div>
                      </EasyEdit>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                      }}
                      className="c7n-backlog-sprintGoalSide"
                    >
                      <Tooltip title={`待处理故事点: ${item.todoStoryPoint}`}>
                        <div style={{ backgroundColor: '#FFB100' }}>{item.todoStoryPoint}</div>
                      </Tooltip>
                      <Tooltip title={`处理中故事点: ${item.doingStoryPoint}`}>
                        <div style={{ backgroundColor: '#4D90FE' }}>{item.doingStoryPoint}</div>
                      </Tooltip>
                      <Tooltip title={`已完成故事点: ${item.doneStoryPoint}`}>
                        <div style={{ backgroundColor: '#00BFA5' }}>{item.doneStoryPoint}</div>
                      </Tooltip>
                    </div>
                  </div>
                </div>
                {(this.state[`${indexs}-sprint`] && this.state[`${indexs}-sprint`].expand) || this.state[`${indexs}-sprint`] === undefined ? (
                  <Droppable
                    droppableId={item.sprintId.toString()}
                    isDropDisabled={this.props.store.getIsLeaveSprint}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                          // background: 'white',
                          padding: 'grid',
                          borderBottom: '1px solid rgba(0,0,0,0.12)',
                        }}
                      >
                        {this.renderIssueOrIntro('sprint', indexs, item.issueSearchDTOList, item.sprintId)}
                        {provided.placeholder}
                        <div className="c7n-backlog-sprintIssue">
                          <div
                            style={{
                              userSelect: 'none',
                              background: 'white',
                              padding: '10px 0 10px 43px',
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {this.state[`${indexs}-create`] && this.state[`${indexs}-create`].createIssue ? (
                              <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Select
                                    value={this.state.selectIssueType}
                                    style={{
                                      width: 50,
                                      height: 20,
                                    }}
                                    onChange={(value) => {
                                      this.setState({
                                        selectIssueType: value,
                                      });
                                    }}
                                    dropdownMatchSelectWidth={false}
                                  >
                                    <Option value="story" key={'story'}>
                                      <Tooltip title="故事">
                                        <div
                                          className="c7n-backlog-sprintType"
                                          style={{
                                            background: '#00BFA5',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 0,
                                          }}
                                        >
                                          <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
                                        </div>
                                      </Tooltip>
                                    </Option>
                                    <Option value="task" key={'task'}>
                                      <Tooltip title="任务">
                                        <div
                                          className="c7n-backlog-sprintType"
                                          style={{
                                            background: '#4D90FE',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 0,
                                          }}
                                        >
                                          <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
                                        </div>
                                      </Tooltip>
                                    </Option>
                                    <Option value="bug" key={'bug'}>
                                      <Tooltip title="缺陷">
                                        <div
                                          className="c7n-backlog-sprintType"
                                          style={{
                                            background: '#F44336',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            marginRight: 0,
                                          }}
                                        >
                                          <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
                                        </div>
                                      </Tooltip>
                                    </Option>
                                  </Select>
                                  <div style={{ marginLeft: 8, flexGrow: 1 }}>
                                    <Input
                                      autoFocus
                                      placeholder="需要做什么"
                                      ref={(ref) => {
                                        this[`${indexs}-addInput`] = ref;
                                      }}
                                      maxLength={44}
                                      onPressEnter={this.handleBlurCreateIssue.bind(this, 'sprint', item, indexs)}
                                      // onBlur={this.handleBlurCreateIssue}
                                    />
                                  </div>
                                </div>
                                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-start', paddingRight: 70 }}>
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      this.setState({
                                        [`${indexs}-create`]: {
                                          createIssue: false,
                                        },
                                      });
                                    }}
                                  >取消</Button>
                                  <Button
                                    type="primary"
                                    loading={this.state.loading}
                                    onClick={this.handleBlurCreateIssue.bind(this, 'sprint', item, indexs)}
                                  >确定</Button>
                                </div>
                              </div>
                            ) : (
                              <div className="c7n-backlog-sprintIssueSide">
                                <Button
                                  className="leftBtn"
                                  functyp="flat"
                                  style={{
                                    color: '#3f51b5',
                                  }}
                                  onClick={() => {
                                    this.setState({
                                      [`${indexs}-create`]: {
                                        createIssue: true,
                                      },
                                    });
                                    this.props.store.axiosGetProjectInfo().then((res) => {
                                      this.props.store.setProjectInfo(res);
                                    });
                                  }}
                                >
                                  <Icon type="playlist_add" />创建问题
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Droppable>
                ) : ''}
              </div>
              ,
            );
          }
        } else {
          result = (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 0',
              }}
            >
              <img style={{ width: 172 }} alt="emptybacklog" src={EmptyBacklog} />
              <div style={{ marginLeft: 40 }}>
                <p style={{ color: 'rgba(0,0,0,0.65)' }}>用问题填充您的待办事项</p>
                <p style={{ fontSize: 16, lineHeight: '28px', marginTop: 8 }}>这是您的团队待办事项。创建并预估新的问题，并通<br />过上下拖动来对待办事项排优先级</p>
              </div>
            </div>
          );
        }
      }
    }
    return result;
  }
  /**
   *渲染待办事项
   *
   * @returns
   * @memberof Sprint
   */
  renderBacklog=() => {
    if (JSON.stringify(this.props.store.getSprintData) !== '{}') {
      const data = this.props.store.getSprintData.backlogData;
      if (data) {
        const item = {
          sprintName: '待办事项',
          issueSearchDTOList: data.backLogIssue,
          sprintId: 'backlog',
        };
        return (
          <div>
            <div className="c7n-backlog-sprintTop">
              <div className="c7n-backlog-springTitle">
                <div className="c7n-backlog-sprintTitleSide">
                  <div className="c7n-backlog-sprintName">
                    <EasyEdit
                      type="input"
                      defaultValue={item.sprintName}
                      enterOrBlur={this.handleBlurName}
                      disabled
                    >
                      <span
                        style={{ marginLeft: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                        role="none"
                      >{item.sprintName}</span>
                    </EasyEdit>
                  </div>
                  <p className="c7n-backlog-sprintQuestion">
                    {item.issueSearchDTOList && item.issueSearchDTOList.length > 0 ? `${item.issueSearchDTOList.length}个问题可见` : '0个问题可见'}
                    {/* {!_.isNull(item.issueCount) ? ` 共${item.issueCount}个问题` : ' 共0个问题'} */}
                  </p>
                  <p
                    className="c7n-backlog-clearFilter"
                    style={{
                      display:
                        this.props.store.getChosenVersion !== 'all'
                        || this.props.store.getChosenEpic !== 'all'
                        || this.props.store.getOnlyMe
                        || this.props.store.getRecent // 仅故事
                        || this.props.store.getQuickFilters.length > 0 ? 'block' : 'none',
                    }}
                    role="none"
                    onClick={this.clearFilter}
                  >清空所有筛选器</p>
                </div>
                <div style={{ flexGrow: 1 }}>
                  {this.renderStatusCodeDom(item)}
                </div>
              </div>
              <div
                className="c7n-backlog-sprintDes"
                style={{
                  display: item.assigneeIssues && item.assigneeIssues.length > 0 ? 'flex' : 'none',
                }}
              >
                {
                  item.assigneeIssues ? (
                    item.assigneeIssues
                      .filter(ass => ass.assigneeId)
                      .map((ass2, index) => (
                        <Tooltip
                          key={`tooltip-${index}`}
                          placement="bottom"
                          title={(
                            <div>
                              <p>{ass2.assigneeName}</p>
                              <p>{ass2.totalStoryPoints} 故事点</p>
                              <p>{ass2.totalRemainingTime ? ass2.totalRemainingTime : '无'} 剩余预估时间</p>
                              <p>{ass2.issueCount} 问题</p>
                            </div>
                          )}
                        >
                          {/* <div className="c7n-backlog-sprintIcon">{ass2.assigneeName ?
                      ass2.assigneeName.substring(0, 1).toUpperCase() : ''}</div> */}
                          <Avatar
                            style={{ marginRight: 8 }}
                            src={ass2.imageUrl ? ass2.imageUrl : undefined}
                            size="small"
                          >
                            {
                              !ass2.imageUrl && ass2.assigneeName ? this.getFirst(ass2.assigneeName) : ''
                            }
                          </Avatar>
                        </Tooltip>
                      ))) : ''
                }
                {item.statusCode === 'started' ? (
                  <div
                    className="c7n-backlog-sprintData"
                    style={{
                      display: 'flex',
                    }}
                  >
                    <EasyEdit
                      type="date"
                      time
                      defaultValue={item.startDate ? moment(item.startDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                      disabledDate={item.endDate ? current => current > moment(item.endDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                      onChange={(date, dateString) => {
                        this.updateDate('startDate', dateString);
                      }}
                    >
                      <div
                        className="c7n-backlog-sprintDataItem"
                        role="none"
                      >{this.renderData(item, 'startDate')}</div>
                    </EasyEdit>
                    <p>~</p>
                    <EasyEdit
                      type="date"
                      time
                      defaultValue={item.endDate ? moment(item.endDate, 'YYYY-MM-DD HH-mm-ss') : ''}
                      disabledDate={item.startDate ? current => current < moment(item.startDate, 'YYYY-MM-DD HH:mm:ss') : ''}
                      onChange={(date, dateString) => {
                        this.updateDate('endDate', dateString);
                      }}
                    >
                      <div
                        className="c7n-backlog-sprintDataItem"
                        role="none"
                      >{this.renderData(item, 'endDate')}</div>
                    </EasyEdit>
                  </div>
                ) : ''}
              </div>
              <div
                className="c7n-backlog-sprintGoal"
                style={{
                  display: item.statusCode === 'started' ? 'flex' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <p>本周冲刺目标：</p>
                  <EasyEdit
                    type="input"
                    defaultValue={item.sprintGoal}
                    enterOrBlur={this.handleBlurGoal.bind(this, item)}
                  >
                    <div
                      role="none"
                      style={{
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        this.setState({
                          editGoal: true,
                        });
                      }}
                    >{item.sprintGoal ? item.sprintGoal : '无'}</div>
                  </EasyEdit>
                </div>
                <div
                  style={{
                    display: 'flex',
                  }}
                  className="c7n-backlog-sprintGoalSide"
                >
                  <Tooltip title={`待处理故事点: ${item.todoStoryPoint}`}>
                    <div style={{ backgroundColor: '#FFB100' }}>{item.todoStoryPoint}</div>
                  </Tooltip>
                  <Tooltip title={`处理中故事点: ${item.doingStoryPoint}`}>
                    <div style={{ backgroundColor: '#4D90FE' }}>{item.doingStoryPoint}</div>
                  </Tooltip>
                  <Tooltip title={`已完成故事点: ${item.doneStoryPoint}`}>
                    <div style={{ backgroundColor: '#00BFA5' }}>{item.doneStoryPoint}</div>
                  </Tooltip>
                </div>
              </div>
            </div>
            {this.state.expand ? (
              <Droppable
                droppableId={item.sprintId.toString()}
                isDropDisabled={this.props.store.getIsLeaveSprint}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                      // background: 'white',
                      padding: 'grid',
                      borderBottom: '1px solid rgba(0,0,0,0.12)',
                      marginBottom: 30,
                    }}
                  >
                    {this.renderIssueOrIntro('backlog', '', item.issueSearchDTOList, item.sprintId)}
                    {provided.placeholder}
                    <div className="c7n-backlog-sprintIssue">
                      <div
                        style={{
                          userSelect: 'none',
                          background: 'white',
                          padding: '10px 0 10px 43px',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {this.state['-1-create'] && this.state['-1-create'].createIssue ? (
                          <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Select
                                value={this.state.selectIssueType}
                                style={{
                                  width: 50,
                                  height: 20,
                                }}
                                onChange={(value) => {
                                  this.setState({
                                    selectIssueType: value,
                                  });
                                }}
                                dropdownMatchSelectWidth={false}
                              >
                                <Option value="story" key={'story'}>
                                  <Tooltip title="故事">
                                    <div
                                      className="c7n-backlog-sprintType"
                                      style={{
                                        background: '#00BFA5',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 0,
                                      }}
                                    >
                                      <Icon style={{ color: 'white', fontSize: '14px' }} type="turned_in" />
                                    </div>
                                  </Tooltip>
                                </Option>
                                <Option value="task" key={'task'}>
                                  <Tooltip title="任务">
                                    <div
                                      className="c7n-backlog-sprintType"
                                      style={{
                                        background: '#4D90FE',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 0,
                                      }}
                                    >
                                      <Icon style={{ color: 'white', fontSize: '14px' }} type="assignment" />
                                    </div>
                                  </Tooltip>
                                </Option>
                                <Option value="bug" key={'bug'}>
                                  <Tooltip title="缺陷">
                                    <div
                                      className="c7n-backlog-sprintType"
                                      style={{
                                        background: '#F44336',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        marginRight: 0,
                                      }}
                                    >
                                      <Icon style={{ color: 'white', fontSize: '14px' }} type="bug_report" />
                                    </div>
                                  </Tooltip>
                                </Option>
                              </Select>
                              <div style={{ marginLeft: 8, flexGrow: 1 }}>
                                <Input
                                  autoFocus
                                  placeholder="需要做什么"
                                  ref={(ref) => {
                                    this['-1-addInput'] = ref;
                                  }}
                                  maxLength={44}
                                  onPressEnter={this.handleBlurCreateIssue.bind(this, 'backlog', item, -1)}
                                  // onBlur={this.handleBlurCreateIssue}
                                />
                              </div>
                            </div>
                            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-start', paddingRight: 70 }}>
                              <Button
                                type="primary"
                                onClick={() => {
                                  this.setState({
                                    '-1-create': false,
                                  });
                                }}
                              >取消</Button>
                              <Button
                                type="primary"
                                loading={this.state.loading}
                                onClick={this.handleBlurCreateIssue.bind(this, 'backlog', item, -1)}
                              >确定</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="c7n-backlog-sprintIssueSide">
                            <Button
                              className="leftBtn"
                              functyp="flat"
                              style={{
                                color: '#3f51b5',
                              }}
                              onClick={() => {
                                this.setState({
                                  ['-1-create']: { createIssue: true },
                                });
                                this.props.store.axiosGetProjectInfo().then((res) => {
                                  this.props.store.setProjectInfo(res);
                                });
                              }}
                            >
                              <Icon type="playlist_add" />创建问题
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            ) : ''}
          </div>
        );
      }
    }
    return '';
  }

  render() {
    return (
      <div>
        {this.renderSprint()}
        {this.renderBacklog()}
      </div>
    );
  }
}

export default SprintItem;
