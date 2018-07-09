import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Button, DatePicker, Tabs, Table, Popover, Modal, Radio, Form, Select, Icon, Spin } from 'choerodon-ui';
import moment from 'moment';
import TypeTag from '../../../../components/TypeTag';

const TabPane = Tabs.TabPane;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { AppState } = stores;

const A = ['issue_epic', 'story', 'task', 'bug', 'sub_task'];

@observer
class ReleaseLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issues: [],
      issue_epic: [],
      story: [],
      task: [],
      bug: [],
      sub_task: [],
    };
  }
  componentDidMount() {
    this.loadIssues();
  }

  loadIssues() {
    const projectId = AppState.currentMenuType.id;
    const versionId = this.props.match.params.id;
    axios.get(`/agile/v1/projects/${projectId}/product_version/${versionId}/issues`)
      .then((res) => {
        this.setState({ issues: res });
        this.splitIssues(res);
      });
  }

  splitIssues(issues) {
    A.forEach((e) => {
      const subset = _.filter(issues, { typeCode: e });
      this.setState({ [e]: subset });
    });
  }

  renderSubsetIssues(typeCode) {
    return (
      <div>
        <div style={{ margin: '17px 0' }}>
          <TypeTag
            type={{
              typeCode,
            }}
            showName
          />
        </div>
        <ul style={{ marginBottom: 0, paddingLeft: 45 }}>
          {
            this.state[typeCode].map(issue => (
              <li style={{ marginBottom: 16 }}>
                <span>[</span>
                <a href="#">{issue.issueNum}</a>
                <span>]</span>
                {` - ${issue.summary}`}
              </li>
            ))
          }
        </ul>
      </div>
    );
  }

  render() {
    return (
      <Page>
        <Header 
          title="版本日志"
        >
          <Button 
            funcTyp="flat" 
            onClick={() => {
              // fresh
              this.loadIssues();
            }}
          >
            <Icon type="refresh" />
            <span>刷新</span>
          </Button>
          
        </Header>
        <Content
          title="项目“猪齿鱼开发” 的版本日志"
          description="您可以在此查看版本的版本日志，并进行修改。"
          link="#"
        >
          {
            A.map(e => (
              <div>
                {
                  this.renderSubsetIssues(e)
                }
              </div>
            ))
          }
        </Content>
      </Page>
    );
  }
}

export default ReleaseLogs;

