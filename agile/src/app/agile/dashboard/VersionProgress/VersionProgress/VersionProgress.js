import React, { Component } from 'react';
import {
  Menu, Dropdown, Icon, Spin, Tooltip,
} from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import EmptyBlockDashboard from '../../../components/EmptyBlockDashboard';
// import pic from './no_version.svg';
import pic from '../../../assets/image/emptyChart.svg';
import './VersionProgress.scss';

const { AppState } = stores;

class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      versionList: [],
      currentVersionId: 0,
      currentVersion: {},
      loading: true,
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getOption() {
    const { currentVersion } = this.state;
    const option = {
      series: [
        {
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: ['38px', '68px'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '42%'],
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

  renderContent = () => {
    const {
      versionList, currentVersion, currentVersionId, loading, 
    } = this.state;

    const menu = (
      <Menu forceSubMenuRender onClick={this.handleMenuClick} className="menu">
        {
          versionList.map(item => <Menu.Item key={item.versionId}><Tooltip title={item.name} placement="topRight"><span className="c7n-menuItem">{item.name}</span></Tooltip></Menu.Item>)
        }
      </Menu>
    );

    if (loading) {
      return (
        <div className="c7n-loadWrap">
          <Spin />
        </div>
      );
    }
    if (currentVersionId >= 0) {
      return (
        <React.Fragment>
          <div className="switchVersion">
            <Dropdown overlay={menu} trigger={['click']} getPopupContainer={triggerNode => triggerNode.parentNode}>
              <a className="ant-dropdown-link c7n-agile-dashboard-versionProgress-select">
                {' 切换版本 '}
                <Icon type="arrow_drop_down" />
              </a>
            </Dropdown>
          </div>
          <div className="charts">
            <ReactEcharts
              style={{ height: 200 }}
              option={this.getOption()}
            />
            <div className="charts-inner">
              <span>版本</span>
              {/* <span></span> */}
              <Tooltip title={currentVersion && currentVersion.name} placement="bottom">
                <span className="charts-inner-versionName">{currentVersion && currentVersion.name}</span>
              </Tooltip>
            </div> 
            <ul className="charts-legend">
              <li>
                <div />
                {'待处理'}
              </li>
              <li>
                <div />
                {'处理中'}
              </li>
              <li>
                <div />
                {'已完成'}
              </li>
            </ul>
          </div>
        </React.Fragment>
      );
    }
    return (
      <div className="c7n-emptyVersion">
        <EmptyBlockDashboard pic={pic} des="当前没有版本" />
      </div>
    );
  }
 
  loadData() {
    const { projectId } = AppState.currentMenuType;
    axios.get(`agile/v1/projects/${projectId}/product_version/versions`)
      .then((res) => {
        const latestVersionId = Math.max(...res.filter(item => item.statusCode !== 'archived').map((item => item.versionId)));
        if (latestVersionId !== -Infinity) {
          this.loadSelectData(latestVersionId);
        }
        this.setState({
          versionList: res.filter(item => item.statusCode !== 'archived'),
          currentVersionId: latestVersionId,
          loading: false,
        });
      });  
  }

  loadSelectData(versionId) {
    const { projectId } = AppState.currentMenuType;
    this.setState({
      loading: true,
    });
   
    axios.get(`agile/v1/projects/${projectId}/product_version/${versionId}/issue_count`)
      .then((res) => {
        this.setState({
          currentVersion: res,
          loading: false,
        });
      });
  }
  
  
  render() {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    const {
      type, name, id, organizationId,
    } = urlParams;
    
    return (
      <div className="c7n-VersionProgress">
        {
          this.renderContent()
        }    
        <DashBoardNavBar>
          <a 
            role="none"
            onClick={() => history.push(`/agile/release?type=${type}&id=${id}&name=${encodeURIComponent(name)}&organizationId=${organizationId}`)}
          >
            {'转至发布版本'}
          </a>
        </DashBoardNavBar>
      </div>
    );
  }
}
export default withRouter(VersionProgress);
