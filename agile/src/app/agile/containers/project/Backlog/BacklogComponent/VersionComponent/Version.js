import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Modal, Form, Input, DatePicker, Icon } from 'choerodon-ui';
import { Content, stores } from 'choerodon-front-boot';
import moment from 'moment';
import ReleaseStore from '../../../../../stores/project/release/ReleaseStore';
import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';
import VersionItem from './VersionItem';
import './Version.scss';

const { Sidebar } = Modal;
const FormItem = Form.Item;
const { TextArea } = Input;
const { AppState } = stores;

@observer
class Version extends Component {
  constructor(props) {
    super(props);
    this.state = {
      draggableIds: [],
      hoverBlockButton: false,
      addVersion: false,
      startDate: null,
      endDate: null,
      loading: false,
    };
  }
  componentDidMount() {
    this.props.onRef(this);
  }
  changeState(value) {
    this.setState({
      draggableIds: value,
    });
  }
  handelClickVersion(type) {
    BacklogStore.setChosenVersion(type);
    const chosenEpic = BacklogStore.getChosenEpic;
    const data = {
      advancedSearchArgs: {},
    };
    if (type === 'unset') {
      data.advancedSearchArgs.noVersion = 'true';
    } else if (type !== 'all') {
      data.advancedSearchArgs.versionId = type;
    }
    if (chosenEpic === 'unset') {
      data.advancedSearchArgs.noEpic = 'true';
    } else if (chosenEpic !== 'all') {
      data.advancedSearchArgs.epicId = chosenEpic;
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
  handleCreateVersion(e) {
    this.setState({
      loading: true,
    });
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        const data = {
          description: value.description,
          name: value.name,
          projectId: AppState.currentMenuType.id,
          startDate: value.startDate ? `${moment(value.startDate).format('YYYY-MM-DD')} 00:00:00` : null,
          releaseDate: value.endDate ? `${moment(value.endDate).format('YYYY-MM-DD')} 00:00:00` : null,
        };
        ReleaseStore.axiosAddRelease(data).then((res) => {
          this.setState({
            addVersion: false,
            loading: false,
          });
          this.props.refresh();
        }).catch((error) => {
          this.setState({
            loading: false,
            addVersion: false,
          });
          window.console.log(error);
        });
      }
    });
  }
  renderVersion() {
    const data = BacklogStore.getVersionData;
    const result = [];
    if (data.length > 0) {
      _.forEach(data, (item, index) => {
        result.push(
          <VersionItem
            data={item}
            index={index}
            handelClickVersion={this.handelClickVersion.bind(this)}
            draggableIds={this.state.draggableIds}
            refresh={this.props.refresh.bind(this)}
          />,
        );
      });
    }
    return result;
  }
  
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <div 
        className={this.props.visible ? 'c7n-backlog-version' : ''}
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
        {
          this.props.visible ? (
            <div className="c7n-backlog-versionContent">
              <div className="c7n-backlog-versionTitle">
                <p style={{ flex: 1, fontWeight: 'bold' }}>版本</p>
                <div 
                  className="c7n-backlog-versionRight"
                  style={{
                    display: this.state.hoverBlockButton ? 'flex' : 'none',
                  }}
                >
                  <p
                    style={{ color: '#3F51B5', cursor: 'pointer' }}
                    role="none"
                    onClick={() => {
                      this.setState({
                        addVersion: true,
                      });
                    }}
                  >创建版本</p>
                  <Icon 
                    type="close"
                    role="none"
                    style={{
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      this.props.changeVisible('versionVisible', false);
                    }}
                  />
                </div>
              </div>
              <div className="c7n-backlog-versionChoice">
                <div 
                  className="c7n-backlog-versionItems" 
                  style={{ 
                    color: '#3F51B5',
                    background: BacklogStore.getChosenVersion === 'all' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'all')}
                >
                  所有问题
                </div>
                {this.renderVersion()}
                <div
                  className={BacklogStore.getIsDragging ? 'c7n-backlog-versionItems c7n-backlog-dragToVersion' : 'c7n-backlog-versionItems'}
                  style={{ 
                    background: BacklogStore.getChosenVersion === 'unset' ? 'rgba(140, 158, 255, 0.08)' : '',
                  }}
                  role="none"
                  onClick={this.handelClickVersion.bind(this, 'unset')}
                  onMouseUp={() => {
                    if (BacklogStore.getIsDragging) {
                      BacklogStore.axiosUpdateIssuesToVersion(
                        0, this.state.draggableIds).then((res) => {
                        this.props.refresh();
                      }).catch((error) => {
                        window.console.log(error);
                        this.props.refresh();
                      });
                    }
                  }}
                >
                  未指定版本的问题
                </div>
              </div>
              <Sidebar
                title="创建版本"
                visible={this.state.addVersion}
                okText="新建"
                cancelText="取消"
                onCancel={() => {
                  this.setState({
                    addVersion: false,
                  });
                }}
                confirmLoading={this.state.loading}
                onOk={this.handleCreateVersion.bind(this)}
              >
                <Content
                  style={{
                    padding: 0,
                  }}
                  title={`创建项目“${AppState.currentMenuType.name}”的版本`}
                  description="请在下面输入版本的名称、描述、开始和结束日期，创建新的软件版本。"
                  
                >
                  <Form style={{ width: 512 }}>
                    <FormItem>
                      {getFieldDecorator('name', {
                        rules: [{
                          required: true,
                          message: '版本名称不能为空',
                        }],
                      })(
                        <Input maxLength={30} label="版本名称" />,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('description', {})(
                        <TextArea autoSize label="版本描述" maxLength={30} />,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('startDate', {})(
                        <DatePicker
                          style={{ width: '100%' }} 
                          label="开始日期"
                          onChange={(date) => {
                            this.setState({
                              startDate: date,
                            });
                          }}
                          disabledDate={this.state.endDate ? current => current > moment(this.state.endDate) : ''}
                        />,
                      )}
                    </FormItem>
                    <FormItem>
                      {getFieldDecorator('endDate', {})(
                        <DatePicker
                          style={{ width: '100%' }}
                          label="结束日期"
                          onChange={(date) => {
                            this.setState({
                              endDate: date,
                            });
                          }}
                          disabledDate={this.state.startDate ? current => current < moment(this.state.startDate) : ''}
                        />,
                      )}
                    </FormItem>
                  </Form>
                </Content>
              </Sidebar>
            </div>
          ) : ''
        }
      </div>
    );
  }
}

export default Form.create()(Version);

