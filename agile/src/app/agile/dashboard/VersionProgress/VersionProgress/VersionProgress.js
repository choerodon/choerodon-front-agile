import React, { Component } from 'react';
import {
  Progress, Select, Tooltip, Menu, Dropdown, Icon, 
} from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import './VersionProgress.scss';

const { AppState } = stores;
const Option = Select.Option;

class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      versionList: [],
      currentVersionId: 0,
      currentVersion: {},
    };
  }

  componentDidMount() {
    this.loadData();
  }

  loadData() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/product_version/versions`)
      .then((res) => {
        const latestVersionId = Math.max(...res.map((item => item.versionId)));
        this.loadSelectData(latestVersionId);
        this.setState({
          versionList: res,
          currentVersionId: latestVersionId,
        });
      });  
  }

  loadSelectData(versionId) {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/product_version/${versionId}/issue_count`)
      .then((res) => {
        this.setState({
          currentVersion: res,
        });
      });  
  }

  getOption() {
    const currentVersion = this.state.currentVersion;
    const option = {
      legend: {
        orient: 'vertical',
        x: 'right',
        // right: '4%',
        // top: '115',
        padding: [90, 75],
        align: 'right',
        data: ['待处理', '处理中', '已完成'],
        itemWidth: '20',
        itemHeight: '20',
        itemGap: 29,
        textStyle: {
          fontSize: '13',
        },
      },
      series: [
        {
          // name: '访问来源',
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: ['45px', '75px'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '50%'],
          label: {
            normal: {
              show: false,
              position: 'center',
              textStyle: {
                fontSize: '13',
              },
            },
            emphasis: {
              show: false,
              
            },
          },
          data: [
            { value: currentVersion.todoIssueCount, name: '待处理' },
            { value: currentVersion.doingIssueCount, name: '处理中' },
            { value: currentVersion.doneIssueCount, name: '已完成' },
          ],
          itemStyle: { 
            normal: { 
              borderColor: '#FFFFFF', borderWidth: 1, 
            },
          },
        },
      ],
    };
    return option;
  }

  handleMenuClick = (e) => {
    this.setState({
      currentVersionId: e.key,
    });
    this.loadSelectData(e.key);
  }

  render() {
    const { versionList, currentVersion, history } = this.state;
    const urlParams = AppState.currentMenuType;
    console.log(`renderCurrentVersion: ${JSON.stringify(currentVersion)}`);
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {
          versionList.map(item => <Menu.Item key={item.versionId}>{item.name}</Menu.Item>)
        }
      </Menu>
    );
    
    return (
      <div className="c7n-VersionProgress">
        <div className="switchVersion">
          <Dropdown overlay={menu} trigger={['click']}>
            <a className="ant-dropdown-link" href="#">
              {' 切换版本 '}
              <Icon type="arrow_drop_down" />
            </a>
          </Dropdown>
        </div>
        <div className="charts">
          <ReactEcharts
            option={this.getOption()}
          />
          <div className="charts-inner">
            <span>版本</span>
            <span>{currentVersion && currentVersion.name}</span>
          </div> 
        </div>
        <DashBoardNavBar>
          <a target="choerodon" onClick={() => this.props.history.push(`/agile/release?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`)}>转至发布版本</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
export default withRouter(VersionProgress);
