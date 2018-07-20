import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { Modal, Form, Radio, Input, Select, Tooltip, Icon } from 'choerodon-ui';
import { stores, Content, axios } from 'choerodon-front-boot';
import { injectIntl, FormattedMessage } from 'react-intl';
import './CreateBranch.scss';
import './commom.scss';

const { AppState } = stores;
const Sidebar = Modal.Sidebar;
const { Option, OptGroup } = Select;
const FormItem = Form.Item;
const MAP = {
  bug: 'bugfix',
  task: 'custom',
  story: 'feature',
  issue_epic: 'custom',
  sub_task: 'custom',
};

class CreateBranch extends Component {
  constructor(props) {
    const menu = AppState.currentMenuType;
    super(props);
    this.state = {
      name: 'feature',
      value: '',
      projectId: menu.id,
      confirmLoading: false,
      initValue: null,
      type: 'custom',

      selectLoading: false,
      originApps: [],
      originBranchs: [],
      branchs: [],
      branchsShowMore: false,
      branchsMaxPage: 0,
      branchsInput: '',
      branchsSize: 5,
      branchsObj: {},
      tags: [],
      tagsShowMore: false,
      tagsMaxPage: 0,
      tagsInput: '',
      tagsSize: 5,
      tagsObj: {},
      branchsExpand: false,
      tagsExpand: false,
    };
  }

  componentDidMount() {
  }

  /**
   * 获取列表的icon
   * @param type 分支类型
   * @returns {*}
   */
  getIcon =(name) => {
    let icon;
    let type;
    if (name) {
      type = name.split('-')[0];
    }
    switch (type) {
      case 'feature':
        icon = <span className="c7n-branch-icon icon-feature">F</span>;
        break;
      case 'bugfix':
        icon = <span className="c7n-branch-icon icon-develop">B</span>;
        break;
      case 'hotfix':
        icon = <span className="c7n-branch-icon icon-hotfix">H</span>;
        break;
      case 'master':
        icon = <span className="c7n-branch-icon icon-master">M</span>;
        break;
      case 'release':
        icon = <span className="c7n-branch-icon icon-release">R</span>;
        break;
      default:
        icon = <span className="c7n-branch-icon icon-custom">C</span>;
    }
    return icon;
  };

  /**
   * 提交分支数据
   * @param e
   */
  handleOk = (e) => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const devopsBranchDTO = {
          branchName: values.type === 'custom' ? values.name : `${values.type}-${values.name}`,
          issueId: this.props.issueId,
          originBranch: values.branch,
        };
        const applicationId = values.app;
        const projectId = AppState.currentMenuType.id;
        this.setState({
          confirmLoading: true,
        });
        axios.post(`/devops/v1/projects/${projectId}/apps/${applicationId}/git/branch`, devopsBranchDTO)
          .then((res) => {
            this.setState({
              confirmLoading: false,
            });
            this.props.onOk();
          })
          .catch((error) => {
            this.setState({
              confirmLoading: false,
            });
          });
      }
    });
  };
  /**
   * 验证分支名的正则
   * @param rule
   * @param value
   * @param callback
   */
  checkName =(rule, value, callback) => {
    // eslint-disable-next-line no-useless-escape
    const endWith = /(\/|\.|\.lock)$/;
    const contain = /(\s|~|\^|:|\?|\*|\[|\\|\.\.|@\{|\/{2,}){1}/;
    const single = /^@+$/;
    const { intl } = this.props;
    if (endWith.test(value)) {
      callback(intl.formatMessage({ id: 'branch.checkNameEnd' }));
    } else if (contain.test(value) || single.test(value)) {
      callback(intl.formatMessage({ id: 'branch.check' }));
    } else {
      callback();
    }
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { visible, intl, store } = this.props;
    const branches = [];
    const tags = [];
    return (
      <Sidebar
        className="c7n-createBranch"
        title="创建分支"
        visible={visible}
        onOk={this.handleOk}
        onCancel={this.props.onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.confirmLoading}
      >
        <Content
          style={{
            padding: 0,
            width: 512,
          }}
          title={`对问题“${this.props.issueNum}”创建分支`}
          description="您可以在此选择应用、分支来源，可以修改默认的分支类型及分支名称，即可为该问题创建关联的分支。"
        >
          <Form layout="vertical" className="c7n-sidebar-form">
            <div className="branch-formItem-icon">
              <span className="icon icon-widgets" />
            </div>
            <FormItem
              className="branch-formItem"
            >
              {getFieldDecorator('app', {
                rules: [{
                  required: true,
                }],
              })(
                <Select
                  label="应用名称"
                  allowClear
                  onFocus={() => {
                    this.setState({ selectLoading: true });
                    axios.get(`/devops/v1/projects/${AppState.currentMenuType.id}/apps`)
                      .then((res) => {
                        this.setState({
                          originApps: res,
                          selectLoading: false,
                        });
                      });
                  }}
                  filter
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  loading={this.state.selectLoading}
                >
                  {this.state.originApps.map(app => (
                    <Option value={app.id} key={app.id}>
                      {app.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem> 
            <div className="branch-formItem-icon">
              <span className="icon icon-wrap_text" />
            </div>
            <FormItem
              className="branch-formItem"
            >
              {getFieldDecorator('branch', {
                rules: [{
                  required: true,
                }],
              })(
                <Select
                  label="分支来源"
                  allowClear
                  disabled={!this.props.form.getFieldValue('app')}
                  filter
                  filterOption={false}
                  optionLabelProp="value"
                  // optionFilterProp="children"
                  // filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                  loading={this.state.selectLoading}
                  onFilterChange={(input) => {
                    this.setState({ branchsInput: input });
                    axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/branches?page=0&size=5`, {
                      searchParam: {
                        branchName: [input],
                      },
                      param: '',
                    })
                      .then((res) => {
                        this.setState({
                          branchs: res.content,
                          branchsSize: res.numberOfElements,
                          branchsShowMore: res.totalPages !== 1,
                          branchsObj: res,
                        });
                      });
                    axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/tags_list_options?page=0&size=5`, {
                      searchParam: {
                        tagName: [input],
                      },
                      param: '',
                    })
                      .then((res) => {
                        this.setState({
                          tags: res.content,
                          tagsSize: res.numberOfElements,
                          tagsShowMore: res.totalPages !== 1,
                          tagsObj: res,
                        });
                      });
                  }}
                >
                  <OptGroup label="分支" key="branchGroup">
                    {this.state.branchs.map(s => (
                      <Option value={s.branchName} key={s.branchName}><Icon type="branch" />{s.branchName}</Option>
                    ))}
                    {
                      this.state.branchsObj.totalElements > this.state.branchsObj.numberOfElements && this.state.branchsObj.numberOfElements > 0 ? (
                        <Option key="more">
                          <div
                            role="none"
                            style={{
                              margin: '-4px -20px',
                              padding: '4px 20px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/branches?page=0&size=${this.state.branchsSize + 5}`, {
                                searchParam: {
                                  branchName: [this.state.branchsInput],
                                },
                                param: null,
                              })
                                .then((res) => {
                                  this.setState({
                                    branchs: res.content,
                                    branchsSize: res.numberOfElements,
                                    branchsShowMore: res.totalPages !== 1,
                                    branchsObj: res,
                                  });
                                });
                            }}
                          >
                            查看更多
                          </div>
                        </Option>
                      ) : null
                    } 
                  </OptGroup>
                  <OptGroup label="tag" key="tagGroup">
                    {this.state.tags.map(s => (
                      <Option value={s.name} key={s.name}><Icon type="local_offer" />{s.name}</Option>
                    ))}
                    {
                      this.state.tagsObj.totalElements > this.state.branchsObj.numberOfElements && this.state.branchsObj.numberOfElements > 0 ? (
                        <Option key="more">
                          <div
                            role="none"
                            style={{
                              margin: '-4px -20px',
                              padding: '4px 20px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              axios.post(`/devops/v1/projects/${AppState.currentMenuType.id}/apps/${this.props.form.getFieldValue('app')}/git/tags_list_options?page=0&size=${this.state.tagsSize + 5}`, {
                                searchParam: {
                                  tagName: [this.state.branchsInput],
                                },
                                param: null,
                              })
                                .then((res) => {
                                  this.setState({
                                    tags: res.content,
                                    tagsSize: res.numberOfElements,
                                    tagsShowMore: res.totalPages !== 1,
                                    tagsObj: res,
                                  });
                                });
                            }}
                          >
                            查看更多
                          </div>
                        </Option>
                      ) : null
                    } 
                  </OptGroup>
                </Select>,
              )}
            </FormItem>
            
            <div className="branch-formItem-icon">
              <span className="icon icon-branch" />
            </div>
            <FormItem
              className={'c7n-formItem_180'}
            >
              {getFieldDecorator('type', {
                rules: [{
                  required: true,
                }],
                initialValue: _.keys(MAP).includes(this.props.typeCode) ? MAP[this.props.typeCode]: undefined,
              })(
                <Select
                  allowClear
                  label="分支类型"
                  // disabled={!(this.props.form.getFieldValue('app') && this.props.form.getFieldValue('branch'))}
                >
                  {['feature', 'bugfix', 'release', 'hotfix', 'custom'].map(s => (
                    <Option value={s} key={s}>{this.getIcon(s)}<span>{s}</span></Option>
                  ))}
                </Select>,
              )}
            </FormItem>
            <FormItem
              className="c7n-formItem_281"
            >
              {getFieldDecorator('name', {
                rules: [{
                  required: true,
                }, {
                  validator: this.checkName,
                }],
                initialValue: this.props.issueNum,
              })(
                <Input
                  label="分支名称"
                  prefix={this.props.form.getFieldValue('type') === 'custom' || !this.props.form.getFieldValue('type') ? '' : `${this.props.form.getFieldValue('type')}-`}
                  maxLength={30}
                  // disabled={!(this.props.form.getFieldValue('app') && this.props.form.getFieldValue('branch'))}
                />,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(injectIntl(CreateBranch)));
