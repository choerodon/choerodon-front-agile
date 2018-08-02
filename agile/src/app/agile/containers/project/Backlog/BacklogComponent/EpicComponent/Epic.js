import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { Dropdown, Menu, Modal, Form, Input, Select, Icon, Spin } from 'choerodon-ui';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { fromJS, is } from 'immutable'
import { Content, stores } from 'choerodon-front-boot';
// importthis.props.store from '../../../../../stores/project/backlog/BacklogStore';
import EpicItem from './EpicItem';
import './Epic.scss';
import CreateEpic from './CreateEpic';

const FormItem = Form.Item;
const { AppState } = stores;

@observer
class Epic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableIds: [],
      hoverBlockButton: false,
      addEpic: false,
      epicLoading: false,
    };
  }
  componentWillMount() {
   this.props.store.axiosGetColorLookupValue().then((res) => {
     this.props.store.setColorLookupValue(res.lookupValues);
    }).catch((error) => {
    });
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
   *这里是父组件修改该组件state的函数
   *
   * @param {*} value
   * @memberof Epic
   */
  changeState =(value) => {
    this.setState({
      draggableIds: value,
    });
  }

  /**
   *点击epicItem的事件
   *
   * @param {*} type
   * @memberof Epic
   */
  handleClickEpic =(type) => {
   this.props.store.setChosenEpic(type);
   this.props.store.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
     this.props.store.setSprintData(res);
    }).catch((error) => {
    });
  }

  /**
   *
   *渲染单个epicItem
   * @returns
   * @memberof Epic
   */
  renderEpic =() => {
    const data = this.props.store.getEpicData;
    const result = [];
    if (data.length > 0) {
      for (let index = 0, len = data.length; index < len; index += 1) {
        result.push(
          <EpicItem
            store={this.props.store}
            data={data[index]}
            handleClickEpic={this.handleClickEpic}
            draggableIds={this.state.draggableIds}
            refresh={this.props.refresh}
            index={index}
            issueRefresh={this.props.issueRefresh}
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
  handleEpicDrag =(result) => {
    if (!result.destination) {
      return;
    }
    const data =this.props.store.getEpicData;
    const sourceIndex = result.source.index;
    const tarIndex = result.destination.index;
    let beforeSequence = null;
    let afterSequence = null;
    const res = Array.from(data);
    const [removed] = res.splice(sourceIndex, 1);
    res.splice(tarIndex, 0, removed);
   this.props.store.setEpicData(res);
    if (tarIndex === 0) {
      afterSequence = res[1].epicSequence;
    } else if (tarIndex === res.length - 1) {
      beforeSequence = res[res.length - 2].epicSequence;
    } else {
      afterSequence = res[tarIndex + 1].epicSequence;
      beforeSequence = res[tarIndex - 1].epicSequence;
    }
    const epicId = data[sourceIndex].issueId;
    const { objectVersionNumber } = data[sourceIndex];
    const postData = { afterSequence, beforeSequence, epicId, objectVersionNumber };
   this.props.store.handleEpicDrap(postData)
      .then(() => {
       this.props.store.axiosGetEpic().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
         this.props.store.setEpicData(newEpic);
        }).catch((error3) => {
        });
      }).catch(() => {
       this.props.store.axiosGetEpic().then((data3) => {
          const newEpic = [...data3];
          for (let index = 0, len = newEpic.length; index < len; index += 1) {
            newEpic[index].expand = false;
          }
         this.props.store.setEpicData(newEpic);
        }).catch((error3) => {
        });
      });
  };
  render() {
    return (
      <div
        className={this.props.visible ? 'c7n-backlog-epic' : ''}
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
        {this.props.visible ? (
          <div
            className="c7n-backlog-epicContent"
          >
            <div className="c7n-backlog-epicTitle">
              <p style={{ fontWeight: 'bold' }}>史诗</p>
              <div
                className="c7n-backlog-epicRight"
                style={{
                  display: 'flex',
                  visibility: this.state.hoverBlockButton ? 'visible' : 'hidden',
                }}
              >
                <p
                  style={{ color: '#3F51B5', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  role="none"
                  onClick={() => {
                    this.setState({
                      addEpic: true,
                    });
                  }}
                >创建史诗</p>
                <Icon
                  type="close"
                  role="none"
                  onClick={() => {
                    this.props.changeVisible('epicVisible', false);
                   this.props.store.setIsLeaveSprint(false);
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
                  background:this.props.store.getChosenEpic === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
                }}
                role="none"
                onClick={this.handleClickEpic.bind(this, 'all')}
              >
                所有问题
              </div>
              <DragDropContext onDragEnd={this.handleEpicDrag}>
                <Droppable droppableId={'epic'}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      style={{
                        background: snapshot.isDraggingOver ? '#e9e9e9' : 'white',
                        padding: 'grid',
                        // borderBottom: '1px solid rgba(0,0,0,0.12)'
                      }}
                    >
                      {this.renderEpic()}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              <div
                className={this.props.store.getIsDragging ? 'c7n-backlog-epicItems c7n-backlog-dragToEpic' : 'c7n-backlog-epicItems'}
                style={{
                  background:this.props.store.getChosenEpic === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                }}
                role="none"
                onClick={this.handleClickEpic.bind(this, 'unset')}
                onMouseUp={() => {
                  if (this.props.store.getIsDragging) {
                   this.props.store.axiosUpdateIssuesToEpic(
                      0, this.state.draggableIds).then((res) => {
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
              store={this.props.store}
              visible={this.state.addEpic}
              onCancel={() => {
                this.setState({
                  addEpic: false,
                });
              }}
              refresh={this.props.refresh}
            />
          </div>
        ) : null}
      </div>
    );
  }
}

export default Form.create()(Epic);

