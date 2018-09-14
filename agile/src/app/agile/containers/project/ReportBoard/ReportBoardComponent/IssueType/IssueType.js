import React, { Component } from 'react';
import ReactEcharts from 'echarts-for-react';
import Card from '../Card';
import './IssueType.scss';

class IssueType extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  loadData() {

  }

  getOption() {
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b} : {c} ({d}%)',
        backgroundColor: '#fff',
        borderColor: '#ddd',
        borderWidth: 1,
        textStyle: {
          fontSize: 12,
          color: '#000',
        },
        extraCssText: 'box-shadow: 0 2px 4px 0 rgba(0,0,0,0.20)',
      },
    
      series: [
        {
          name: '访问来源',
          type: 'pie',
          radius: '55%',
          center: ['50%', '60%'],
          data: [
            { value: 335, name: '直接访问' },
            { value: 310, name: '邮件营销' },
            { value: 234, name: '联盟广告' },
            { value: 135, name: '视频广告' },
            { value: 1548, name: '搜索引擎' },
          ],
        },
      ],
    };
    
    return option;
  }

  render() {
    return (
      <div className="c7n-reportBoard-IssueType">
        <div className="c7n-IssueType-content">
          <ReactEcharts 
            style={{ height: 230 }}
            option={this.getOption()}
          />
        </div>
      </div>
    );
  }
}

export default IssueType;
