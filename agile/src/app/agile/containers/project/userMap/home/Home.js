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
      moreMenuShow: false,
      scrollPosition: 'fixed',
    };
  }
  componentDidMount() {
    this.initData();
    // window.addEventListener('scroll', this.handleScroll, true);
    // window.onscroll = this.handleScroll;
  }
  initData =() => {
    this.props.UserMapStore.initData();
  };

  addFilter = () => {

  };
  handleScroll = (e) => {
    const position = this.state.scrollPosition;
    const ele = document.getElementById('map-content');
    if (ele.scrollLeft !== 0 && position !== 'absolute') {
      this.setState({ scrollPosition: 'absolute' });
      window.console.log('左右');
    }
    if (ele.scrollTop !== 0 && position !== 'fixed') {
      this.setState({ scrollPosition: 'fixed' });
      window.console.log('上下');
    }
  };
  changeMode =(options) => {
    this.props.UserMapStore.setMode(options.key);
  };
  handleCreateEpic = () => {
    this.props.UserMapStore.setCreateEpic(true);
  };

  addFilter =(e) => {
    const { currentFilters } = this.props.UserMapStore;
    const arr = _.cloneDeep(currentFilters);
    const value = e._dispatchInstances.key;
    if (currentFilters.includes(value)) {
      const index = arr.indexOf(value);
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }
    this.props.UserMapStore.setCurrentFilter(arr);
  };

  changeMenuShow =(options) => {
    const { moreMenuShow } = this.state;
    this.setState({ moreMenuShow: !moreMenuShow });
  };

  filterIssue =(e) => {
    e.stopPropagation();
  };
  render() {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const { filters, mode, issues, createEpic, currentFilters } = UserMapStore;
    window.console.log(createEpic);
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable>
        <Menu.Item key="no">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    const moreMenu = (
      <Menu style={{ padding: '20px 14px' }}>
        <div className="menu-title">史诗过滤器</div>
        <Menu.Item key="1"> <Checkbox>已完成的史诗</Checkbox></Menu.Item>
        <Menu.Item key="2"><Checkbox>应用快速搜索到史诗</Checkbox></Menu.Item>
        <div className="menu-title">导出</div>
        <Menu.Item key="3">导出成excel</Menu.Item>
        <Menu.Item key="4">导出为图片</Menu.Item>
      </Menu>
    );
    return (
      <Page
        className="c7n-map"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Dropdown overlay={swimlanMenu} trigger={['click']}>
            <Button>
              {mode === 'no' && '无泳道'}
              {mode === 'version' && '版本泳道'}
              {mode === 'sprint' && '冲刺泳道'}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <Button onClick={this.changeMenuShow}>
            更多 <Icon type="arrow_drop_down" />
          </Button>
          <div style={{ display: this.state.moreMenuShow ? 'block' : 'none', padding: '20px 14px' }} className="moreMenu">
            <div className="menu-title">史诗过滤器</div>
            <div style={{ height: 22, marginBottom: 10 }}>
              <Checkbox>已完成的史诗</Checkbox>
            </div>
            <div style={{ height: 22 }} >
              <Checkbox>应用快速搜索到史诗</Checkbox>
            </div>
            <div className="menu-title">导出</div>
            <div style={{ height: 22, marginBottom: 10 }}>导出为excel</div>
            <div style={{ height: 22, marginBottom: 10 }}>导出为图片</div>
          </div>
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
            <Icon type="playlist_add" />创建史诗
          </Button>
        </Header>
        <div className="c7n-userMap" onScroll={this.handleScroll} id="map-content">
          <div style={{ position: 'fixed', width: '100%', height: 48, zIndex: 1200, overflow: 'hidden', top: 106, background: 'white' }}>
            <section className="c7n-usermap-quickFilter">
              <div className="filter">
                <p>快速搜索:</p>
                <p role="none" style={{ background: `${currentFilters.includes('onlyMe') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('onlyMe') ? 'white' : '#3F51B5'}` }} onClick={this.addFilter} key={'onlyMe'}>仅我的问题</p>
                <p role="none" style={{ background: `${currentFilters.includes('onlyStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('onlyStory') ? 'white' : '#3F51B5'}` }} onClick={this.addFilter} key={'onlyStory'}>仅用户故事</p>
                {filters.map(filter => <p role="none" style={{ background: `${currentFilters.includes(filter.filterId.toString()) ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes(filter.filterId.toString()) ? 'white' : '#3F51B5'}` }} onClick={this.addFilter} key={filter.filterId}>{filter.name}</p>) }
              </div>
            </section>
          </div>
          <div className="wrap">
            <div style={{ display: 'flex', height: 82, marginTop: 48 }}>
              <div>
                {epicData.length && epicData.map(epic => (
                  <div className="epic-card">
                    {epic.epicName}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ width: '100%', height: 900, background: 'black' }}>
              <div>
kfkkf
              </div>
            </div>
          </div>
        </div>
        <CreateEpic visible={createEpic} />
      </Page>
    );
  }
}
export default Home;
