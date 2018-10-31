import React, { Component } from 'react';
import { stores, axios, Content } from 'choerodon-front-boot';
import _ from 'lodash';
import { Select, Form, Modal } from 'choerodon-ui';
import { createLink, loadIssuesInLink } from '../../api/NewIssueApi';
import TypeTag from '../TypeTag';
import './CreateLinkTask.scss';

const { AppState } = stores;
const { Sidebar } = Modal;
const { Option } = Select;
const FormItem = Form.Item;
let sign = false;

class CreateLinkTask extends Component {
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
    const {
      initValue, visible, onCancel, onOk, 
    } = this.props;

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
        <Content
          style={{ padding: 0 }}
          title="对问题创建链接"
          description="请在下面输入相关任务的基本信息，包括所要创建的关系（复制、阻塞、关联、破坏、被复制、被阻塞、被破坏等）以及所要关联的问题（支持多选）。"
        >
          <Form layout="vertical">
            <FormItem label="关系" style={{ width: 520 }}>
              {getFieldDecorator('linkTypeId', {
                rules: [
                  { required: true, message: '请选择所要创建的关系' },
                ],
              })(
                <Select
                  label="关系"
                  loading={this.state.selectLoading}
                >
                  {this.state.show.map(link => (
                    <Option key={`${link.linkTypeId}+${link.name}`} value={`${link.linkTypeId}+${link.name}`}>
                      {link.name}
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>

            <FormItem label="问题" style={{ width: 520 }}>
              {getFieldDecorator('issues', {
                rules: [
                  { required: true, message: '请选择所要关联的问题' },
                ],
              })(
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
                  {this.state.originIssues.map(issue => (
                    <Option
                      key={issue.issueId}
                      value={issue.issueNum}
                    >
                      <div style={{
                        display: 'inline-flex', width: '100%', flex: 1, alignItems: 'center', 
                      }}
                      >
                        <TypeTag
                          data={issue.issueTypeDTO}
                        />
                        <span style={{
                          paddingLeft: 12, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', 
                        }}
                        >
                          {issue.issueNum}
                        </span>
                        <div style={{ overflow: 'hidden', flex: 1 }}>
                          <p style={{
                            paddingRight: '25px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 0, maxWidth: 'unset', 
                          }}
                          >
                            {issue.summary}
                          </p>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}
export default Form.create({})(CreateLinkTask);
