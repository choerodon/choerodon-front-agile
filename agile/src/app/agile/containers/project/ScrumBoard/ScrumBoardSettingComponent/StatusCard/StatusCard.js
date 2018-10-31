import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Draggable } from 'react-beautiful-dnd';
import { Radio, Icon } from 'choerodon-ui';
import { stores, Permission } from 'choerodon-front-boot';
import _ from 'lodash';
import ScrumBoardStore from '../../../../../stores/project/scrumBoard/ScrumBoardStore';
import EditStatus from '../EditStatus/EditStatus';
import './StatusCard.scss';

const { AppState } = stores;

@observer
class StatusCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      complete: false,
      visible: false,
      disabled: false,
    };
  }

  getStatusNumber() {
    const data = ScrumBoardStore.getBoardData;
    let length = 0;
    for (let index = 0, len = data.length; index < len; index += 1) {
      length += data[index].subStatuses.length;
    }
    return length;
  }

  handleDeleteStatus() {
    const originData = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
    const data = JSON.parse(JSON.stringify(ScrumBoardStore.getBoardData));
    const deleteCode = this.props.data.statusId;
    let deleteIndex = '';
    for (let index = 0, len = data[data.length - 1].subStatuses.length; index < len; index += 1) {
      if (String(data[data.length - 1].subStatuses[index].id) === String(deleteCode)) {
        deleteIndex = index;
      }
    }
    data[data.length - 1].subStatuses.splice(deleteIndex, 1);
    ScrumBoardStore.setBoardData(data);
    ScrumBoardStore.axiosDeleteStatus(deleteCode).catch((error) => {
      ScrumBoardStore.setBoardData(originData);
    });
  }

  renderCloseDisplay() {
    if (this.props.columnId === 'unset') {
      if (this.props.data.issues.length === 0) {
        if (this.getStatusNumber() > 1) {
          return 'block';
        }
      }
    }
    return 'none';
  }

  renderBackground() {
    const data = this.props.data.categoryCode;
    if (data === 'todo') {
      return 'rgb(255, 177, 0)';
    } else if (data === 'doing') {
      return 'rgb(77, 144, 254)';
    } else if (data === 'done') {
      return 'rgb(0, 191, 165)';
    }
    return '#d8d8d8';
  }

  render() {
    this.getStatusNumber();
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <Draggable 
        key={this.props.data.code}
        draggableId={`${this.props.data.statusId},${this.props.data.objectVersionNumber}`}
        index={this.props.index}
        type="status"
      >
        {(provided, snapshot) => (
          <div>
            <div 
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
              style={{
                cursor: 'move',
                userSelect: 'none',
                ...provided.draggableProps.style,
              }}
              className="c7n-scrumsetting-card"
            >
              <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue-status.updateStatus']}>
                <Icon
                  style={{ 
                    position: 'absolute', 
                    right: this.renderCloseDisplay() === 'block' ? 32 : 12,
                    top: '15px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    visibility: 'hidden',
                  }} 
                  type="settings"
                  role="none"
                  onClick={() => {
                    if (JSON.stringify(ScrumBoardStore.getStatusCategory) === '{}') {
                      ScrumBoardStore.axiosGetStatusCategory().then((data) => {
                        ScrumBoardStore.setStatusCategory(data);
                        this.setState({
                          visible: true,
                        });
                      }).catch((error) => {
                      });
                    } else {
                      this.setState({
                        visible: true,
                      });
                    }
                  }}
                />
              </Permission>
              <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue-status.deleteStatus']}>
                <Icon
                  style={{
                    position: 'absolute',
                    top: 15,
                    right: 12,
                    display: this.renderCloseDisplay(),
                    cursor: 'pointer',
                    fontSize: '14px',
                    visibility: 'hidden',
                  }}
                  role="none"
                  onClick={this.handleDeleteStatus.bind(this)}
                  type="delete"
                />
              </Permission>
              <EditStatus
                visible={this.state.visible}
                onChangeVisible={(data) => {
                  this.setState({
                    visible: data,
                  });
                }}
                data={this.props.data}
                refresh={this.props.refresh.bind(this)}
              />
              <span
                className="c7n-scrumsetting-cardStatus"
                style={{
                  background: this.props.data.categoryCode ? this.renderBackground() : '',
                  color: 'white',
                }}
              >
                {this.props.data.status ? this.props.data.status : this.props.data.name}
              </span>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', 
              }}
              >
                <p className="textDisplayOneColumn">
                  {this.props.data.issues ? `${this.props.data.issues.length} issues` : ''}
                </p>
                <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.issue-status.updateStatus']}>
                  <Radio
                    disabled={this.state.disabled}
                    style={{ marginRight: 0 }}
                    checked={this.props.data.completed ? this.props.data.completed : false}
                    onClick={() => {
                      const data = {
                        id: this.props.data.id,
                        objectVersionNumber: this.props.data.objectVersionNumber,
                        completed: !this.props.data.completed,
                        projectId: AppState.currentMenuType.id,
                      };
                      // this.props.setLoading.bind(this);
                      this.setState({
                        disabled: true,
                      });
                      ScrumBoardStore.axiosUpdateIssueStatus(
                        this.props.data.id, data,
                      ).then((res) => {
                        this.props.refresh();
                      }).then((res) => {
                        this.setState({
                          disabled: false,
                        });
                      })
                        .catch((error) => {
                        });
                    }}
                  >
                    {'设置已完成'}
                  </Radio>
                </Permission>
              </div>
            </div>
            {provided.placeholder}
          </div>
        )
        }
      </Draggable>
    );
  }
}

export default StatusCard;
