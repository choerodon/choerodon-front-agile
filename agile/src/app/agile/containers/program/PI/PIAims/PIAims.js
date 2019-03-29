import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Icon, Table, Radio, Form, Spin, Modal, Select,
} from 'choerodon-ui';
import {
  stores, Page, Header, Content,  
} from 'choerodon-front-boot';
import moment from 'moment';

import PIStore from '../../../../stores/Program/PI/PIStore';
import { 
  getPIAims, deletePIAims, getPIList,
} from '../../../../api/PIApi';
import { getArtsByProjectId } from '../../../../api/ArtApi';
import ProgramAimsTable from './component/ProgramAimsTable';
import PIAimsCard from './component/PIAimsCard';
import EmptyBlock from '../../../../components/EmptyBlock';
import emptyPI from '../../../../assets/image/emptyPI.svg';
import CreatePIAims from '../CreatePIAims/CreatePIAims';

import './PIAims.scss';
import EditPIAims from '../EditPIAims';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const { Option } = Select;
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
class PIAims extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showType: 'list',
      editingPiAimsInfo: {},
      deletePIAimsModalVisible: false,
      deleteRecord: undefined,
      selectedPIId: undefined,
    };
  }

  componentDidMount() {
    PIStore.setPIAimsLoading(true);
    getArtsByProjectId().then((res) => {
      const doingArt = res.content.find(item => item.statusCode === 'doing');
      const artId = doingArt ? doingArt.id : res.content[0].id;
      getPIList(artId).then((PIList) => {
        PIStore.setPIList(PIList.content);
        this.setState({
          selectedPIId: PIList.content[0] && PIList.content[0].id,
        });
        this.getPIAims(PIList.content[0] && PIList.content[0].id);
      });
    });
  }

  getPIAims = (id) => {
    if (id) {
      PIStore.setPIAimsLoading(true);
      getPIAims(id).then((res) => {
        PIStore.setPIAimsLoading(false);
        PIStore.setPIAims(res);
        PIStore.setEditPiAimsCtrl(res.program.map((item, index) => (
          {
            isEditing: false,
            editingId: item.id,
            editingIndex: index,  
          }
        )));
      });
    } else {
      PIStore.setPIAimsLoading(false);
    }
  }

  handlePISelectChange = (value) => {
    this.setState({
      selectedPIId: value,
      showType: 'list',
    }, () => {
      this.getPIAims(value);
    });
  }

  handleRadioChange = (e) => {
    this.setState({
      showType: e.target.value,
    });
  }

  handleEditPiAims = (record) => {
    const { editPiAimsCtrl } = PIStore;
    // eslint-disable-next-line no-shadow
    const { PIAims } = PIStore;
    const { editingIndex } = editPiAimsCtrl.find(item => item.editingId === record.id);
    editPiAimsCtrl.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.isEditing = false;
    });
    editPiAimsCtrl[editingIndex].isEditing = true;
    PIStore.setEditPiAimsCtrl(editPiAimsCtrl);
    this.setState({
      editingPiAimsInfo: PIAims.program[editingIndex],
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
    PIStore.setPIAimsLoading(true);
    deletePIAims(deleteRecord.id).then(() => {
      getPIAims(deleteRecord.piId).then((piAims) => {
        PIStore.setPIAimsLoading(false);
        PIStore.setPIAims(piAims);
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
      PIStore.setPIAimsLoading(false);
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
      showType, editingPiAimsInfo, deletePIAimsModalVisible, deleteRecord, selectedPIId,
    } = this.state;
    const {
      // eslint-disable-next-line no-shadow
      PIList, PIAims, PIAimsLoading, editPIVisible, 
    } = PIStore;
    const selectedPI = selectedPIId && PIList.find(item => item.id === selectedPIId);
    
    return (
      <Page className="c7n-pi-detail">
        <Header title="PI目标">
          <Button funcType="flat" disabled={!PIList || !PIList.length} onClick={this.handleCreateFeatureBtnClick}>
            <Icon type="playlist_add" />
            <span>创建PI目标</span>
          </Button>
          <Button funcType="flat" onClick={() => { this.getPIAims(selectedPIId); }}>
            <Icon type="refresh icon" />
            <span>刷新</span>
          </Button>
        </Header>
        <Content>
          <Spin spinning={PIAimsLoading}>
            {
              PIList && PIList.length > 0 ? (
                <div>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', height: 32, marginBottom: 20, 
                  }}
                  >
                    <Select onChange={this.handlePISelectChange} value={selectedPIId} dropdownClassName="c7n-pi-piSelect">
                      {
                        PIList.map(pi => (
                          <Option key={pi.id} value={pi.id}>{`${pi.code}-${pi.name}`}</Option>
                        ))
                      }
                    </Select>
                    {
                      PIAims.program && PIAims.program.length > 0 && (
                        <RadioGroup className="c7n-pi-showTypeRadioGroup" onChange={this.handleRadioChange} defaultValue="list">
                          <RadioButton value="list">列表</RadioButton>
                          <RadioButton value="card">卡片</RadioButton>
                        </RadioGroup>
                      )
                    }
                  </div>
                  {
                  showType === 'list' ? (
                    <div>
                      <ProgramAimsTable
                        amisColumns={amisColumns}
                        dataSource={PIAims.program}
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
                  ) : (
                    <PIAimsCard 
                      aimsCategory="program"
                      piName={`${selectedPI.code}-${selectedPI.name}`}
                      aimsInfo={PIAims.program.filter(item => !item.stretch)}
                      stretchAimsInfo={PIAims.program.filter(item => item.stretch)}
                    />
                  )
                }
                </div>
              ) : (
                <EmptyBlock
                  style={{ marginTop: 60 }} 
                  pic={emptyPI}
                  border
                  textWidth={421}
                  title="设置各个阶段的PI目标"
                  des="这是您的PI目标列表。您可以创建各个阶段的PI目标，用数字衡量目标的价值，并随时调整。"
                />
              )
            }
          </Spin>
         
          <CreatePIAims 
            piId={selectedPIId}
          />
          <EditPIAims editingPiAimsInfo={editingPiAimsInfo} editPIVisible={editPIVisible} />
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

export default Form.create()(PIAims);
