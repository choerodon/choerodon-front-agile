import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable } from 'react-beautiful-dnd';
import {
  Input, Button, Select, Icon, Tooltip, Modal, Avatar, Dropdown, Menu,
} from 'choerodon-ui';
import { stores } from 'choerodon-front-boot';
import _ from 'lodash';
import moment from 'moment';
import CloseSprint from './CloseSprint';
import IssueItem from './IssueItem';
import StartSprint from './StartSprint';
import emptyPng from '../../../../../assets/image/emptySprint.svg';
import EasyEdit from '../../../../../components/EasyEdit/EasyEdit';
import AssigneeModal from './AssigneeModal';
import EmptyBacklog from '../../../../../assets/image/emptyBacklog.svg';
import './Sprint.scss';
import TypeTag from '../../../../../components/TypeTag';
import { ICON, TYPE } from '../../../../../common/Constant';

const { Option } = Select;
const { confirm } = Modal;
const { AppState } = stores;

const filterIssueTypeCode = ['issue_epic', 'sub_task'];

@observer
class SprintItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editStartDate: false,
      editendDate: false,
      backlogExpand: true,
      expand: true,
      selectIssueType: 'story',
      editName: false,
      editGoal: false,
      visibleAssign: false,
      loading: false,
      selected: {
        droppableId: '',
        issueIds: [],
      },
    };
  }

  componentDidMount() {
    const year = moment().year();
    const { onRef } = this.props;
    onRef(this);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    const { store } = this.props;
    store.axiosGetWorkSetting(year);
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
    const { keydown } = this.state;
    if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.className !== 'ql-editor') {
      if (event.keyCode !== keydown) {
        this.setState({
          keydown: event.keyCode,
        });
      }
    }
  }

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
    const { store, refresh } = this.props;
    const data = {
      objectVersionNumber: item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: item.sprintId,
      [type]: date += ' 00:00:00',
    };
    store.axiosUpdateSprint(data).then((res) => {
      refresh();
    }).catch((error) => {
    });
  }

  /**
   *简易创建issue事件
   *
   * @memberof SprintItem
   */
  handleBlurCreateIssue = (type, item, index) => {
    const { store, refresh } = this.props;
    const { selectIssueType } = this.state;
    const currentType = store.getIssueTypes.find(t => t.typeCode === selectIssueType);
    const priorityId = store.getDefaultPriority.id;
    if (this[`${index}-addInput`].input.value !== '') {
      this.setState({
        loading: true,
      });
      debugger;
      const data = {
        priorityCode: `priority-${priorityId}`,
        priorityId,
        projectId: AppState.currentMenuType.id,
        sprintId: type !== 'backlog' ? item.sprintId : 0,
        summary: this[`${index}-addInput`].input.value,
        issueTypeId: currentType.id,
        typeCode: currentType.typeCode,
        /* eslint-disable */
        ...!isNaN(store.getChosenEpic) ? {
          epicId: store.getChosenEpic,
        } : {},
        ...!isNaN(store.getChosenVersion) ? {
          versionIssueRelDTOList: [
            {
              versionId: store.getChosenVersion,
            },
          ],
        } : {},
        parentIssueId: 0,
      };
      /* eslint-enable */
      store.axiosEasyCreateIssue(data).then((res) => {
        this.setState({
          [`${index}-create`]: {
            createIssue: false,
          },
          // createIssueValue: '',
          loading: false,
          selected: {
            issueIds: [res.issueId],
          },
        });
        refresh();
        store.setSelectIssue([res.issueId]);
        store.setClickIssueDetail(res);
      }).catch((error) => {
        this.setState({
          loading: false,
        });
      });
    }
  };

  /**
   *修改冲刺名
   *
   * @param {*} value
   * @memberof SprintItem
   */
  handleBlurName =(item, value) => {
    const { store, refresh } = this.props;
    const data = {
      objectVersionNumber: item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: item.sprintId,
      sprintName: value,
    };
    store.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editName: false,
      });
      refresh();
    }).catch((error) => {
    });
  }

  /**
   *修改冲刺目标
   *
   * @param {*} value
   * @memberof SprintItem
   */
  handleBlurGoal =(item, value) => {
    const { store, refresh } = this.props;
    const data = {
      objectVersionNumber: item.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      sprintId: item.sprintId,
      sprintGoal: value,
    };
    store.axiosUpdateSprint(data).then((res) => {
      this.setState({
        editGoal: false,
      });
      refresh();
    }).catch((error) => {
    });
  }

  /**
   *完成冲刺事件
   *
   * @memberof SprintItem
   */
  handleFinishSprint =(item, indexs) => {
    const { store } = this.props;
    store.axiosGetSprintCompleteMessage(
      item.sprintId,
    ).then((res) => {
      store.setSprintCompleteMessage(res);
      let flag = 0;
      if (res.parentsDoneUnfinishedSubtasks) {
        if (res.parentsDoneUnfinishedSubtasks.length > 0) {
          flag = 1;
          let issueNums = '';
          const len = res.parentsDoneUnfinishedSubtasks.length;
          for (let index = 0; index < len; index += 1) {
            issueNums += `${res.parentsDoneUnfinishedSubtasks[index].issueNum} `;
          }
          confirm({
            title: '警告',
            content: `父卡${issueNums}有未完成的子任务，无法完成冲刺`,
            onCancel() {
            },
          });
        }
      }
      if (flag === 0) {
        this.setState({
          [`${indexs}-closeSprint`]: {
            closeSprintVisible: true,
          },
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
  handleStartSprint =(item, index) => {
    const { store } = this.props;
    if (!store.getSprintData.sprintData.filter(items => items.statusCode === 'started').length > 0) {
      if (item.issueSearchDTOList && item.issueSearchDTOList.length > 0) {
        store.axiosGetOpenSprintDetail(
          item.sprintId,
        ).then((res) => {
          store.setOpenSprintDetail(res);
          this.setState({
            [`${index}-startSprint`]: { startSprintVisible: true },
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
  handleDeleteSprint = (item, e) => {
    const that = this;
    const { store, refresh } = this.props;
    if (e.key === '0') {
      if (item.issueSearchDTOList && item.issueSearchDTOList.length > 0) {
        confirm({
          width: 560,
          wrapClassName: 'deleteConfirm',
          title: `删除冲刺${item.sprintName}`,
          content: (
            <div>
              <p style={{ marginBottom: 10 }}>请确认您要删除这个冲刺。</p>
              <p style={{ marginBottom: 10 }}>这个冲刺将会被彻底删除，冲刺中的任务将会被移动到待办事项中。</p>
            </div>
          ),
          onOk() {
            return that.props.store.axiosDeleteSprint(item.sprintId).then((res) => {
              that.props.refresh();
            }).catch((error) => {
            });
          },
          onCancel() {},
          okText: '删除',
          okType: 'danger',
        });
      } else {
        store.axiosDeleteSprint(item.sprintId).then((res) => {
          refresh();
        }).catch((error) => {
        });
      }
    }
  };

  /**
   *清除过滤器
   *
   * @memberof SprintItem
   */
  clearFilter =() => {
    const { store } = this.props;
    store.setChosenEpic('all');
    store.setChosenVersion('all');
    store.setOnlyMe(false);
    store.setRecent(false);
    store.setQuickFilters([]);
    store.setQuickSearchClean(true);
    store.axiosGetSprint(store.getSprintFilter()).then((res) => {
      store.setSprintData(res);
    }).catch((error) => {
    });
  }

  /**
   *单个issue点击事件
   *
   * @param {*} sprintId
   * @param {*} item
   * @memberof Sprint
   */
  handleClickIssue=(sprintId, item) => {
    // command ctrl shift
    const { keydown, selected } = this.state;
    const { store } = this.props;
    if (keydown === 91 || keydown === 17 || keydown === 16) {
      // 如果没点击
      if (selected.droppableId === '') {
        this.setState({
          selected: {
            droppableId: sprintId,
            issueIds: [item.issueId],
          },
        });
        store.setSelectIssue([item.issueId]);
      } else if (String(
        selected.droppableId,
      ) === String(sprintId)) {
        // 如果点击的是当前列的卡片
        const originIssueIds = _.clone(selected.issueIds);
        // 如果不存在
        if (originIssueIds.indexOf(item.issueId) === -1) {
          // 如果不是shift 则加一条issueid
          if (keydown !== 16) {
            this.setState({
              selected: {
                droppableId: sprintId,
                issueIds: [...originIssueIds, item.issueId],
              },
            });
            store.setSelectIssue([...originIssueIds, item.issueId]);
          } else {
            let clickSprintDatas = [];
            const firstClick = originIssueIds[0];
            if (item.sprintId) {
              // 如果是shift 并且点击的是冲刺里的issue
              clickSprintDatas = store.getSprintData.sprintData
                .filter(s => s.sprintId === item.sprintId)[0].issueSearchDTOList;
            } else {
              // 如果是shift 并且点击的是backlog里的issue
              clickSprintDatas = store.getSprintData.backlogData.backLogIssue;
            }
            const indexs = [];
            for (let index = 0, len = clickSprintDatas.length; index < len; index += 1) {
              if (clickSprintDatas[index].issueId === firstClick
                || clickSprintDatas[index].issueId === item.issueId) {
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
            store.setSelectIssue(issueIds);
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
          store.setSelectIssue(originIssueIds);
        } else {
          this.setState({
            selected: {
              droppableId: '',
              issueIds: [],
            },
          });
          store.setSelectIssue([]);
        }
      }
    } else {
      this.setState({
        selected: {
          droppableId: sprintId,
          issueIds: [item.issueId],
        },
      });
      store.setSelectIssue([item.issueId]);
      store.setClickIssueDetail(item);
    }
  }

  /**
   *单个冲刺渲染issue或者无issue提示
   *
   * @param {*} issues
   * @param {*} sprintId
   * @returns
   * @memberof SprintItem this.renderSprintIssue(issues, sprintId);
   */
  renderIssueOrIntro =(type, index, issues, sprintId) => {
    const { versionVisible, epicVisible, store } = this.props;
    const { selected, draggableId } = this.state;
    if (issues) {
      if (issues.length > 0) {
        return (
          <IssueItem
            sprintItemRef={this.sprintItemRef}
            versionVisible={versionVisible}
            epicVisible={epicVisible}
            store={store}
            sprtintId={sprintId}
            data={issues}
            selected={selected}
            draggableId={draggableId}
            handleClickIssue={this.handleClickIssue}
          />
        );
      }
    }
    if (type !== 'backlog') {
      if (index === 0) {
        return (
          <div className="c7n-noissue-wapper">
            <div style={{ display: 'flex', height: 100 }} className="c7n-noissue-notzero">
              <img style={{ width: 80, height: 70 }} alt="空sprint" src={emptyPng} />
              <div style={{ marginLeft: 20 }}>
                <p>计划您的SPRINT</p>
                <p>这是一个Sprint。将问题拖拽至此来计划一个Sprint。</p>
              </div>
            </div>
          </div>
        );
      } else if (store.getChosenEpic !== 'all' || store.getChosenVersion !== 'all') {
        return (
          <div className="c7n-noissue-wapper">
            <div className="c7n-noissue-notzero">在sprint中所有问题已筛选</div>
          </div>
        );
      } else {
        return (
          <div className="c7n-noissue-wapper">
            <div className="c7n-noissue-notzero">要计划一次sprint, 可以拖动本次sprint页脚到某个问题的下方，或者把问题拖放到这里</div>
          </div>
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
    const { store } = this.props;
    if (store.getSprintData.sprintData.filter(items => items.statusCode === 'started').length === 0) {
      if (item.issueSearchDTOList) {
        if (item.issueSearchDTOList && item.issueSearchDTOList.length > 0) {
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


  renderStatusCodeDom =(item, index) => {
    const { state } = this;
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
      const { store, refresh } = this.props;
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
                onClick={this.handleFinishSprint.bind(this, item, index)}
              >
                完成冲刺
              </p>
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
                onClick={this.handleStartSprint.bind(this, item, index)}
              >


                开启冲刺
              </p>
              <Dropdown overlay={menu} trigger={['click']}>
                <Icon style={{ cursor: 'pointer', marginLeft: 5 }} type="more_vert" />
              </Dropdown>
            </div>
          )}
          <StartSprint
            store={store}
            visible={(state[`${index}-startSprint`] && state[`${index}-startSprint`].startSprintVisible) || false}
            onCancel={() => {
              this.setState({
                [`${index}-startSprint`]: { startSprintVisible: false },
              });
            }}
            data={item}
            refresh={refresh}
          />
          <CloseSprint
            store={store}
            visible={(state[`${index}-closeSprint`] && state[`${index}-closeSprint`].closeSprintVisible) || false}
            onCancel={() => {
              this.setState({
                [`${index}-closeSprint`]: { closeSprintVisible: false },
              });
            }}
            data={item}
            refresh={refresh}
          />
        </div>
      );
    }
    return '';
  };

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
   *父组件获取该组件state方法
   *
   * @param {*} data
   * @returns
   * @memberof Sprint
   */
  getCurrentState= (data) => {
    const { state } = this;
    return state[data];
  };

  handleChangeType(type) {
    this.setState({
      selectIssueType: type.key,
    });
  }

  /**
   *渲染非待办事项冲刺
   *
   * @returns
   * @memberof Sprint
   */
  renderSprint = () => {
    const { state, props: { store }, state: { selectIssueType, loading } } = this;
    const issueTypes = store.getIssueTypes
      .filter(t => filterIssueTypeCode.indexOf(t.typeCode) === -1);
    const currentType = issueTypes.find(t => t.typeCode === selectIssueType);
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          issueTypes.map(type => (
            <Menu.Item key={type.typeCode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  data={type}
                  showName
                />
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );
    let result = [];
    if (JSON.stringify(store.getSprintData) !== '{}') {
      const data = store.getSprintData.sprintData;
      if (data) {
        if (data.length > 0) {
          for (let indexs = 0, len = data.length; indexs < len; indexs += 1) {
            const item = data[indexs];
            result.push(
              <div
                key={item ? item.sprintId : '0'}
                id={(indexs === 0 && item.statusCode === 'sprint_planning')
                || (indexs === 1 && data[0].statusCode !== 'sprint_planning')
                  ? 'sprint_new' : undefined}
              >
                <div className="c7n-backlog-sprintTop">
                  <div className="c7n-backlog-springTitle">
                    <div className="c7n-backlog-sprintTitleSide">
                      <div className="c7n-backlog-sprintName">
                        <Icon
                          style={{ fontSize: 20, cursor: 'pointer' }}
                          type={state[`${indexs}-sprint`] && !state[`${indexs}-sprint`].expand ? 'baseline-arrow_right' : 'baseline-arrow_drop_down'}
                          role="none"
                          onClick={() => {
                            this.setState({
                              [`${indexs}-sprint`]: { expand: state[`${indexs}-sprint`] ? !state[`${indexs}-sprint`].expand : false },
                            });
                          }}
                        />
                        <EasyEdit
                          maxLength={30}
                          type="input"
                          defaultValue={item.sprintName}
                          enterOrBlur={this.handleBlurName.bind(this, item)}
                        >
                          <span
                            style={{ marginLeft: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                            role="none"
                          >
                            {item.sprintName}

                          </span>
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
                            store.getChosenVersion !== 'all'
                            || store.getChosenEpic !== 'all'
                            || store.getOnlyMe
                            || store.getRecent // 仅故事
                            || store.getQuickFilters.length > 0 ? 'block' : 'none',
                        }}
                        role="none"
                        onClick={this.clearFilter}
                      >
                        清空所有筛选器
                      </p>
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      {this.renderStatusCodeDom(item, indexs)}
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
                              /* eslint-disable */
                              key={`tooltip-${index}`}
                              /* eslint-enable */
                              placement="bottom"
                              title={(
                                <div>
                                  <p>{ass2.assigneeName}</p>
                                  <p>
                                    {'故事点: '}
                                    {ass2.totalStoryPoints || 0}
                                  </p>
                                  <p>
                                    {'剩余预估时间: '}
                                    {ass2.totalRemainingTime ? ass2.totalRemainingTime : '无'}
                                  </p>
                                  <p>
                                    {'问题: '}
                                    {ass2.issueCount}
                                  </p>
                                </div>
                              )}
                            >
                              {/* <div className="c7n-backlog-sprintIcon">{ass2.assigneeName ?
                      ass2.assigneeName.substring(0, 1).toUpperCase() : ''}</div> */}
                              <Avatar
                                style={{ marginRight: 8, flexShrink: 0 }}
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
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                      <Icon
                        style={{
                          // flex: 1,
                          cursor: 'pointer',
                          fontSize: 20,
                          marginLeft: 8,
                          display: item.assigneeIssues && item.assigneeIssues.length > 0 ? 'inline-block' : 'none',
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
                    </div>
                    <AssigneeModal
                      visible={(state[indexs] && state[indexs].visibleAssign) || false}
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
                    <div
                      style={{
                        display: item.statusCode === 'started' ? 'flex' : 'none',
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
                  <div
                    className="c7n-backlog-sprintGoal"
                    style={{
                      display: item.statusCode === 'started' ? 'flex' : 'none',
                    }}
                  >
                    {item.statusCode === 'started' ? (
                      <div
                        className="c7n-backlog-sprintData"
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
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
                          >
                            {this.renderData(item, 'startDate')}

                          </div>
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
                          >
                            {this.renderData(item, 'endDate')}

                          </div>
                        </EasyEdit>
                      </div>
                    ) : ''}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <p>冲刺目标：</p>
                      <EasyEdit
                        type="input"
                        width={200}
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
                        >
                          {item.sprintGoal ? item.sprintGoal : '无'}

                        </div>
                      </EasyEdit>
                    </div>
                  </div>
                </div>
                {(state[`${indexs}-sprint`] && state[`${indexs}-sprint`].expand) || state[`${indexs}-sprint`] === undefined ? (
                  <Droppable
                    droppableId={item.sprintId.toString()}
                    isDropDisabled={store.getIsLeaveSprint}
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
                              padding: '10px 0 10px 33px',
                              fontSize: 13,
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            {state[`${indexs}-create`] && state[`${indexs}-create`].createIssue ? (
                              <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block', width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                  <Dropdown overlay={typeList} trigger={['click']}>
                                    <div style={{ display: 'flex', alignItem: 'center' }}>
                                      <TypeTag
                                        data={currentType}
                                      />
                                      <Icon
                                        type="arrow_drop_down"
                                        style={{ fontSize: 16 }}
                                      />
                                    </div>
                                  </Dropdown>
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
                                <div style={{
                                  margin: '10px 0 5px',
                                  display: 'flex',
                                  justifyContent: 'flex-start',
                                  paddingRight: 70,
                                }}
                                >
                                  <Button
                                    type="primary"
                                    onClick={() => {
                                      this.setState({
                                        [`${indexs}-create`]: {
                                          createIssue: false,
                                        },
                                      });
                                    }}
                                  >
                                    取消
                                  </Button>
                                  <Button
                                    type="primary"
                                    loading={loading}
                                    onClick={this.handleBlurCreateIssue.bind(this, 'sprint', item, indexs)}
                                  >
                                    确定
                                  </Button>
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
                                    store.axiosGetProjectInfo().then((res) => {
                                      store.setProjectInfo(res);
                                    });
                                  }}
                                >
                                  <Icon type="playlist_add" />


                                  创建问题
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
                padding: '42px 0 45px 0',
              }}
            >
              <img style={{ width: 172 }} alt="emptybacklog" src={EmptyBacklog} />
              <div style={{ marginLeft: 40 }}>
                <p style={{ color: 'rgba(0,0,0,0.65)' }}>用问题填充您的待办事项</p>
                <p style={{ fontSize: 16, lineHeight: '28px', marginTop: 8 }}>


                  这是您的团队待办事项。创建并预估新的问题，并通
                  <br />


                  过上下拖动来对待办事项排优先级
                </p>
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
    const { state, props: { store }, state: { selectIssueType, backlogExpand, loading } } = this;
    const issueTypes = store.getIssueTypes
      .filter(t => filterIssueTypeCode.indexOf(t.typeCode) === -1);
    const currentType = issueTypes.find(t => t.typeCode === selectIssueType);
    const typeList = (
      <Menu
        style={{
          background: '#fff',
          boxShadow: '0 5px 5px -3px rgba(0, 0, 0, 0.20), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '2px',
        }}
        onClick={this.handleChangeType.bind(this)}
      >
        {
          issueTypes.map(type => (
            <Menu.Item key={type.typeCode}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <TypeTag
                  data={type}
                  showName
                />
              </div>
            </Menu.Item>
          ))
        }
      </Menu>
    );

    if (JSON.stringify(store.getSprintData) !== '{}') {
      const data = store.getSprintData.backlogData;
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
                    <Icon
                      style={{ fontSize: 20, cursor: 'pointer' }}
                      type={backlogExpand ? 'baseline-arrow_drop_down' : 'baseline-arrow_right'}
                      role="none"
                      onClick={() => {
                        this.setState({
                          backlogExpand: !backlogExpand,
                        });
                      }}
                    />
                    <span
                      style={{ marginLeft: 8, cursor: 'pointer', whiteSpace: 'nowrap' }}
                      role="none"
                    >
                      {item.sprintName}
                    </span>
                  </div>
                  <p className="c7n-backlog-sprintQuestion">
                    {item.issueSearchDTOList && item.issueSearchDTOList.length > 0 ? `${item.issueSearchDTOList.length}个问题可见` : '0个问题可见'}
                    {/* {!_.isNull(item.issueCount) ? ` 共${item.issueCount}个问题` : ' 共0个问题'} */}
                  </p>
                  <p
                    className="c7n-backlog-clearFilter"
                    style={{
                      display:
                        store.getChosenVersion !== 'all'
                        || store.getChosenEpic !== 'all'
                        || store.getOnlyMe
                        || store.getRecent // 仅故事
                        || store.getQuickFilters.length > 0 ? 'block' : 'none',
                    }}
                    role="none"
                    onClick={this.clearFilter}
                  >


                    清空所有筛选器
                  </p>
                </div>
                <div style={{ flexGrow: 1 }}>
                  {this.renderStatusCodeDom(item)}
                </div>
              </div>
            </div>
            {backlogExpand ? (
              <Droppable
                droppableId={item.sprintId.toString()}
                isDropDisabled={store.getIsLeaveSprint}
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
                          padding: '10px 0 10px 33px',
                          fontSize: 13,
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {state['-1-create'] && state['-1-create'].createIssue ? (
                          <div className="c7n-backlog-sprintIssueSide" style={{ display: 'block', width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <Dropdown overlay={typeList} trigger={['click']}>
                                <div style={{ display: 'flex', alignItem: 'center' }}>
                                  <TypeTag
                                    data={currentType}
                                  />
                                  <Icon
                                    type="arrow_drop_down"
                                    style={{ fontSize: 16 }}
                                  />
                                </div>
                              </Dropdown>
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
                            <div style={{
                              margin: '10px 0 5px', display: 'flex', justifyContent: 'flex-start', paddingRight: 70,
                            }}
                            >
                              <Button
                                type="primary"
                                onClick={() => {
                                  this.setState({
                                    '-1-create': false,
                                  });
                                }}
                              >


                                取消
                              </Button>
                              <Button
                                type="primary"
                                loading={loading}
                                onClick={this.handleBlurCreateIssue.bind(this, 'backlog', item, -1)}
                              >


                                确定
                              </Button>
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
                                  '-1-create': { createIssue: true },
                                });
                                store.axiosGetProjectInfo().then((res) => {
                                  store.setProjectInfo(res);
                                });
                              }}
                            >
                              <Icon type="playlist_add" />


                              创建问题
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
