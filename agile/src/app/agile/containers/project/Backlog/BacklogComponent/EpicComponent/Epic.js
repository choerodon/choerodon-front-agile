import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Dropdown, Menu, Modal, Form, Input, Select, Icon, Spin,
} from 'choerodon-ui';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { fromJS, is } from 'immutable';
import { Content, stores } from 'choerodon-front-boot';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import EpicItem from './EpicItem';
import './Epic.scss';
import CreateEpic from './CreateEpic';
import Backlog from "../../../userMap/component/Backlog/Backlog";

@observer
class Epic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      addEpic: false,
    };
  }

  componentWillMount() {
    Promise.all([BacklogStore.axiosGetEpic(), BacklogStore.axiosGetColorLookupValue()]).then(([epicList, lookupValues]) => {
      BacklogStore.initEpicList(epicList, lookupValues);
    });
  }

  /**
   *点击epicItem的事件
   *
   * @param {*} type
   * @memberof Epic
   */
  handleClickEpic =(type) => {
    BacklogStore.setChosenEpic(type);
    BacklogStore.axiosGetSprint().then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  };

  render() {
    return BacklogStore.getCurrentVisible === 'epic' ? (
      <div className="c7n-backlog-epic">
        <div className="c7n-backlog-epicContent">
          <div className="c7n-backlog-epicTitle">
            <p style={{ fontWeight: 'bold' }}>史诗</p>
            <div className="c7n-backlog-epicRight">
              <p
                style={{ color: '#3F51B5', cursor: 'pointer', whiteSpace: 'nowrap' }}
                role="none"
                onClick={() => {
                  this.setState({
                    addEpic: true,
                  });
                }}
              >
                创建史诗
              </p>
              <Icon
                type="close"
                role="none"
                onClick={() => {
                  BacklogStore.toggleVisible(null);
                }}
                style={{
                  cursor: 'pointer',
                  marginLeft: 6,
                }}
              />
            </div>
          </div>
          <div className="c7n-backlog-epicChoice">
            <div
              className="c7n-backlog-epicItems"
              style={{
                color: '#3F51B5',
                background: BacklogStore.getChosenEpic === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
              }}
              role="none"
              onClick={() => {
                this.handleClickEpic('all');
              }}
            >
              所有问题
            </div>
            <DragDropContext
              onDragEnd={(result) => {
                const { destination, source, draggableId } = result;
                const { droppableId: destinationId, index: destinationIndex } = destination;
                const { droppableId: sourceId, index: sourceIndex } = source;
                BacklogStore.moveEpic(sourceIndex, destinationIndex);

              }}
            >
              <Droppable droppableId="epic">
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    style={{
                      background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                      padding: 'grid',
                    }}
                  >
                    <EpicItem
                      clickEpic={this.handleClickEpic}
                      draggableIds={this.state.draggableIds}
                      refresh={this.props.refresh}
                      issueRefresh={this.props.issueRefresh}
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div
              style={{
                background: BacklogStore.getChosenEpic === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
              }}
              role="none"
              onClick={() => {
                this.handleClickEpic('unset');
              }}
              onMouseEnter={(e) => {
                if (BacklogStore.isDragging) {
                  e.currentTarget.style.border = '2px dashed green';
                }
              }}
              onMouseLeave={(e) => {
                if (BacklogStore.isDragging) {
                  e.currentTarget.style.border = 'none';
                }
              }}
              onMouseUp={(e) => {
                if (BacklogStore.getIsDragging) {
                  e.currentTarget.style.border = 'none';
                  BacklogStore.axiosUpdateIssuesToEpic(
                    0, this.state.draggableIds,
                  ).then((res) => {
                    this.props.issueRefresh();
                    this.props.refresh();
                  }).catch((error) => {
                    this.props.issueRefresh();
                    this.props.refresh();
                  });
                }
              }}
            >
              未指定史诗的问题
            </div>
          </div>
          <CreateEpic
            store={BacklogStore}
            visible={this.state.addEpic}
            onCancel={() => {
              this.setState({
                addEpic: false,
              });
            }}
            refresh={this.props.refresh}
          />
        </div>
      </div>
    ) : null;
  }
}

export default Epic;
