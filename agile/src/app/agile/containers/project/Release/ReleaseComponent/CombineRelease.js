import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Select } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import ReleaseStore from '../../../../stores/project/release/ReleaseStore';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const Option = Select.Option;

@observer
class CombineRelease extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sourceList: [],
    };
  }
  componentWillMount() {
    ReleaseStore.axiosGetVersionListWithoutPage().then((res) => {
      window.console.log(res);
      this.setState({
        sourceList: res,
      });
    }).catch((error) => {
      window.console.log(error);
    });
  }
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Sidebar
        title="合并版本"
        okText="合并"
        cancelText="取消"
        visible={this.props.visible}
        onCancel={this.props.onCancel.bind(this)}
      >
        <Content
          style={{
            padding: 0,
          }}
          title={`在项目“${AppState.currentMenuType.name}”中合并版本`}
          description="请在下面输入应用模板编码、名称、描述，创建默认最简模板。您也可以通过复制于现有模板，以便节省部分共同操作，提升效率。"
          link="#"
        >
          <p style={{ display: 'flex', alignItems: 'center' }}><span className="c7n-release-icon">!</span>一旦版本合并后，您就无法还原。</p>
          <Form style={{ width: '512px' }}>
            <FormItem>
              {getFieldDecorator('source', {
                rules: [{
                  required: true,
                  message: '合并版本是必须的',
                }],
              })(
                <Select
                  mode="tags"
                  label="合并版本"
                >
                  {this.state.sourceList.length > 0 ? this.state.sourceList.map(item => (
                    <Option value={String(item.versionId)}>{item.name}</Option>
                  )) : ''}
                </Select>,
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('destination', {
                rules: [{
                  required: true,
                  message: '合并至版本是必须的',
                }],
              })(
                <Select
                  label="合并至版本"
                >
                  {this.state.sourceList.length > 0 ? this.state.sourceList.map(item => (
                    <Option value={String(item.versionId)}>{item.name}</Option>
                  )) : ''}
                </Select>,
              )}
            </FormItem>
          </Form>
        </Content>
      </Sidebar>
    );
  }
}

export default Form.create()(CombineRelease);

