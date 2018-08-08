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
    this.initData();
  }
  initData =() => {
    this.props.UserMapStore.initData();
  };

  addFilter = () => {

  };

  changeMode =() => {

  };
  handleCreateEpic = () => {

  };
  render() {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const { filters } = UserMapStore;
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable>
        <Menu.Item key="1">无泳道</Menu.Item>
        <Menu.Item key="2">版本泳道</Menu.Item>
        <Menu.Item key="3">冲刺泳道</Menu.Item>
      </Menu>
    );
    const moreMenu = (
      <Menu onClick={this.filterIssue} style={{ padding: '20px 14px' }}>
        <div className="menu-title">问题过滤</div>
        <Menu.Item key="1"> <Checkbox>待处理</Checkbox></Menu.Item>
        <Menu.Item key="2"><Checkbox>处理中</Checkbox></Menu.Item>
        <Menu.Item key="2"><Checkbox>已完成</Checkbox></Menu.Item>
        <div className="menu-title">史诗过滤器</div>
        <Menu.Item key="1"> <Checkbox>已完成的史诗</Checkbox></Menu.Item>
        <Menu.Item key="2"><Checkbox>应用快速搜索到史诗</Checkbox></Menu.Item>
        <div className="menu-title">导出</div>
        <Menu.Item key="1">导出成excel</Menu.Item>
        <Menu.Item key="2">导出为图片</Menu.Item>
      </Menu>
    );
    return (
      <Page
        className="c7n-map"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Dropdown overlay={swimlanMenu} trigger={'click'}>
            <Button>
              无泳道 <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <Dropdown overlay={moreMenu} trigger={'click'}>
            <Button>
              更多 <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
            <Icon type="playlist_add" />创建史诗
          </Button>

        </Header>
        <div className="c7n-userMap">
          <section className="c7n-usermap-quickFilter">
            <div className="filter">
              <p>快速搜索:</p>
              <p>仅我的问题</p>
              <p>仅用户故事</p>
              {filters.map(filter => <p>{filter.name}</p>) }
            </div>
          </section>
          <section className="content">
            <div style={{ display: 'flex', margin: '10px 0 12px 0' }}>
              {epicData.length && epicData.map(epic => (
                <div style={{ width: 220, marginRight: 10 }}>
                  <div className="epic-card">
                    {epic.epicName}
                  </div>
                </div>
              ))}
            </div>
            <div className="swimlan-title">
              <p>C7N sprint1</p>
            </div>
            <div className="swimlan-column">
              {epicData.length && epicData.map(epic => (
                <div className="swimlan-column-item">
                  <div className="epic-card">
                    Add new or existing issue
                  </div>

                </div>
              ))}
            </div>
          </section>
        </div>
        <CreateEpic visble={this.state.createEpic} />
      </Page>
    );
  }
}
export default Home;
