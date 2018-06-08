import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Dropdown, Menu, Modal, Form, Input, Select, Icon } from 'choerodon-ui';
import { Droppable } from 'react-beautiful-dnd';
import { Content, stores } from 'choerodon-front-boot';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import EpicItem from './EpicItem';
import './Epic.scss';

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
      window.console.log(error);
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
    const chosenVersion = BacklogStore.getChosenVersion;
    const data = {
      advancedSearchArgs: {},
    };
    if (type === 'unset') {
      data.advancedSearchArgs.noEpic = 'true';
    } else if (type !== 'all') {
      data.advancedSearchArgs.epicId = type;
    }
    if (chosenVersion === 'unset') {
      data.advancedSearchArgs.noVersion = 'true';
    } else if (chosenVersion !== 'all') {
      data.advancedSearchArgs.versionId = chosenVersion;
    }
    if (BacklogStore.getOnlyMe) {
      data.advancedSearchArgs.ownIssue = 'true';
    }
    if (BacklogStore.getRecent) {
      data.advancedSearchArgs.onlyStory = 'true';
    }
    BacklogStore.axiosGetSprint(data).then((res) => {
      BacklogStore.setSprintData(res);
    }).catch((error) => {
      window.console.log(error);
    });
  }
  handleCreateEpic(e) {
    this.setState({
      loading: true,
    });
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const data = {
          priorityCode: 'medium',
          projectId: AppState.currentMenuType.id,
          epicName: value.name,
          summary: value.summary,
          typeCode: 'issue_epic',
        };
        BacklogStore.axiosEasyCreateIssue(data).then((res) => {
          this.setState({
            addEpic: false,
            loading: false,
          });
          this.props.refresh();
        }).catch((error) => {
          this.setState({
            loading: false,
          });
          window.console.log(error);
        });
      }
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
          />
          ,
        );
      });
    }
    return result;
  }
  render() {
    const { getFieldDecorator } = this.props.form;
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
              <p style={{ flex: 1, fontWeight: 'bold' }}>史诗</p>
              <div
                className="c7n-backlog-epicRight"
                style={{
                  display: this.state.hoverBlockButton ? 'flex' : 'none',
                }}
              >
                <p
                  style={{ color: '#3F51B5', cursor: 'pointer' }}
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
                      this.props.refresh();
                    }).catch((error) => {
                      window.console.log(error);
                      this.props.refresh();
                    });
                  }
                }}
              >
                  未指定史诗的问题
              </div>
            </div>
            <Sidebar
              title="创建史诗"
              visible={this.state.addEpic}
              okText="新建"
              cancelText="取消"
              onCancel={() => {
                this.setState({
                  addEpic: false,
                });
              }}
              confirmLoading={this.state.loading}
              onOk={this.handleCreateEpic.bind(this)}
            >
              <Content
                style={{
                  padding: 0,
                }}
                title={`创建项目“${AppState.currentMenuType.name}”的史诗`}
                description="请在下面输入史诗名称、概要，创建新史诗。"
                // link="#"
              >
                <Form style={{ width: 512 }}>
                  <FormItem>
                    {getFieldDecorator('type', {
                      initialValue: 'epic',
                      rules: [{
                        required: true,
                        message: '',
                      }],
                    })(
                      <Select size="small" disabled label="问题类型">
                        <Option value="epic">
                          <div style={{ display: 'inline-flex', alignItems: 'center', margin: '5px 0' }}>
                            <div
                              style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                background: '#743BE7',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}
                            >
                              <Icon style={{ color: 'white' }} type="priority" />
                            </div>
                            <p style={{ marginLeft: 8 }}>史诗</p>
                          </div>
                        </Option>
                      </Select>,
                    )}
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator('name', {
                      rules: [{
                        required: true,
                        message: '史诗名称不能为空',
                      }],
                    })(
                      <Input label="史诗名称" maxLength={30} />,
                    )}
                  </FormItem>
                  <FormItem>
                    {getFieldDecorator('summary', {
                      rules: [{
                        required: true,
                        message: '概要不能为空',
                      }],
                    })(
                      <TextArea autoSize label="概要" maxLength={30} />,
                    )}
                  </FormItem>
                </Form>
              </Content>
            </Sidebar>
          </div>
        ) : ''}
      </div>
    );
  }
}

export default Form.create()(Epic);

