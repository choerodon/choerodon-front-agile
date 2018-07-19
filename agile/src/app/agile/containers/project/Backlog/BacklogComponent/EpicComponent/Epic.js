import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Dropdown, Menu, Modal, Form, Input, Select, Icon } from 'choerodon-ui';
import { Droppable } from 'react-beautiful-dnd';
import { Content, stores } from 'choerodon-front-boot';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import EpicItem from './EpicItem';
import './Epic.scss';
import CreateEpic from './CreateEpic';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;
const { AppState } = stores;

@observer
class Epic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableIds: [],
      hoverBlockButton: false,
      addEpic: false,
      loading: false,
    };
  }
  componentWillMount() {
    BacklogStore.axiosGetColorLookupValue().then((res) => {
      BacklogStore.setColorLookupValue(res.lookupValues);
    }).catch((error) => {
    });
  }

  componentDidMount() {
    this.props.onRef(this);
  }
  changeState(value) {
    this.setState({
      draggableIds: value,
    });
  }
  handleClickEpic(type) {
    BacklogStore.setChosenEpic(type);
    BacklogStore.axiosGetSprint(BacklogStore.getSprintFilter()).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
    });
  }
  renderEpic() {
    const data = BacklogStore.getEpicData;
    const result = [];
    if (data.length > 0) {
      _.forEach(data, (item, index) => {
        result.push(
          <EpicItem
            data={item}
            handleClickEpic={this.handleClickEpic.bind(this)}
            draggableIds={this.state.draggableIds}
            refresh={this.props.refresh.bind(this)}
            index={index}
            issueRefresh={this.props.issueRefresh.bind(this)}
          />
          ,
        );
      });
    }
    return result;
  }
  render() {
    return (
      <div 
        className={this.props.visible ? 'c7n-backlog-epic' : ''}
        onMouseEnter={() => {
          this.setState({
            hoverBlockButton: true,
          });
        }}
        onMouseLeave={() => {
          this.setState({
            hoverBlockButton: false,
          });
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
                onClick={this.handleClickEpic.bind(this, 'all')}
              >
                  所有问题
              </div>
              {this.renderEpic()}
              <div
                className={BacklogStore.getIsDragging ? 'c7n-backlog-epicItems c7n-backlog-dragToEpic' : 'c7n-backlog-epicItems'}
                style={{
                  background: BacklogStore.getChosenEpic === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                }}
                role="none"
                onClick={this.handleClickEpic.bind(this, 'unset')}
                onMouseUp={() => {
                  if (BacklogStore.getIsDragging) {
                    BacklogStore.axiosUpdateIssuesToEpic(
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
              visible={this.state.addEpic}
              onCancel={() => {
                this.setState({
                  addEpic: false,
                });
              }}
              refresh={this.props.refresh.bind(this)}
            />
          </div>
        ) : ''}
      </div>
    );
  }
}

export default Form.create()(Epic);

