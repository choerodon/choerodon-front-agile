import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Modal, Form, Input, DatePicker, Icon } from 'choerodon-ui';
import { Content, stores, Permission } from 'choerodon-front-boot';
import { fromJS, is } from 'immutable';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
// import this.props.store from '../../../../../stores/project/backlog/this.props.store';
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
      loading: false,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  shouldComponentUpdate = (nextProps, nextState) => {
    const thisProps = fromJS(this.props || {});
    const thisState = fromJS(this.state || {});
    const nextStates = fromJS(nextState || {});
    if (thisProps.size !== nextProps.size ||
      thisState.size !== nextState.size) {
      return true;
    }
    if (is(thisState, nextStates)) {
      return false;
    }
    return true;
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
    this.props.store.setChosenVersion(type);
    this.props.store.axiosGetSprint(this.props.store.getSprintFilter()).then((res) => {
      this.props.store.setSprintData(res);
    }).catch((error) => {
    });
  }
  renderVersion() {
    const data = this.props.store.getVersionData;
    const result = [];
    if (data.length > 0) {
      for (let index = 0, len = data.length; index < len; index += 1) {
        result.push(
          <VersionItem
            store={this.props.store}
            data={data[index]}
            index={index}
            handelClickVersion={this.handelClickVersion.bind(this)}
            draggableIds={this.state.draggableIds}
            refresh={this.props.refresh.bind(this)}
            issueRefresh={this.props.issueRefresh.bind(this)}
          />,
        );
      }
    }
    return result;
  }

  /**
   * 处理史诗拖动
   * @param result
   */
  handleVersionDrag =(result) => {
    if (!result.destination) {
      return;
    }
    const data = this.props.store.getVersionData;
    const sourceIndex = result.source.index;
    const tarIndex = result.destination.index;
    let beforeSequence = null;
    let afterSequence = null;
    const res = Array.from(data);
    const [removed] = res.splice(sourceIndex, 1);
    res.splice(tarIndex, 0, removed);
    this.props.store.setVersionData(res);
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
    const postData = { afterSequence, beforeSequence, versionId: epicId, objectVersionNumber };
    this.props.store.handleVersionDrap(postData)
      .then(() => {
        this.props.store.axiosGetVersion().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
          this.props.store.setVersionData(newEpic);
        }).catch((error3) => {
        });
      }).catch(() => {
        this.props.store.axiosGetVersion().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
          this.props.store.setVersionData(newEpic);
        }).catch((error3) => {
        });
      });
  };
  render() {
    const menu = AppState.currentMenuType;
    const { type, id: projectId, organizationId: orgId } = menu;
    return (
      <div 
        className={this.props.visible ? 'c7n-backlog-version' : ''}
        onMouseEnter={() => {
          this.setState({
            hoverBlockButton: true,
          });
          if (this.props.store.getIsDragging) {
            this.props.store.setIsLeaveSprint(true);
          }
        }}
        onMouseLeave={() => {
          this.setState({
            hoverBlockButton: false,
          });
          if (this.props.store.getIsDragging) {
            this.props.store.setIsLeaveSprint(false);
          }
        }}
      >
        {
          this.props.visible ? (
            <div className="c7n-backlog-versionContent">
              <div className="c7n-backlog-versionTitle">
                <p style={{ fontWeight: 'bold' }}>版本</p>
                <div
                  className="c7n-backlog-versionRight"
                  style={{
                    display: 'flex',
                    visibility: this.state.hoverBlockButton ? 'visible' : 'hidden',
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
                    >创建版本</p>
                  </Permission>
                  <Icon
                    type="close"
                    role="none"
                    style={{
                      cursor: 'pointer',
                      marginLeft: 6,
                    }}
                    onClick={() => {
                      this.props.changeVisible('versionVisible', false);
                      this.props.store.setIsLeaveSprint(false);
                    }}
                  />
                </div>
              </div>
              <div className="c7n-backlog-versionChoice">
                <div
                  className="c7n-backlog-versionItems"
                  style={{
                    color: '#3F51B5',
                    background: this.props.store.getChosenVersion === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'all')}
                >
                  所有问题
                </div>
                <DragDropContext onDragEnd={this.handleVersionDrag}>
                  <Droppable droppableId={'version'} key={'version'}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        style={{
                          background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                          padding: 'grid',
                          // borderBottom: '1px solid rgba(0,0,0,0.12)'
                        }}
                      >
                        {this.renderVersion()}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>

                <div
                  className={this.props.store.getIsDragging ? 'c7n-backlog-versionItems c7n-backlog-dragToVersion' : 'c7n-backlog-versionItems'}
                  style={{
                    background: this.props.store.getChosenVersion === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'unset')}
                  onMouseUp={() => {
                    if (this.props.store.getIsDragging) {
                      this.props.store.axiosUpdateIssuesToVersion(
                        0, this.state.draggableIds).then((res) => {
                        this.props.issueRefresh();
                        this.props.refresh();
                      }).catch((error) => {
                        this.props.refresh();
                      });
                    }
                  }}
                >
                  未指定版本的问题
                </div>
              </div>
              <CreateVersion
                store={this.props.store}
                visible={this.state.addVersion}
                onCancel={() => {
                  this.setState({
                    addVersion: false,
                  });
                }}
                refresh={this.props.refresh.bind(this)}
              />
            </div>
          ) : ''
        }
      </div>
    );
  }
}

export default Form.create()(Version);

