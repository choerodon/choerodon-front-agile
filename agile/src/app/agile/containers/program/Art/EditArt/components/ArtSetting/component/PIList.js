import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Icon, Table, Spin,
} from 'choerodon-ui';
import {
  stores, Page, Header, Content,  
} from 'choerodon-front-boot';
import moment from 'moment';
import { getPIList } from '../../../../../../../api/PIApi';
import { createPI } from '../../../../../../../api/ArtApi';
import PIListTable from './PIListTable';
import CreatePIModal from './CreatePIModal';
import StatusTag from '../../../../../../../components/StatusTag';

const formatter = 'YYYY-MM-DD';
const { AppState } = stores;
const STATUS = {
  todo: '未启用',
  doing: '进行中',
  done: '已完成',
};
@observer
class PIList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      PiList: [],
      createPIModalVisible: false,
    };
  }

  componentDidMount() {
    this.getPIList();
  }

  getPIList = () => {
    getPIList().then((res) => {
      this.setState({
        PiList: res.content.map(item => (
          Object.assign(item, {
            startDate: moment(item.startDate).format(formatter),
            endDate: moment(item.endDate).format(formatter),
            remainDays: this.calcRemainDays(item),
          })
        )),
      });
    });
  }

  calcRemainDays = (item) => {
    let diff = 0;
    if (moment(item.startDate).diff(moment()) > 0) {
      diff = moment(item.endDate).diff(moment(item.startDate), 'days');
      return diff > 0 ? diff : 0;
    } else {
      diff = moment(item.endDate).diff(moment(), 'days');
      return diff > 0 ? diff : 0;
    }
  }


  handleCreatePIClick = () => {
    this.setState({
      createPIModalVisible: true,
    });
  }

  handleCreatePICancel = () => {
    this.setState({
      createPIModalVisible: false,
    });
  }

  handleCreatePIOK = (startDate) => {
    const { artId } = this.props;
    createPI(artId, startDate).then((res) => {
      this.getPIList();
      this.setState({
        createPIModalVisible: false,
      });
    });
  }

  render() {
    const { PiList, createPIModalVisible } = this.state;
    const { name } = this.props;
    const columns = [
      {
        title: 'PI名称',
        dataIndex: 'name',
        render: (text, record) => (<a role="none">{`${record.code}-${record.name}`}</a>),
      },
      {
        title: '状态',
        dataIndex: 'statusCode',
        render: (statusCode, record) => <StatusTag categoryCode={statusCode} name={STATUS[statusCode]} />,
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
        <PIListTable 
          columns={columns}
          dataSource={PiList}
        />
        <Button funcType="flat" style={{ marginTop: 15, color: '#3F51B5' }} onClick={this.handleCreatePIClick}>
          <Icon type="playlist_add" />
          <span>添加PI</span>
        </Button>
        <CreatePIModal
          name={name} 
          visible={createPIModalVisible}
          onCreatePIOk={this.handleCreatePIOK}
          onCreatePICancel={this.handleCreatePICancel}
        />
      </React.Fragment>
    );
  }
}

export default PIList;
