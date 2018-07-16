import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores, Page, Header, Content, Permission, axios } from 'choerodon-front-boot';
import { Button, Icon, Tabs } from 'choerodon-ui';
import ProjectSetting from '../SettingComponent/ProjectSetting';
import Search from '../SettingComponent/Search';
import Link from '../SettingComponent/Link';
import TableCanDragAndDrop from '../SettingComponent/TableCanDragAndDrop';
import TableCouldDragAndDrop from '../SettingComponent/TableCouldDragAndDrop';
import CreateTest from '../SettingComponent/CreateTest';

const FileSaver = require('file-saver');

const { AppState } = stores;
const TabPane = Tabs.TabPane;

@observer
class SettingHome extends Component {
  constructor(props) {
    super(props);
    this.state = {
      url: undefined,
    };
  }

  handleClick() {
    const projectId = AppState.currentMenuType.id;
    // axios({
    //   method: 'post',
    //   url: 'http://gateway.hitsm.cloud.saas.hand-china.com/hitsm/v1/project/275/eventOrder/exportEventOrders?organizationId=302',
    //   headers: {
    //     Authorization: 'bearer c7144b0b-1f34-40cc-90d1-ac63dec15efd',
    //   },
    //   data: {
    //     state: '',
    //   },
    //   responseType: 'arraybuffer', 
    //   timeout: 60000,
    // })
    axios.post(`/agile/v1/projects/${projectId}/issues/export`, {}, { responseType: 'arraybuffer' })
      .then((data) => {
        const blob = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const fileName = 'test.xls';
        FileSaver.saveAs(blob, fileName);
        // const blob = new Blob(['\uFEFF' + res], { type: 'application/ms-excel;charset=utf-8' });
        // const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8' });
        // const href = window.URL.createObjectURL(blob);
        // this.setState({
        //   url: href,
        // });
      });
  }

  // md() {
  //   const arr = [
  //     {
  //       issueNum: 'AG-1',
  //       summary: '我是任务一我是任务一我是任务一我是任务一',
  //       typeCode: 'story',
  //     },
  //     {
  //       issueNum: 'AG-2',
  //       summary: '我是任务二我是任务二我是任务二我是任务二',
  //       typeCode: 'story',
  //     },
  //   ];
  //   let str = '';

  //   str += '# 发布日志\n\n';
  //   str += '## [0.7.0] - 2018-06-29\n\n';

  //   str += '### 史诗\n';

  //   arr.forEach((v) => {
  //     str += `- [${v.issueNum}]-${v.summary}\n`;
  //   });
  //   const blob = new Blob([str], { type: 'text/plain;charset=utf-8' });
  //   FileSaver.saveAs(blob, 'test.md');
  // }

  render() {
    return (
      <Page>
        <Header title="测试">
          <Button funcTyp="flat">
            <Icon type="refresh" />刷新
          </Button>
        </Header>
        <Content
          title="张建测试"
          description="给张建的测试"
          // link="#"
        >
          <Button funcTyp="flat" onClick={() => this.handleClick()}>
            <Icon type="refresh" />获取
          </Button>
          <a href={this.state.url}>url</a>
          {/* <Button funcTyp="flat" onClick={() => this.md()}>
            <Icon type="refresh" />生成md
          </Button> */}
          {/* <TableCanDragAndDrop />
          <div style={{ marginTop: 50 }} />
          <TableCouldDragAndDrop />
          <CreateTest
            issueId={7031}
            nextRank={null}
          /> */}
        </Content>
      </Page>
    );
  }
}

export default SettingHome;

