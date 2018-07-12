import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Button, DatePicker, Tabs, Table, Popover, Modal, Radio, Form, Select, Icon, Spin } from 'choerodon-ui';
import moment from 'moment';
import TypeTag from '../../../../components/TypeTag';

const FileSaver = require('file-saver');

const TabPane = Tabs.TabPane;
const { Sidebar } = Modal;
const RadioGroup = Radio.Group;
const FormItem = Form.Item;
const Option = Select.Option;
const { AppState } = stores;

const A = ['issue_epic', 'story', 'task', 'bug', 'sub_task'];
const Name = ['史诗', '故事', '任务', '故障', '子任务'];
let str;

@observer
class ReleaseLogs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      version: {},
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
    this.loadVersion();
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

  loadVersion() {
    const projectId = AppState.currentMenuType.id;
    const versionId = this.props.match.params.id;
    axios.get(`/agile/v1/projects/${projectId}/product_version/${versionId}`)
      .then((res) => {
        this.setState({ version: res });
      });
  }

  splitIssues(issues) {
    A.forEach((e) => {
      const subset = _.filter(issues, { typeCode: e });
      this.setState({ [e]: subset });
    });
  }

  export() {
    str = '';

    str += '# 发布日志\n\n';
    str += `## [${this.state.version.name}]`;
    if (this.state.version.statusCode === 'released') {
      str += ` - ${this.state.version.releaseDate}\n`;
    } else {
      str += '\n';
    }

    // str += '### 史诗\n';

    // arr.forEach((v) => {
    //   str += `- [${v.issueNum}]-${v.summary}\n`;
    // });
    A.forEach((v, i) => this.combine(v, i));
    const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
    FileSaver.saveAs(blob, 'test.md');
  }

  combine(typeCode, i) {
    if (this.state[typeCode].length) {
      str += `\n### ${Name[i]}\n`;
      this.state[typeCode].forEach((v) => {
        str += `- [${v.issueNum}]-${v.summary}\n`;
      });
    }
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
          <Button 
            funcTyp="flat" 
            onClick={() => {
              // fresh
              this.export();
            }}
          >
            <Icon type="library_books" />
            <span>导出</span>
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

