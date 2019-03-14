import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Page, Header, Content } from 'choerodon-front-boot';
import { isEqual } from 'lodash';
import {
  Icon, Button, Progress, Spin,
} from 'choerodon-ui';
import moment from 'moment';
import { artListLink } from '../../../../common/utils';
import { getPIList } from '../../../../api/PIApi';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import './ArtCalendar.scss';

class ArtCalendar extends Component {
  state={
    data: null,
    startDate: null,
    endDate: null,
  }

  componentDidMount() {
    this.loadArt();
  }

  loadArt = () => {
    this.setState({
      loading: true,
    });
    getPIList().then((res) => {
      const data = res.content.reverse();
      const { startDate, endDate } = this.getDuring(data);
      this.setState({
        loading: false,      
        data,
        startDate, 
        endDate,
      });
    });
  }

  getDuring=(data) => {
    const startDate = data.length > 0 ? data[0].startDate : moment();
    const endDate = data.length > 0 ? data[data.length - 1].endDate : moment();
    return {
      startDate,
      endDate,
    };
  }

  render() {
    const {
      data, loading, startDate,
      endDate,
    } = this.state;
    console.log(data);
    return (
      <Page className="c7nagile-ArtCalendar">
        <Header
          title="ART日历"
          backPath={artListLink()}
        />
        <Content style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {data ? (
          // <Spin spinning={loading}>
          //   sss
          // </Spin>
          
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="c7nagile-ArtCalendar-bar">
                {'项目A敏捷发布火车'}
              </div>
              <div className="c7nagile-ArtCalendar-scroller">
                <div className="c7nagile-ArtCalendar-calendar">
                  <CalendarHeader
                    startDate={startDate}
                    endDate={endDate}
                  />
                  <CalendarBody
                    data={data}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
              </div>
            </div>
          ) : <Progress type="loading" className="spin-container" />}
        </Content>
      </Page>
    );
  }
}

ArtCalendar.propTypes = {

};

export default ArtCalendar;
