import React, { Component } from 'react';
import {
  Select, Menu, Dropdown, Icon, Spin, Tooltip,
} from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import EmptyBlockDashboard from '../../../components/EmptyBlockDashboard';
import pic from './no_version.svg';
import './VersionProgress.scss';

const { AppState } = stores;
const { Option } = Select;

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

  loadData() {
    const projectId = AppState.currentMenuType.id;
    axios.get(`agile/v1/projects/${projectId}/product_version/versions`)
      .then((res) => {
        const latestVersionId = Math.max(...res.map((item => item.versionId)));
        if (latestVersionId !== -Infinity) {
          this.loadSelectData(latestVersionId);
        }
        this.setState({
          versionList: res,
          currentVersionId: latestVersionId,
          loading: false,
        });
      });  
  }

  loadSelectData(versionId) {
    const projectId = AppState.currentMenuType.id;
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

  getOption() {
    const currentVersion = this.state.currentVersion;
    const option = {
      // legend: {
      //   orient: 'vertical',
      //   // x: 'right',
      //   x: 'left',
      //   // left: 30,

      //   // x: 'left',
      //   // x: 120,
      //   padding: [50, 75],
      //   align: 'left',
      //   data: ['待处理', '处理中', '已完成'],
      //   itemWidth: '20',
      //   itemHeight: '20',
      //   itemGap: 29,
      //   textStyle: {
      //     fontSize: '13',
      //   },
      // },
      series: [
        {
          // name: '访问来源',
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: ['38px', '65px'],
          avoidLabelOverlap: false,
          hoverAnimation: false,
          // legendHoverLink: false,
          center: ['35%', '35%'],
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
    const {
      versionList, currentVersion, currentVersionId, loading, 
    } = this.state;
    const urlParams = AppState.currentMenuType;
    const menu = (
      <Menu onClick={this.handleMenuClick}>
        {
          versionList.map(item => <Menu.Item key={item.versionId}><Tooltip title={item.name} placement="topRight"><span className="c7n-menuItem">{item.name}</span></Tooltip></Menu.Item>)
        }
      </Menu>
    );
    return (
      <div className="c7n-VersionProgress">
        {
         currentVersionId >= 0 ? (
           loading ? (
             <div className="c7n-loadWrap">
               <Spin />
             </div>
           ) : (
             <React.Fragment>
               <div className="switchVersion">
                 <Dropdown overlay={menu} trigger={['click']}>
                   <a className="ant-dropdown-link c7n-agile-dashboard-versionProgress-select">
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
             
           )
         ) : (
           <div className="c7n-emptyVersion">
             <EmptyBlockDashboard pic={pic} des="当前没有版本" />
           </div>
         )
        }    
        <DashBoardNavBar>
          <a target="choerodon" onClick={() => this.props.history.push(`/agile/release?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`)}>转至发布版本</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
export default withRouter(VersionProgress);
