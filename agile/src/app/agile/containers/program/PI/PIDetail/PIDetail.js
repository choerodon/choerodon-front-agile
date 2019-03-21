import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Icon, Table, Radio, Divider, Form, Input, Card, Tooltip, Spin, Modal,
} from 'choerodon-ui';
import {
  stores, Page, Header, Content,  
} from 'choerodon-front-boot';
import moment from 'moment';

import CreatePI from '../CreatePI';
import PIStore from '../../../../stores/Program/PI/PIStore';
import { PIListLink } from '../../../../common/utils';
import { 
  createPIAims, getPIAims, upDatePIAmix, deletePIAims,
} from '../../../../api/PIApi';
import ProgramAimsTable from './component/ProgramAimsTable';

import './PIDetail.scss';
import EditPI from '../EditPI';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { AppState } = stores;
const amisColumns = [
  {
    title: 'PI目标',
    dataIndex: 'name',
  },
  {
    title: '计划商业价值',
    dataIndex: 'planBv',
    render: text => text || '-',
  },
  {
    title: '实际商业价值',
    dataIndex: 'actualBv',
    render: text => text || '-',
  },
  {
    title: '创建时间',
    dataIndex: 'creationDate',
    render: text => moment(text).format('YYYY-MM-DD') || '-',
  },
  {
    title: '最后更新时间',
    dataIndex: 'lastUpdateDate',
    render: text => moment(text).format('YYYY-MM-DD') || '-',
  },
];
@observer
class PIDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showType: 'list',
      piName: undefined,
      editingPiAimsInfo: {},
      deletePIAimsModalVisible: false,
      deleteRecord: undefined,
    };
  }

  componentDidMount() {
    this.getPIAims();
  }

  getPIAims = () => {
    let { PiList } = PIStore;
    PiList = JSON.parse(sessionStorage.PiList) || PiList;
    const pi = PiList.find(item => item.id === Number(this.props.match.params.id));
    PIStore.setPIDetailLoading(true);
    getPIAims(pi.id).then((res) => {
      PIStore.setPIDetailLoading(false);
      PIStore.setPiAims(res);
      PIStore.setEditPiAimsCtrl(res.program.map((item, index) => (
        {
          isEditing: false,
          editingId: item.id,
          editingIndex: index,  
        }
      )));
      this.setState({
        piName: pi.name,
      });
    });
  }

  handleRadioChange = (e) => {
    this.setState({
      showType: e.target.value,
    });
  }

  handleEditPiAims = (record) => {
    const { editPiAimsCtrl } = PIStore;
    const { PiAims } = PIStore;
    const { editingIndex } = editPiAimsCtrl.find(item => item.editingId === record.id);
    editPiAimsCtrl.forEach((item) => {
      item.isEditing = false;
    });
    editPiAimsCtrl[editingIndex].isEditing = true;
    PIStore.setEditPiAimsCtrl(editPiAimsCtrl);
    this.setState({
      editingPiAimsInfo: PiAims.program[editingIndex],
    }, () => {
      PIStore.setEditPIVisible(true);
    });
  }

  handledeletePiAims = (record) => {
    this.setState({
      deletePIAimsModalVisible: true,
      deleteRecord: record,
    });
  }

  handleDeleteOk = () => {
    const { deleteRecord } = this.state;
    PIStore.setPIDetailLoading(true);
    deletePIAims(deleteRecord.id).then(() => {
      getPIAims(deleteRecord.piId).then((piAims) => {
        PIStore.setPIDetailLoading(false);
        PIStore.setPiAims(piAims);
        PIStore.setEditPiAimsCtrl(piAims.program.map((item, index) => (
          {
            isEditing: false,
            editingId: item.id,
            editingIndex: index,  
          }
        )));
      });
      this.setState({
        deletePIAimsModalVisible: false,
        deleteRecord: undefined,
      });
      Choerodon.prompt('删除成功');
    }).catch(() => {
      PIStore.setPIDetailLoading(false);
      Choerodon.prompt('删除失败');
    });
  }

  handleDeleteCancel = () => {
    this.setState({
      deletePIAimsModalVisible: false,
      deleteRecord: undefined,
    });
  }

  handldLinkToPIDetail = () => {
    const { history } = this.props;
    const urlParams = AppState.currentMenuType;
    history.push(encodeURI(`/agile/pi?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`));
  }

  handleCreateFeatureBtnClick = () => {
    PIStore.setCreatePIVisible(true);
  }

  renderTeamPIAimsTable = dataSource => (
    <Table
      filterBar={false}
      rowKey={record => record.id}
      columns={amisColumns}
      dataSource={dataSource}
      pagination={false}
    />
  )

  render() {
    const {
      showType, piName, editingPiAimsInfo, deletePIAimsModalVisible, deleteRecord,
    } = this.state;
    const piId = this.props.match.params.id;
    const {
      PiList, PiAims, PIDetailLoading, editPIVisible, 
    } = PIStore;
    const teamDataSource = PiAims.teamAims;
    const teamAimsColumns = [{
      title: '团队名称',
      dataIndex: 'teamName',
    }];
    return (
      <Page className="c7n-pi-detail">
        <Header title={`${piName || ''}目标`} backPath={PIListLink()}>
          <Button funcType="flat" onClick={this.handleCreateFeatureBtnClick}>
            <Icon type="playlist_add" />
            <span>创建PI目标</span>
          </Button>
          <Button funcType="flat" onClick={this.getPIAims}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content>
          {/* <RadioGroup className="c7n-pi-showTypeRadioGroup" onChange={this.handleRadioChange} defaultValue="list">
            <RadioButton value="list">列表</RadioButton>
            <RadioButton value="card">卡片</RadioButton>
          </RadioGroup>
          <Divider style={{ margin: '7px 0 20px' }} /> */}
          <Spin spinning={PIDetailLoading}>
            {/* {
            showType === 'list' && ( */}
            <div>
              <ProgramAimsTable
                amisColumns={amisColumns}
                dataSource={PiAims.program}
                onEditPiAims={this.handleEditPiAims}
                onDeletePiAims={this.handledeletePiAims}
              />

              {/* <div className="c7n-pi-teamAims" style={{ marginTop: 20 }}>
                  <Table 
                    filterBar={false}
                    rowKey={record => record.teamId}
                    columns={teamAimsColumns}
                    dataSource={teamDataSource}
                    pagination={false}
                    expandedRowRender={record => this.renderTeamPIAimsTable.bind(this, record.teamProgramAims)()}
                  />
                </div> */}
            </div>
            {/* )
            } */}
          </Spin>
          <CreatePI 
            piId={piId}
            page="PIDetail"
          />
          <EditPI editingPiAimsInfo={editingPiAimsInfo} editPIVisible={editPIVisible} />
          <Modal
            title="删除PI目标"
            visible={deletePIAimsModalVisible}
            onOk={this.handleDeleteOk}
            onCancel={this.handleDeleteCancel}
            center
          >
            <p>{`确定要删除 ${deleteRecord && deleteRecord.name} 吗？`}</p>
          </Modal>
        </Content>
      </Page>
    );
  }
}

export default Form.create()(PIDetail);
