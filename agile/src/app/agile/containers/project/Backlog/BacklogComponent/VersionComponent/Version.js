import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import {
  Modal, Form, Input, DatePicker, Icon, 
} from 'choerodon-ui';
import { Content, stores, Permission } from 'choerodon-front-boot';
import { fromJS, is } from 'immutable';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import VersionItem from './VersionItem';
import './Version.scss';
import CreateVersion from './CreateVersion';

const { AppState } = stores;

@observer
class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableIds: [],
      hoverBlockButton: false,
      addVersion: false,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size
      || thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
  };

  /**
   * 处理史诗拖动
   * @param result
   */
  handleVersionDrag = (result) => {
    if (!result.destination) {
      return;
    }
    const data = BacklogStore.getVersionData;
    const sourceIndex = parseInt(result.source.index, 10);
    const tarIndex = parseInt(result.destination.index, 10);
    let beforeSequence = null;
    let afterSequence = null;
    const res = Array.from(data);
    const [removed] = res.splice(sourceIndex, 1);
    res.splice(tarIndex, 0, removed);
    BacklogStore.setVersionData(res);
    // 拖的方向
    if (tarIndex === 0) {
      afterSequence = res[1].sequence;
    } else if (tarIndex === res.length - 1) {
      beforeSequence = res[res.length - 2].sequence;
    } else {
      afterSequence = res[tarIndex + 1].sequence;
      beforeSequence = res[tarIndex - 1].sequence;
    }
    const epicId = data[sourceIndex].versionId;
    const { objectVersionNumber } = data[sourceIndex];
    const postData = {
      afterSequence, beforeSequence, versionId: epicId, objectVersionNumber,
    };
    BacklogStore.handleVersionDrap(postData)
      .then(() => {
        BacklogStore.axiosGetVersion().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
          BacklogStore.setVersionData(newEpic);
        }).catch((error3) => {
        });
      }).catch(() => {
        BacklogStore.axiosGetVersion().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
          BacklogStore.setVersionData(newEpic);
        }).catch((error3) => {
        });
      });
  };


  /**
   *其他组件修改该组件state的方法
   *
   * @param {*} value
   * @memberof Version
   */
  changeState(value) {
    this.setState({
      draggableIds: value,
    });
  }

  /**
   *点击versionItem事件
   *
   * @param {*} type
   * @memberof Version
   */
  handelClickVersion(type) {
    const { store } = this.props;
    store.setChosenVersion(type);
    store.axiosGetSprint(store.getSprintFilter()).then((res) => {
      store.setSprintData(res);
    }).catch((error) => {
    });
  }

  renderVersion() {
    const { store, refresh, issueRefresh } = this.props;
    const { draggableIds } = this.state;
    const data = store.getVersionData;
    const result = [];
    if (data.length > 0) {
      for (let index = 0, len = data.length; index < len; index += 1) {
        result.push(
          <VersionItem
            data={data[index]}
            index={index}
            handelClickVersion={this.handelClickVersion.bind(this)}
            draggableIds={draggableIds}
            refresh={refresh.bind(this)}
            issueRefresh={issueRefresh.bind(this)}
          />,
        );
      }
      return (
        <Droppable droppableId="version">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              style={{
                background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                padding: 'grid',
              }}
            >
              {result}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      );
    }
    return result;
  }

  render() {
    const {
      visible,
      store,
      changeVisible,
      issueRefresh,
      refresh,
    } = this.props;
    const { hoverBlockButton, draggableIds, addVersion } = this.state;
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <div 
        className={visible ? 'c7n-backlog-version' : ''}
        onMouseEnter={() => {
          this.setState({
            hoverBlockButton: true,
          });
          if (store.getIsDragging) {
            store.setIsLeaveSprint(true);
          }
        }}
        onMouseLeave={() => {
          this.setState({
            hoverBlockButton: false,
          });
          if (store.getIsDragging) {
            store.setIsLeaveSprint(false);
          }
        }}
      >
        {
          visible ? (
            <div className="c7n-backlog-versionContent">
              <div className="c7n-backlog-versionTitle">
                <p style={{ fontWeight: 'bold' }}>版本</p>
                <div
                  className="c7n-backlog-versionRight"
                  style={{
                    display: 'flex',
                    visibility: hoverBlockButton ? 'visible' : 'hidden',
                  }}
                >
                  <Permission type={type} projectId={projectId} organizationId={orgId} service={['agile-service.product-version.createVersion']}>
                    <p
                      style={{ color: '#3F51B5', cursor: 'pointer', whiteSpace: 'nowrap' }}
                      role="none"
                      onClick={() => {
                        this.setState({
                          addVersion: true,
                        });
                      }}
                    >
                      {'创建版本'}
                    </p>
                  </Permission>
                  <Icon
                    type="close"
                    role="none"
                    style={{
                      cursor: 'pointer',
                      marginLeft: 6,
                    }}
                    onClick={() => {
                      changeVisible('versionVisible', false);
                      store.setIsLeaveSprint(false);
                    }}
                  />
                </div>
              </div>
              <div className="c7n-backlog-versionChoice">
                <div
                  className="c7n-backlog-versionItems"
                  style={{
                    color: '#3F51B5',
                    background: store.getChosenVersion === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'all')}
                >
                  所有问题
                </div>
                <DragDropContext onDragEnd={this.handleVersionDrag}>
                  {this.renderVersion()}
                </DragDropContext>

                <div
                  className={store.getIsDragging ? 'c7n-backlog-versionItems c7n-backlog-dragToVersion' : 'c7n-backlog-versionItems'}
                  style={{
                    background: store.getChosenVersion === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'unset')}
                  onMouseUp={() => {
                    if (store.getIsDragging) {
                      store.axiosUpdateIssuesToVersion(
                        0, draggableIds,
                      ).then((res) => {
                        issueRefresh();
                        refresh();
                      }).catch((error) => {
                        refresh();
                      });
                    }
                  }}
                >
                  {'未指定版本的问题'}
                </div>
              </div>
              <CreateVersion
                store={store}
                visible={addVersion}
                onCancel={() => {
                  this.setState({
                    addVersion: false,
                  });
                }}
                refresh={refresh.bind(this)}
              />
            </div>
          ) : ''
        }
      </div>
    );
  }
}

export default Form.create()(Version);
