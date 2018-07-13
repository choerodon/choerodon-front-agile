import React, { Component } from 'react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { Select, Form, Input, Button, Modal, Spin, Icon } from 'choerodon-ui';

import './CreateIssue.scss';
import '../../assets/main.scss';
import { createLink, loadIssuesInLink } from '../../api/IssueApi';
import TypeTag from '../TypeTag';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
let sign = false;

class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createLoading: false,
      selectLoading: true,

      originIssues: [],
      originLinks: [],

      active: [],
      passive: [],
      show: [],

      selected: [],
    };
  }

  componentDidMount() {
    this.getLinks();
  }

  getLinks() {
    this.setState({
      selectLoading: true,
    });
    axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/issue_link_types`)
      .then((res) => {
        this.setState({
          selectLoading: false,
          originLinks: res,
        });
        this.transform(res);
      });
  }

  transform(links) {
    // split active and passive
    const active = links.map(link => ({
      name: link.outWard,
      linkTypeId: link.linkTypeId,
    }));
    const passive = [];
    links.forEach((link) => {
      if (link.inWard !== link.outWard) {
        passive.push({
          name: link.inWard,
          linkTypeId: link.linkTypeId,
        });
      }
    });
    this.setState({
      active,
      passive,
      show: active.concat(passive),
    });
  }

  handleSelect(value, option) {
    const selected = _.map(option.slice(), v => v.key);
    this.setState({ selected });
  }

  onFilterChange(input) {
    if (!sign) {
      this.setState({
        selectLoading: true,
      });
      loadIssuesInLink(0, 20, this.props.issueId, input).then((res) => {
        this.setState({
          originIssues: res.content,
          selectLoading: false,
        });
      });
      sign = true;
    } else {
      this.debounceFilterIssues(input);
    }
  }

  debounceFilterIssues = _.debounce((input) => {
    this.setState({
      selectLoading: true,
    });
    loadIssuesInLink(0, 20, this.props.issueId, input).then((res) => {
      this.setState({
        originIssues: res.content,
        selectLoading: false,
      });
    });
  }, 500);

  handleCreateIssue = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { linkTypeId, issues } = values;
        const labelIssueRelDTOList = _.map(this.state.selected, (issue) => {
          const currentLinkType = _.find(this.state.originLinks, { linkTypeId: linkTypeId.split('+')[0] * 1 });
          if (currentLinkType.outWard === linkTypeId.split('+')[1]) {
            return ({
              linkTypeId: linkTypeId.split('+')[0] * 1,
              linkedIssueId: issue * 1,
              issueId: this.props.issueId,
            });
          } else {
            return ({
              linkTypeId: linkTypeId.split('+')[0] * 1,
              issueId: issue * 1,
              linkedIssueId: this.props.issueId,
            });
          }
        });
        this.setState({ createLoading: true });
        createLink(this.props.issueId, labelIssueRelDTOList)
          .then((res) => {
            this.setState({ createLoading: false });
            this.props.onOk();
          });
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { initValue, visible, onCancel, onOk } = this.props;

    return (
      <Sidebar
        className="c7n-newLink"
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
            {/* <a href="#" rel="nofollow me noopener noreferrer" target="_blank" className="c7n-external-link">
              <span className="c7n-external-link-content">
              了解详情
              </span>
              <Icon type="open_in_new" />
            </a> */}
          </p>
          <Form layout="vertical">
            <FormItem label="关系" style={{ width: 520 }}>
              {getFieldDecorator('linkTypeId', {})(
                <Select
                  label="关系"
                  // labelInValue
                  loading={this.state.selectLoading}
                >
                  {this.state.show.map(link =>
                    (<Option key={`${link.linkTypeId}+${link.name}`} value={`${link.linkTypeId}+${link.name}`}>
                      {link.name}
                    </Option>),
                  )}
                </Select>,
              )}
            </FormItem>

            <FormItem label="问题" style={{ width: 520 }}>
              {getFieldDecorator('issues', {})(
                <Select
                  label="问题"
                  mode="multiple"
                  loading={this.state.selectLoading}
                  optionLabelProp="value"
                  filter
                  filterOption={false}
                  onFilterChange={this.onFilterChange.bind(this)}
                  onChange={this.handleSelect.bind(this)}
                >
                  {this.state.originIssues.map(issue =>
                    (<Option
                      key={issue.issueId}
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
