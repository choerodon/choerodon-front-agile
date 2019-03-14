import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Icon, Table, Spin,
} from 'choerodon-ui';
import {
  stores, Page, Header, Content,  
} from 'choerodon-front-boot';
import moment from 'moment';
import CreatePI from '../CreatePI';
import PIStore from '../../../../stores/Program/PI/PIStore';
import { PIDetailLink } from '../../../../common/utils';
import { createPIAims, getPIList } from '../../../../api/PIApi';

const formatter = 'YYYY-MM-DD';
const { AppState } = stores;
@observer
class PIList extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    PIStore.setPIListLoading(true);
    getPIList().then((res) => {
      PIStore.setPIListLoading(false);
      PIStore.setPiList(res.content.map(item => (
        Object.assign(item, {
          startDate: moment(item.startDate).format(formatter),
          endDate: moment(item.endDate).format(formatter),
          remainDays: moment(item.endDate).diff(moment(), 'days') > 0 ? moment(item.endDate).diff(moment(), 'days') : 0,
        })
      )));
    });
  }

  handldLinkToPIDetail = (record) => {
    const { history } = this.props;
    history.push(PIDetailLink(record.id));
  }

  handleCreateFeatureBtnClick = () => {
    PIStore.setCreatePIVisible(true);
  }

  onOKOrCancel = () => {
    PIStore.setCreatePIVisible(false);
  }

  render() {
    const { PIListLoading } = PIStore;
    const { PiList } = PIStore;
    const columns = [
      {
        title: 'PI名称',
        dataIndex: 'name',
        render: (text, record) => (<a role="none" onClick={this.handldLinkToPIDetail.bind(this, record)}>{text}</a>),
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
      <Page>
        <Header title="PI列表">
          <Button funcType="flat" onClick={this.handleCreateFeatureBtnClick}>
            <Icon type="playlist_add" />
            <span>创建PI目标</span>
          </Button>
        </Header>
        <Content>
          <Spin spinning={PIListLoading}>
            <Table
              filterBar={false}
              rowKey={record => record.id}
              columns={columns}
              dataSource={PiList}
              PIListLoading={PIListLoading}
            />
          </Spin>
          <CreatePI 
            page="PIList"
          />
        </Content>
      </Page>
    );
  }
}

export default PIList;
