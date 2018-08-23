import React, { Component } from 'react';
import {
  Progress, Select, Tooltip, Menu, Dropdown, Icon, 
} from 'choerodon-ui';
import { DashBoardNavBar } from 'choerodon-front-boot';
import ReactEcharts from 'echarts-for-react';
import './VersionProgress.scss';

const Option = Select.Option;

class VersionProgress extends Component {
  constructor(props) {
    super(props);
    this.state = {
      versionList: [],
      option: {},
    };
  }

  componentDidMount() {
    this.setState({
      option: {
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
            radius: ['30%', '50%'],
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
              { value: 100, name: '待处理' },
              { value: 200, name: '处理中' },
              { value: 300, name: '已完成' },
            ],
            itemStyle: { 
              normal: { 
                borderColor: '#FFFFFF', borderWidth: 1, 
              },
            },
          },
        ],
      },
      versionList: [
        {
          versionId: 1,
          name: 'v0.9.0',
        },
        {
          versionId: 2,
          name: 'v0.8.0',
        },
        {
          versionId: 2,
          name: 'v0.8.0',
        },
      ],
    });
  }
  
  render() {
    const menu = (
      <Menu>
        {
          this.state.versionList.map(item => <Menu.Item key={item.versionId}>{item.name}</Menu.Item>)
        }
      </Menu>
    );
    
    return (
      <div className="c7n-VersionProgress">
        <div className="switchVersion">
          <Dropdown overlay={menu}>
            <a className="ant-dropdown-link" href="#">

切换版本
              <Icon type="arrow_drop_down" />
              {' '}
            </a>
          </Dropdown>
        </div>
        <div className="charts">
          <ReactEcharts
            option={this.state.option}
          />
          {/* <div className="charts-inner">
                版本v0.9.0
          </div> */}
        </div>
        <DashBoardNavBar>
          <a target="choerodon" href="http://choerodon.io/zh/docs/">转至发布版本</a>
        </DashBoardNavBar>
      </div>
    );
  }
}
export default VersionProgress;
