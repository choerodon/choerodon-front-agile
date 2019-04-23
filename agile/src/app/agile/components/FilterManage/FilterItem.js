import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Input, Form, Icon } from 'choerodon-ui';
import './FilterItem.scss';

const FormItem = Form.Item;
class FilterItem extends Component {
  state = {
    editing: false,
    newName: '',
  }

  handleChange = (e) => {
    this.setState({
      newName: e.target.value,
    });
  }

  handleSubmit = () => {
    const { newName } = this.state;
  }

  handleCancel = () => {
    this.setState({
      editing: false,
    });
  }

  handleEdit = () => {
    this.setState({
      editing: true,
    });
  }

  render() {
    const { editing } = this.state;
    const { filter, form, onSubmit } = this.props;
    const { getFieldDecorator } = form;
    const { name } = filter;
    return (
      <div className="c7nagile-FilterItem">
        {editing
          ? <Input style={{ flex: 1 }} defaultValue={name} onChange={this.handleChange} autoFocus maxLength="10" />
          : <div className="c7nagile-FilterItem-text">{name}</div>
        }
        {
          editing ? (
            <Fragment>
              <Icon type="check" onClick={this.handleSubmit} />
              <Icon type="close" onClick={this.handleCancel} />
            </Fragment>
          )
            : (
              <Fragment>
                <Icon type="mode_edit" onClick={this.handleEdit} />
                <Icon type="delete_forever" onClick={this.handleDelete} />
              </Fragment>
            )
        }
      </div>
    );
  }
}

FilterItem.propTypes = {

};

export default Form.create({})(FilterItem);
