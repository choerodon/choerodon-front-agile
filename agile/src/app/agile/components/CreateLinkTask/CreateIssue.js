import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Spin, Icon } from 'choerodon-ui';

import './CreateIssue.scss';
import '../../containers/main.scss';
import { UploadButton, NumericInput } from '../CommonComponent';
import {
  delta2Html,
  escape,
  handleFileUpload,
  text2Delta,
  beforeTextUpload,
} from '../../common/utils';
import { createLink, loadIssues, createIssue, loadLabels, loadStatus, loadPriorities, loadVersions, loadSprints, loadComponents, loadEpics, createSubIssue } from '../../api/NewIssueApi';
import { getUsers } from '../../api/CommonApi';
import { COLOR } from '../../common/Constant';
import WYSIWYGEditor from '../WYSIWYGEditor';
import FullEditor from '../FullEditor';
import UserHead from '../UserHead';
import TypeTag from '../TypeTag';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
const TYPE = {
  sub_task: '#4d90fe',
};
const ICON = {
  sub_task: 'assignment',
};
const NAME = {
  sub_task: '子任务',
};
class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delta: '',
      edit: false,
      createLoading: false,
      fileList: [],
      sprint: {},
      selectLoading: true,

      originIssues: [],
      originLinks: [],
      originVersions: [],
      originComponents: [],
      originEpics: [],
      originStatus: [],
      originpriorities: [],
      originInfluenceVersions: [],
      originFixVersions: [],
      originSprints: [],
      originUsers: [],

      storyPoints: '',
      storyPointsUnit: 'h',
      time: '',
      timeUnit: 'h',
    };
  }

  componentDidMount() {
    this.getLinks();
  }

  getLinks() {
    this.setState({
      selectLoading: true,
    });
    axios.get(`/agile/v1/project/${AppState.currentMenuType.id}/issue_link_types`)
      .then((res) => {
        this.setState({
          selectLoading: false,
          originLinks: res,
        });
      });
  }

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { linkTypeId, issues } = values;
        const labelIssueRelDTOList = _.map(issues, (issue) => {
          const target = _.find(this.state.originIssues, { issueNum: issue });
          if (target) {
            return ({
              linkTypeId,
              linkedIssueId: target.issueId,
            });
          } else {
            return {};
          }
        });

        this.setState({ createLoading: true });
        createLink(this.props.issueId, labelIssueRelDTOList)
          .then((res) => {
            this.setState({ createLoading: false });
            this.props.onOk();
          });
        
        // this.props.onOk(extra);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;
    const callback = (value) => {
      this.setState({
        delta: value,
        edit: false,
      });
    };

    return (
      <Sidebar
        className="choerodon-modal-createSprint"
        title="创建链接"
        visible={visible || false}
        onOk={this.handleCreateIssue}
        onCancel={onCancel}
        okText="创建"
        cancelText="取消"
        confirmLoading={this.state.createLoading}
      >
        <div className="c7n-region">
          <h2 className="c7n-space-first">对问题创建链接</h2>
          <p>
            请在下面输入子任务的详细信息，创建问题的子任务。子任务会与父级问题的冲刺、史诗保持一致，并且子任务的状态会受父级问题的限制。
            {/* <a href="http://c7n.saas.hand-china.com/docs/devops/develop/" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <Icon type="open_in_new" />
            </a> */}
          </p>
          <Form layout="vertical">
            <FormItem label="关系" style={{ width: '512px' }}>
              {getFieldDecorator('linkTypeId', {})(
                <Select
                  label="关系"
                  loading={this.state.selectLoading}
                >
                  {this.state.originLinks.map(link =>
                    (<Option key={link.linkTypeId} value={link.linkTypeId}>
                      {link.inWard}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="问题" style={{ width: '512px' }}>
              {getFieldDecorator('issues', {})(
                <Select
                  label="问题"
                  mode="multiple"
                  loading={this.state.selectLoading}
                  optionLabelProp="value"
                  filter
                  onFilterChange={(input) => {
                    this.setState({
                      selectLoading: true,
                    });
                    const obj = {
                      advancedSearchArgs: {},
                      searchArgs: {},
                    };
                    loadIssues(0, 20, obj).then((res) => {
                      this.setState({
                        originIssues: res.content,
                        selectLoading: false,
                      });
                    });
                  }}
                >
                  {this.state.originIssues.map(issue =>
                    (<Option
                      key={issue.issueNum}
                      value={issue.issueNum}
                    >
                      <div style={{ display: 'inline-flex', width: '100%', flex: 1 }}>
                        <div>
                          <TypeTag
                            type={{
                              typeCode: issue.typeCode,
                            }}
                          />
                        </div>
                        <a style={{ paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {issue.issueNum}
                        </a>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <p style={{ paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset' }}>
                            {issue.summary}
                          </p>
                        </div>
                      </div>
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>
          </Form>
        </div>
      </Sidebar>
    );
  }
}
export default Form.create({})(withRouter(CreateSprint));
