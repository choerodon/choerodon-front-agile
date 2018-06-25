import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import _ from 'lodash';
import { stores } from 'choerodon-front-boot';
import { Input, message, Icon } from 'choerodon-ui';
import StatusCard from '../StatusCard/StatusCard';
import './SettingColumn.scss';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import EasyEdit from '../../../../../components/EasyEdit/EasyEdit';

const { AppState } = stores;

@observer
class SettingColumn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editMax: false,
      editMin: false,
    };
  }
  handleDeleteColumn() {
    ScrumBoardStore.axiosDeleteColumn(this.props.data.columnId).then((data) => {
      this.props.refresh();
    }).catch((err) => {
      window.console.log(err);
    });
  }
  updateColumnMaxMin(type, value) {
    let totalIssues = 0;
    _.forEach(this.props.data.subStatuses, (sub) => {
      _.forEach(sub.issues, (iss) => {
        if (ScrumBoardStore.getCurrentConstraint === 'issue') {
          totalIssues += 1;
        } else if (iss.typeCode !== 'sub_task') {
          totalIssues += 1;
        }
      });
    });
    const maxminObj = {};
    if (type === 'maxNum') {
      if (this.props.data.minNum) {
        if (parseInt(value, 10) < parseInt(this.props.data.minNum, 10)) {
          message.info('最大值不能小于最小值');
          return;
        }
      }
      if (parseInt(value, 10) < totalIssues) {
        message.info('最大值不能小于当前已有issue数');
        return;
      }
      maxminObj.maxNum = value;
      maxminObj.minNum = this.props.data.minNum;
    }
    if (type === 'minNum') {
      if (this.props.data.maxNum) {
        if (parseInt(value, 10) > parseInt(this.props.data.maxNum, 10)) {
          message.info('最小值不能大于最大值');
          return;
        }
      }
      if (parseInt(value, 10) > totalIssues) {
        message.info('最小值不能大于当前已有issue数');
        return;
      }
      maxminObj.minNum = value;
      maxminObj.maxNum = this.props.data.maxNum;
    }
    const data = {
      boardId: ScrumBoardStore.getSelectedBoard,
      columnId: this.props.data.columnId,
      objectVersionNumber: this.props.data.objectVersionNumber,
      projectId: AppState.currentMenuType.id,
      ...maxminObj,
    };
    ScrumBoardStore.axiosUpdateMaxMinNum(
      this.props.data.columnId, data).then((res) => {
      this.props.refresh();
    }).catch((error) => {
      window.console.log(error);
    });
  }
  handleSaveColumnName(name) {
    const data = {
      columnId: this.props.data.columnId,
      objectVersionNumber: this.props.data.objectVersionNumber,
      name,
      projectId: AppState.currentMenuType.id,
      boardId: ScrumBoardStore.getSelectedBoard,
    };
    ScrumBoardStore.axiosUpdateColumn(
      this.props.data.columnId, data, ScrumBoardStore.getSelectedBoard).then((res) => {
      const originData = ScrumBoardStore.getBoardData;
      originData[this.props.index].objectVersionNumber = res.objectVersionNumber;
      originData[this.props.index].name = res.name;
      ScrumBoardStore.setBoardData(originData);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  renderStatus() {
    const list = this.props.data.subStatuses;
    const result = [];
    _.forEach(list, (item, index) => {
      result.push(
        <StatusCard
          columnId={this.props.data.columnId}
          data={item}
          index={index}
          refresh={this.props.refresh.bind(this)}
        />,
      );
    });
    return result;
  }
  render() {
    if (this.props.disabled) {
      return (
        <div
          className="c7n-scrumsetting-column"
          style={{
            flex: 1,
            height: '100%',
          }}
        >
          <div 
            className="c7n-scrumsetting-columnContent"
            style={{
              background: 'white',
            }}
          >
            <div className="c7n-scrumsetting-columnTop">
              <div
                className="c7n-scrumsetting-icons"
                style={{
                  visibility: this.props.data.columnId === 'unset' ? 'hidden' : 'visible',
                }}
              >
                <Icon
                  type="open_with"
                  style={{
                    cursor: 'pointer',
                  }}
                />
                <Icon
                  type="delete"
                  style={{
                    cursor: 'pointer',
                  }}
                  role="none"
                  onClick={this.handleDeleteColumn.bind(this)}
                />
              </div>
              <div className="c7n-scrumsetting-columnStatus">
                {this.props.data.name}
              </div>
              <div style={{ borderBottom: '3px solid black' }} className="c7n-scrumsetting-columnBottom">
                {
                  this.props.data.columnId === 'unset' ? (
                    <div>
                      <span>无该问题的状态</span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ cursor: 'pointer' }}>最大值：{this.props.data.maxNum}</span>
                      <span style={{ cursor: 'pointer' }}>最小值：{this.props.data.maxNum}</span>
                    </div>
                  )
                }
              </div>
            </div>
            <div className="c7n-scrumsetting-columnDrop">
              <Droppable
                type="status"
                droppableId={`${this.props.data.categoryCode},${this.props.data.columnId}`}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? 'rgba(26,177,111,0.08)' : 'unset',
                      height: '100%',
                    }}
                  >
                    {this.renderStatus()}
                    {/* {provided.placeholder} */}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <Draggable 
          key={this.props.data.columnId}
          index={this.props.index}
          draggableId={JSON.stringify({
            columnId: this.props.data.columnId,
            objectVersionNumber: this.props.data.objectVersionNumber,
          })}
          type="columndrop"
        >
          {(provided1, snapshot1) => (
            <div
              className="c7n-scrumsetting-column"
              ref={provided1.innerRef}
              {...provided1.draggableProps}
              style={{
                flex: 1,
                // width: this.props.styleValue,
                ...provided1.draggableProps.style,
              }}
            >
              <div className="c7n-scrumsetting-columnContent">
                <div className="c7n-scrumsetting-columnTop">
                  <div
                    className="c7n-scrumsetting-icons"
                    style={{
                      visibility: this.props.data.columnId === 'unset' ? 'hidden' : 'visible',
                    }}
                  >
                    <Icon
                      type="open_with"
                      style={{
                        cursor: 'move',
                      }}
                      {...provided1.dragHandleProps}
                    />
                    <Icon
                      type="delete"
                      style={{
                        cursor: 'pointer',
                      }}
                      role="none"
                      onClick={this.handleDeleteColumn.bind(this)}
                    />
                  </div>
                  <div className="c7n-scrumsetting-columnStatus">
                    <EasyEdit
                      type="input"
                      defaultValue={this.props.data.name}
                      enterOrBlur={this.handleSaveColumnName.bind(this)}
                    >
                      {this.props.data.name}
                    </EasyEdit>
                  </div>
                  <div
                    className="c7n-scrumsetting-columnBottom"
                    style={{
                      borderBottom: this.props.data.color ? `3px solid ${this.props.data.color}` : '3px solid black',
                    }}
                  >
                    {
                      this.props.data.columnId === 'unset' ? (
                        <div>
                          <span>无该问题的状态</span>
                        </div>
                      ) : (
                        <div
                          style={{
                            visibility: ScrumBoardStore.getCurrentConstraint === 'constraint_none' ? 'hidden' : 'visible',
                          }}
                        >
                          <EasyEdit
                            className="editSpan"
                            type="input"
                            defaultValue={this.props.data.maxNum ? 
                              this.props.data.maxNum : null}
                            enterOrBlur={(value) => {
                              this.updateColumnMaxMin('maxNum', value);
                            }}
                          >
                            <span
                              style={{ cursor: 'pointer' }}
                            >最大值：{this.props.data.maxNum}</span>
                          </EasyEdit>
                          <EasyEdit
                            className="editSpan"
                            type="input"
                            defaultValue={this.props.data.minNum ? 
                              this.props.data.minNum : null}
                            enterOrBlur={(value) => {
                              this.updateColumnMaxMin('minNum', value);
                            }}
                          >
                            <span
                              style={{ cursor: 'pointer' }}
                            >最小值：{this.props.data.minNum}</span>
                          </EasyEdit>
                        </div>
                      )
                    }
                  </div>
                </div>
                <div className="c7n-scrumsetting-columnDrop">
                  <Droppable
                    type="status"
                    droppableId={`${this.props.data.categoryCode},${this.props.data.columnId},${this.props.data.minNum},${this.props.data.maxNum}`}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver ? 
                            'rgba(26,177,111,0.08)' : 'unset',
                          height: '100%',
                        }}
                      >
                        {this.renderStatus()}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
              {provided1.placeholder}
            </div>
          )}
        </Draggable>
      );
    }
  }
}

export default SettingColumn;

