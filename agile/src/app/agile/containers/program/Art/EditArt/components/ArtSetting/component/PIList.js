import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Button, Icon } from 'choerodon-ui';
import moment from 'moment';
import { getPIList } from '../../../../../../../api/PIApi';
import { createPI } from '../../../../../../../api/ArtApi';
import PIListTable from './PIListTable';
import CreatePIModal from './CreatePIModal';
import StatusTag from '../../../../../../../components/StatusTag';

const formatter = 'YYYY-MM-DD';
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
      PIList: [],
      createPIModalVisible: false,
    };
  }

  componentDidMount() {
    const { artId } = this.props;
    this.getPIList(artId);
  }

  getPIList = (artId) => {
    getPIList(artId).then((res) => {
      this.setState({
        PIList: res.content.map(item => (
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
    createPI(artId, startDate).then(() => {
      this.getPIList(artId);
      this.setState({
        createPIModalVisible: false,
      });
    });
  }

  render() {
    // eslint-disable-next-line no-shadow
    const { PIList, createPIModalVisible } = this.state;
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
        <Button funcType="flat" style={{ marginBottom: 15, color: '#3F51B5' }} onClick={this.handleCreatePIClick}>
          <Icon type="playlist_add" />
          <span>创建下一批PI</span>
        </Button>
        <PIListTable 
          columns={columns}
          dataSource={PIList}
        />
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
