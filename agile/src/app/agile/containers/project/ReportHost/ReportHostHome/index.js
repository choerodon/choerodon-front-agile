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
      des: '跟踪全部剩余工作并且计划完成sprint目标的可能性。这有助于您的团队管理方面取得的进展和作出相应的反应。',
      link: '/agile/reporthost/burndownchart',
      pic: burndownPic,
    }, {
      id: 2,
      title: 'Sprint报告',
      des: '了解每个sprint中完成的工作或者退回后备的工作。这有助于您确定您的团队是过量使用或如果有过多的范围扩大。',
      link: '/agile/reporthost/sprintReport',
      pic: sprintPic,
    }];
    return (
      <Page>
        <Header title="所有报表">
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
          description="根据项目需求，可以分拆为多个模块，每个模块可以进行负责人划分，配置后可以将项目中的问题归类到对应的模块中。例如“后端任务”，“基础架构”等等。"
          link="#"
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

