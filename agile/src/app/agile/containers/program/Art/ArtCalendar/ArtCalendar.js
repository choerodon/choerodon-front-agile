import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Page, Header, Content } from 'choerodon-front-boot';
import { find } from 'lodash';
import {
  Icon, Button, Progress, Spin,
} from 'choerodon-ui';
import moment from 'moment';
import { artListLink, getParams } from '../../../../common/utils';
import { getArtCalendar } from '../../../../api/ArtApi';
import CalendarHeader from './CalendarHeader';
import CalendarBody from './CalendarBody';
import './ArtCalendar.scss';

class ArtCalendar extends Component {
  state = {
    ArtName: null,
    data: null,
    currentPI: null,
    startDate: null,
    endDate: null,
  }

  componentDidMount() {
    this.loadArt();
  }

  loadArt = () => {
    const { id } = this.props.match.params;
    const { ArtName } = getParams(window.location.href);
    getArtCalendar(id).then((res) => {
      const data = res;
      const { startDate, endDate } = this.getDuring(data);
      this.setState({
        data,
        ArtName,
        currentPI: find(data, { statusCode: 'doing' }),
        startDate,
        endDate,
      });
    });
  }

  getDuring = (data) => {
    const startDate = data.length > 0 ? data[0].startDate : moment();
    const endDate = data.length > 0 ? data[data.length - 1].endDate : moment().add(1, 'days');
    return {
      startDate,
      endDate,
    };
  }

  render() {
    const {
      data, startDate, 
      currentPI, ArtName,
      endDate,
    } = this.state;
    return (
      <Page className="c7nagile-ArtCalendar">
        <Header
          title="ART日历"
          backPath={artListLink()}
        />
        <Content style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
          {data ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="c7nagile-ArtCalendar-bar">
                <span style={{ fontSize: '16px' }}>{ArtName && ArtName}</span>
                <span style={{ margin: '0 40px' }}>
                  开始日期：
                  {startDate && moment(startDate).format('YYYY-MM-DD')}
                </span>
                {currentPI && (
                  <span>
                    正在进行中的PI：
                    {currentPI.name}
                  </span>
                )}
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
