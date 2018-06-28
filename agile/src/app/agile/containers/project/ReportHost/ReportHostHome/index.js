import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Menu, Dropdown, Icon } from 'choerodon-ui';
import { Page, Header, Content, stores } from 'choerodon-front-boot';
import './ReportHostHome.scss';
import burndownPic from '../../../../assets/image/burndowchart.svg';
import sprintPic from '../../../../assets/image/sprint.svg';

const { AppState } = stores;

@observer
class ReportHostHome extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  handleClickItem(item) {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    history.push(`${item.link}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}`);
  }
  render() {
    const menu = (
      <Menu>
        <Menu.Item>
            燃尽图
        </Menu.Item>
        <Menu.Item>
            Sprint报表
        </Menu.Item>
      </Menu>
    );
    const data = [{
      id: 1,
      title: '燃尽图',
      des: '跟踪记录所有问题的剩余工作工作时间，预估完成冲刺任务的可能性，回顾总结迭代过程中的经验与不足。这有助于在团队管理方面取得更进一步的掌控与把握。',
      link: '/agile/reporthost/burndownchart',
      pic: burndownPic,
    }, {
      id: 2,
      title: 'Sprint报告',
      des: '了解每个冲刺中完成、进行和退回待办的工作。这有助于您确定您团队的工作量是否超额，更直观的查看冲刺的范围与工作量。',
      link: '/agile/reporthost/sprintReport',
      pic: sprintPic,
    }];
    return (
      <Page>
        <Header title="所有报告">
          {/* <div>
            <Dropdown overlay={menu} trigger="click" placement="bottomCenter">
              <div style={{ cursor: 'pointer' }}>
                <Icon type="arrow_drop_down" />
                切换报表
              </div>
            </Dropdown>
          </div> */}
        </Header>
        <Content
          title="所有报告"
          description="这里会根据您项目的进展情况以多个维度直观地记录和展示您项目、迭代、版本、进度等汇总情况。点击您需要查看的报告类型可以查看具体的详细内容。"
          // link="#"
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {
              data.map(item => (
                <div
                  className="c7n-reporthost-item"
                  style={{
                    cursor: 'pointer',
                  }}
                  role="none"
                  onClick={this.handleClickItem.bind(this, item)}
                >
                  <div
                    className="c7n-reporthost-itempic"
                    style={{
                      backgroundImage: `url(${item.pic})`,
                    }}
                  />
                  <div className="c7n-reporthost-itembottom">
                    <p className="c7n-reporthost-itemtitle">{item.title}</p>
                    <p className="c7n-reporthost-itemdes">{item.des}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </Content>
      </Page>
    );
  }
}

export default ReportHostHome;

