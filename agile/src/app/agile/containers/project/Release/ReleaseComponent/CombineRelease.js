import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Modal, Form, Select, message } from 'choerodon-ui';
import { stores, Content } from 'choerodon-front-boot';
import _ from 'lodash';
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
  handleCombine(e) {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        window.console.log(value);
        if (value.source.length === 1) {
          if (value.source[0] === value.destination) {
            message.error('合并版本不能一样');
            return;
          }
        }
        const data = {
          sourceVersionIds: _.clone(value.source).map(Number),
          targetVersionId: parseInt(_.clone(value.destination), 10),
        };
        if (data.sourceVersionIds.indexOf(data.targetVersionId) !== -1) {
          data.sourceVersionIds.splice(data.sourceVersionIds.indexOf(data.targetVersionId), 1);
        }
        ReleaseStore.axiosMergeVersion(data).then((res) => {
          window.console.log(res);
          this.props.onCancel();
          this.props.refresh();
        }).catch((error) => {
          window.console.log(error);
        });
      }
    });
  }
  judgeSelectDisabled(item) {
    if (this.props.form.getFieldValue('source')) {
      if (this.props.form.getFieldValue('source').length === 1 && this.props.form.getFieldValue('source')[0] === item.versionId) {
        return true;
      }
    }
    return false;
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
        onOk={this.handleCombine.bind(this)}
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
                    <Option
                      value={String(item.versionId)}
                    >{item.name}</Option>
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

