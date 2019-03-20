import React, { Component } from 'react';
import moment from 'moment';
import { observer, inject } from 'mobx-react';
import EasyEdit from '../../../../../../../components/EasyEdit/EasyEdit';
// import BacklogStore from '../../../../../stores/project/backlog/BacklogStore';

@inject('AppState', 'HeaderStore')
@observer class SprintDateRange extends Component {
  handleUpdateDate = (type, dateString) => {
    const { handleChangeDateRange } = this.props;
    handleChangeDateRange(type, dateString);
  };

  componentWillUpdate(nextProps, nextState, nextContext) {

  }

  render() {
    const { statusCode, startDate, endDate } = this.props;
    return statusCode === 'started' ? (
      <div
        className="c7n-backlog-sprintData"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
        }}
      >
        <EasyEdit
          type="date"
          time
          defaultValue={startDate ? moment(startDate, 'YYYY-MM-DD HH-mm-ss') : ''}
          disabledDate={endDate ? current => current > moment(endDate, 'YYYY-MM-DD HH:mm:ss') : ''}
          onChange={(date, dateString) => {
            this.handleUpdateDate('startDate', dateString);
            // this.updateDate('startDate', dateString, item);
          }}
        >
          <div
            className="c7n-backlog-sprintDataItem"
            role="none"
          >
            {startDate ? moment(startDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss') : '无'}
          </div>
        </EasyEdit>
        <p>~</p>
        <EasyEdit
          type="date"
          time
          defaultValue={endDate ? moment(endDate, 'YYYY-MM-DD HH-mm-ss') : ''}
          disabledDate={startDate ? current => current < moment(startDate, 'YYYY-MM-DD HH:mm:ss') : ''}
          onChange={(date, dateString) => {
            this.handleUpdateDate('endDate', dateString);
            // this.updateDate('endDate', dateString, item);
          }}
        >
          <div
            className="c7n-backlog-sprintDataItem"
            role="none"
          >
            {endDate ? moment(endDate, 'YYYY-MM-DD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss') : '无'}
          </div>
        </EasyEdit>
      </div>
    ) : null;
  }
}

export default SprintDateRange;
