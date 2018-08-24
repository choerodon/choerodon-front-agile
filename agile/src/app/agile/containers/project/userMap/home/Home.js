import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content } from 'choerodon-front-boot';
import {
  Button, Popover, Dropdown, Menu, Icon, Checkbox,
} from 'choerodon-ui';
import './test.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateVOS from '../component/CreateVOS';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';

@observer
class Home3 extends Component {
  constructor(props) {
    super(props);
    this.fixbody = React.createRef();
    this.state = {
      more: false,
      expand: false,
      expandColumns: [],
      showBackLog: false,
      row: [...new Array(50).keys()],
      col: [...new Array(50).keys()],
      con: [...new Array(10).keys()],
      left: 0,
      title: '',
    };
  }

  componentDidMount() {
    // this.fixbody.current.addEventListener('scroll', this.handleScroll, {
    //   passive: true,
    // });
    const timer = setInterval(() => {
      if (document.getElementById('fixHead-body')) {
        document.getElementById('fixHead-body').addEventListener('scroll', this.handleScroll);
        clearInterval(timer);
      }
    }, 20);
  }

  handleScroll = (e) => {
    console.dir(
      document.getElementsByClassName('fixHead-line-title')[0].getBoundingClientRect().top - 350,
    );
    console.dir(
      document.getElementsByClassName('fixHead-line-title')[28].getBoundingClientRect().bottom,
    );
    const left = e.target.scrollLeft;
    const top = e.target.scrollTop;
    const title = this.state.row[Math.floor(top / 202)];
    this.setState({
      left,
    });
    document.getElementById('fixHead-head').scrollLeft = left;
    const lines = document.getElementsByClassName('fixHead-line-title');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].getBoundingClientRect().top - 350 >= -55) {
        console.log(i);
        this.setState({
          title: lines[i - 1].dataset.title,
        });
        break;
      }
    }
  };

  render() {
    const { showBackLog } = this.state;
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    _.sortBy(epicData, 'rink');
    const {
      filters, mode, issues, createEpic, currentFilters, sprints, versions
    } = UserMapStore;
    return (
      <Page
        className="c7n-userMap"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Button className="leftBtn" functyp="flat">
            <Icon type="playlist_add" />

            创建史诗
          </Button>
        </Header>
        <Content>
          <div id="qqq" className="fixHead">
            <div className="fixHead-head" id="fixHead-head">
              <div className="fixHead-line">
                <div className="fixHead-line-content">
                  {this.state.col.map(e => (
                    <div className="fixHead-block" key={e}>
                      <h1>{`i am epic${e}`}</h1>
                    </div>
                  ))}
                </div>
              </div>
              <div
                className="fixHead-line fixHead-line-2"
                style={{
                  transform: `translateX(${`${this.state.left}px`})`,
                }}
              >
                <div className="fixHead-head-note">

                  1111
                  {this.state.title}
                </div>
              </div>
            </div>
            <div className="fixHead-body" id="fixHead-body">
              {this.state.row.map(e => (
                <div className="fixHead-line" key={e}>
                  <div
                    className="fixHead-line-title"
                    style={{
                      marginLeft: `${this.state.left}px`,
                    }}
                    data-title={e}
                  >
                    {e}
                  </div>
                  <div className="fixHead-line-content">
                    {this.state.col.map(e => (
                      <div className="fixHead-block" key={e}>
                        {this.state.con.map(ee => (
                          <h1>{ee}</h1>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Content>
      </Page>
    );
  }
}
export default Home3;
