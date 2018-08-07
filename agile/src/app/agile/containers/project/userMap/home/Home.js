import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Table, Button, Select, Popover, Tabs, Tooltip, Input, Dropdown, Menu, Pagination, Spin, Icon, Card, Checkbox } from 'choerodon-ui';
import './Home.scss';
import CreateEpic from '../component/CreateEpic';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }
  componentDidMount() {

  }

  render() {
    const epicData = [{ name: '问题管理' }, { name: '代办事项' }, { name: '报告相关' }, { name: '模块挂你' }];
    return (
      <Page
        className="c7n-map"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Button funcType="flat">
            <Icon type="autorenew icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content>
          <section className="toolbar">
            <div><Button>创建史诗</Button></div>
            <div><Select label="Select" placeholder="Please Select" allowClear style={{ width: 200 }}>
              <Option value="jack">无泳道</Option>
              <Option value="lucy">版本</Option>
              <Option value="disabled">冲刺</Option>
            </Select></div>
            <div>
              <Select label="Select" placeholder="Please Select" allowClear style={{ width: 200 }}>
                <Option value="jack">无泳道</Option>
                <Option value="lucy">版本</Option>
                <Option value="disabled">冲刺</Option>
              </Select>
            </div>
            <Button>...</Button>
            <Card style={{ display: this.state.expandMore ? 'block' : 'none' }}>
              <div>
                <p>SHOW ISSUES</p>
                <Checkbox defaultChecked={false} disabled />
                <br />
                <Checkbox defaultChecked disabled />
              </div>
              <div>
                <p>EPIC FILTER</p>
                <Checkbox defaultChecked={false} disabled />
                <br />
                <Checkbox defaultChecked disabled />
              </div>
              <div>
                <div>
                  <p>EXPORT</p>
                  <p>导出成excel</p>
                  <p>保存为图片</p>
                </div>
              </div>
            </Card>
          </section>
          <section className="content">
            <div className="wrap">
              <div className="inner">
                <div className="top">
                  {_.map(epicData, epic => (
                    <div>
                      {epic.name}
                    </div>
                  ))}
                </div>
                <div className="bottom-wrap">
                  <div className="bottom">
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                    <h5>If the above syntax looks too cumbersome, or you import react-virtualized components from a lot of places, you can also configure a Webpack alias. For example:</h5>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Content>
        <CreateEpic visble={this.state.createEpic} />
      </Page>
    );
  }
}
export default Home;
