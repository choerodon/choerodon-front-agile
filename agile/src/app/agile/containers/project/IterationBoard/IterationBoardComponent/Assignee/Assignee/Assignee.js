import React, { Component } from 'react';
import {
  Select, Menu, Dropdown, Icon, Spin, Tooltip,
} from 'choerodon-ui';
import { DashBoardNavBar, stores, axios } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import EmptyBlockDashboard from '../../../../../../components/EmptyBlockDashboard';
import pic from './no_version.svg';
import './Assignee.scss';

const { AppState } = stores;
const { Option } = Select;

class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#fff',
        textStyle: {
          color: '#000',
        },
        formatter(params) {
          let res;
          res = `${params.name}：${params.value}<br/>占比： ${params.value}%`;
          return res;
        },
        extraCssText: 
          'box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.2); border: 1px solid #ddd; border-radius: 0;',
      },
      series: [
        {
          color: ['#FFB100', '#4D90FE', '#00BFA5'],
          type: 'pie',
          radius: '60px',
          hoverAnimation: false,
          center: ['50%', '50%'],
          data: [
            { value: 10, name: '15085 祁煌' },
            { value: 20, name: '12345 黄芪' },
            { value: 30, name: '66666 齐王' },
          ],
          itemStyle: {
            normal: {
              borderWidth: 2,
              borderColor: '#fff',
            },
        }
        },
      ],
    };
    return option;
  }

  render() {
    const {
      loading, 
    } = this.state;
    const urlParams = AppState.currentMenuType;
    return (
      <div className="c7n-sprintDashboard-assignee">
          <ReactEcharts
            option={this.getOption()}
            style={{ height: 232 }}
          />
      </div>
    );
  }
}
export default VersionProgress;
