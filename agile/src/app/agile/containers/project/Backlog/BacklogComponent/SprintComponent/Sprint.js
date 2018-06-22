import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Collapse, Button, Select, Input, Icon, Tooltip, Avatar, Spin } from 'choerodon-ui';
import _ from 'lodash';
import { axios, stores } from 'choerodon-front-boot';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import './Sprint.scss';
import SprintItem from './SprintItem';
import EmptyBacklog from '../../../../../assets/image/emptyBacklog.png';
import SprintIssue from './SprintIssue';

const Panel = Collapse.Panel;
const Option = Select.Option;
let scroll;
const { AppState } = stores;

@observer
class Sprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keydown: '',
      selected: {
        droppableId: '',
        issueIds: [],
      },
      draggableId: '',
      createBacklogIssue: false,
      selectIssueType: 'story',
      createIssueValue: '',
    };
  }

  componentDidMount() {
    this.props.onRef(this);
    window.addEventListener('keydown', this.onKeyDown.bind(this));
    window.addEventListener('keyup', this.onKeyUp.bind(this));
  }

  onChangeState(params, data) {
    this.setState({
      [params]: data,
    });
  }

  onKeyUp(event) {
    this.setState({
      keydown: '',
    });
  }

  onKeyDown(event) {
    if (event.keyCode !== this.state.keydown) {
      this.setState({
        keydown: event.keyCode,
      });
    }
  }

  getCurrentState(data) {
    return this.state[data];
  }
  getFirst(str) {
    const re = /[\u4E00-\u9FA5]/g;
    for (let i = 0, len = str.length; i < len; i += 1) {
      if (re.test(str[i])) {
        return str[i];
      }
    }
    return '';
  }
  handleBlurCreateIssue() {
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
        window.console.log(error);
      });
    }
  }

  handleClickIssue(sprintId, item) {
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
          } else {
            let clickSprintDatas = [];
            const firstClick = originIssueIds[0];
            if (item.sprintId) {
              // 如果是shift 并且点击的是冲刺里的issue
              clickSprintDatas = BacklogStore.getSprintData.sprintData
                .filter(s => s.sprintId === item.sprintId)[0].issueSearchDTOList;
            } else {
              // 如果是shift 并且点击的是backlog里的issue
              clickSprintDatas = BacklogStore.getSprintData.backlogData.backLogIssue;
            }
            const indexs = [];
            _.forEach(clickSprintDatas, (cs, index) => {
              if (cs.issueId === firstClick || cs.issueId === item.issueId) {
                indexs.push(index);
              }
            });
            const issueIds = [];
            _.forEach(clickSprintDatas, (cs2, index2) => {
              if (index2 >= indexs[0] && index2 <= indexs[1]) {
                issueIds.push(cs2.issueId);
              }
            });
            this.setState({
              selected: {
                droppableId: sprintId,
                issueIds,
              },
            });
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
        } else {
          this.setState({
            selected: {
              droppableId: '',
              issueIds: [],
            },
          });
        }
      }
    } else {
      this.setState({
        selected: {
          droppableId: '',
          issueIds: [],
        },
      });
      BacklogStore.setClickIssueDetail(item);
    }
  }

  renderSprintIssue(data, sprintId) {
    const result = [];
    _.forEach(data, (item, index) => {
      result.push(
        <SprintIssue
          data={item}
          index={index}
          selected={this.state.selected}
          epicVisible={this.props.epicVisible}
          versionVisible={this.props.versionVisible}
          sprintId={sprintId}
          handleClickIssue={this.handleClickIssue.bind(this)}
          draggableId={this.state.draggableId}
        />,
      );
    });
    return result;
  }
  renderSprint() {
    let result = [];
    if (JSON.stringify(BacklogStore.getSprintData) !== '{}') {
      const data = BacklogStore.getSprintData.sprintData;
      if (data) {
        if (data.length > 0) {
          _.forEach(data, (item, index) => {
            result.push(
              <SprintItem
                item={item}
                renderSprintIssue={this.renderSprintIssue.bind(this)}
                refresh={this.props.refresh.bind(this)}
                index={index}
              />
              ,
            );
          });
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
  renderBacklog() {
    if (JSON.stringify(BacklogStore.getSprintData) !== '{}') {
      const data = BacklogStore.getSprintData.backlogData;
      if (data) {
        const paramItem = {
          sprintName: '待办事项',
          issueSearchDTOList: data.backLogIssue,
          sprintId: 'backlog',
        };
        return (
          <SprintItem
            backlog
            item={paramItem}
            renderSprintIssue={this.renderSprintIssue.bind(this)}
            refresh={this.props.refresh.bind(this)}
          />
        );
      }
    }
    return '';
  }
  render() {
    return (
      <div
        role="none"
        className="c7n-backlog-sprint"
        onMouseEnter={() => {
          BacklogStore.setIsLeaveSprint(false);
        }}
        onMouseLeave={() => {
          BacklogStore.setIsLeaveSprint(true);
        }}
      >
        <Spin spinning={this.props.spinIf}>
          {this.renderSprint()}
          {this.renderBacklog()}
        </Spin>
      </div>
    );
  }
}

export default Sprint;

