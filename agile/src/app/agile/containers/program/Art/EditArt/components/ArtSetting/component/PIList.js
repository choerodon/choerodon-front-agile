import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Icon, Form } from 'choerodon-ui';
import moment from 'moment';
import _ from 'lodash';
import { createPI } from '../../../../../../../api/ArtApi';
import PIListTable from './PIListTable';
import CreatePIModal from './CreatePIModal';
import StatusTag from '../../../../../../../components/StatusTag';

const STATUS = {
  todo: '未开启',
  doing: '进行中',
  done: '已完成',
};
@observer
class PIList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createPIModalVisible: false,
    };
  }

  handleCreatePIClick = () => {
    this.setState({
      createPIModalVisible: true,
    });
    this.form.resetFields();
  }

  handleCreatePICancel = () => {
    this.setState({
      createPIModalVisible: false,
    });
  }

  handleCreatePIOK = (startDate) => {
    const { artId, onGetPIList, onGetArtInfo } = this.props;
    createPI(artId, startDate).then(() => {
      onGetPIList(artId);
      onGetArtInfo(artId);
      this.setState({
        createPIModalVisible: false,
      });
    });
  }

  render() {
    const { createPIModalVisible } = this.state;
    // eslint-disable-next-line no-shadow
    const { name, PiList, data } = this.props;
    const nonEmpty = Object.keys(_.pick(data, ['startDate', 'piCount', 'piCodePrefix', 'piCodeNumber', 'interationCount', 'interationWeeks', 'ipWeeks'])).every(key => data[key]);
    const columns = [
      {
        title: 'PI名称',
        dataIndex: 'name',
        render: (text, record) => (<a role="none">{`${record.code}-${record.name}`}</a>),
      },
      {
        title: '状态',
        dataIndex: 'statusCode',
        render: statusCode => <StatusTag categoryCode={statusCode} name={STATUS[statusCode]} />,
      },
      {
        title: '剩余天数',
        dataIndex: 'remainDays',
      },
      {
        title: '开始日期',
        dataIndex: 'startDate',
      },
      {
        title: '结束日期',
        dataIndex: 'endDate',
      },
    ];
    return (
      <React.Fragment>
        <Button funcType="flat" type="primary" style={{ marginBottom: 15 }} disabled={!nonEmpty} onClick={this.handleCreatePIClick}>
          <Icon type="playlist_add" />
          <span>创建下一批PI</span>
        </Button>
        <PIListTable 
          columns={columns}
          dataSource={PiList}
        />
        <CreatePIModal
          ref={(form) => { this.form = form; }}
          name={name} 
          visible={createPIModalVisible}
          defaultStartDate={PiList && PiList[0] && PiList[0].endDate}
          onCreatePIOk={this.handleCreatePIOK}
          onCreatePICancel={this.handleCreatePICancel}
        />
      </React.Fragment>
    );
  }
}

export default PIList;
